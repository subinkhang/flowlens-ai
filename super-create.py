import json
import boto3
from typing import Dict, Any, List
import re


def lambda_handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """
    Convert text/image to React Flow JSON diagram with enhanced edge logic support
    """
    
    # Initialize Bedrock client
    bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
    
    # Extract input from event
    try:
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event
            
        input_text = body.get('text', '')
        input_image = body.get('image', None)
        language = body.get('language', 'vietnamese')
        
        # cho phép text HOẶC image
        if not input_text.strip() and not input_image:
            return create_error_response(400, 'Text input or image is required')
            
    except Exception as e:
        return create_error_response(400, f'Invalid input format: {str(e)}')
    
    try:
        # Optimized shorter prompt with focused instructions
        base_prompt = get_optimized_prompt(input_text, language)
        
        # Tạo message content cho Claude
        message_content = []
        
        if input_image:
            message_content.append({
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": detect_image_media_type(input_image),
                    "data": input_image
                }
            })
        
        message_content.append({
            "type": "text", 
            "text": base_prompt
        })
        
        # Call Bedrock Claude with improved parameters
        response = bedrock_runtime.invoke_model(
            modelId='anthropic.claude-3-sonnet-20240229-v1:0',
            body=json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 2000,  # Reduced from 3000
                "temperature": 0.1,  # Reduced from 0.3 for more consistency
                "top_p": 0.9,        # Added for better consistency
                "messages": [
                    {
                        "role": "user",
                        "content": message_content
                    }
                ]
            })
        )
        
        # Parse response
        response_body = json.loads(response['body'].read())
        generated_text = response_body['content'][0]['text']
        
        # Extract and validate JSON
        diagram_json = extract_json_from_response(generated_text)
        
        # Validate and fix diagram structure
        if not validate_diagram_structure(diagram_json):
            diagram_json = create_fallback_diagram(input_text or "Phân tích từ hình ảnh")
        else:
            # Post-process to ensure consistency
            diagram_json = post_process_diagram(diagram_json)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps({
                'success': True,
                'diagram': diagram_json,
                'metadata': {
                    'nodes_count': len(diagram_json.get('nodes', [])),
                    'edges_count': len(diagram_json.get('edges', [])),
                    'conditional_edges_count': count_conditional_edges(diagram_json),
                    'input_text': input_text[:100] + "..." if len(input_text) > 100 else input_text,
                    'has_image': bool(input_image),
                    'language': language
                }
            }, ensure_ascii=False)
        }
        
    except Exception as e:
        return create_error_response(500, f'Processing error: {str(e)}')


def get_optimized_prompt(input_text: str, language: str) -> str:
    """Generate optimized, shorter prompt based on input analysis"""
    
    # Check if input contains conditional logic keywords
    condition_keywords = [
        'nếu', 'khi', 'chỉ', 'điều kiện', 'và', 'hoặc', 'trong', 'là', 'bằng',
        'lớn hơn', 'nhỏ hơn', 'chứa', 'tồn tại', 'true', 'false', 'đúng', 'sai',
        'path', 'nhánh', 'tách', 'if', 'else', 'then', 'branch'
    ]
    
    has_conditions = any(keyword in input_text.lower() for keyword in condition_keywords)
    
    # Check for branching patterns
    has_branching = any(pattern in input_text.lower() for pattern in [
        'path a', 'path b', 'nhánh a', 'nhánh b', 'tách nhánh'
    ])
    
    # Base structure
    base_structure = """
Tạo React Flow JSON từ input. Format:
{
  "nodes": [{"id": "1", "type": "input", "data": {"label": "..."}, "position": {"x": 100, "y": 100}}],
  "edges": [{"id": "e1-2", "source": "1", "target": "2"}]
}

Node types: input, default, output
Position: x cách 250px, y cách 120px
"""
    
    # Add conditional logic only if needed
    if has_conditions:
        condition_part = """
ĐIỀU KIỆN EDGE: CHỈ khi có điều kiện cụ thể trong input, tạo data.logic và data.rules dựa trên nội dung thực tế:

QUAN TRỌNG: 
- KHÔNG tạo node riêng cho điều kiện hoặc "Tách nhánh"
- Điều kiện đặt trên EDGE, không phải NODE
- Chỉ tạo nodes cho các bước thực tế của quy trình
- Nếu có "A → điều kiện → B" thì tạo: A → B (với điều kiện trên edge)

XỬ LÝ NHÁNH:
- "A → Tách nhánh → Nếu Path A → B, Nếu Path B → C" 
- KHÔNG tạo node "Tách nhánh"
- Tạo: Node A, Node B, Node C
- Edge A→B có rule Path A, Edge A→C có rule Path B

- "A → Nếu Path A đúng → B → C → D, Nếu Path B đúng → E"
- Tạo: Node A, Node B, Node C, Node D, Node E  
- Edge A→B có rule Path A, Edge A→E có rule Path B
- Edge B→C→D bình thường

Format edge có điều kiện:
{
  "id": "e1-2",
  "source": "1", 
  "target": "2",
  "data": {
    "logic": "AND",  // OR cho "hoặc", AND cho "và"
    "rules": [
      {"id": "r1", "field": "[TRƯỜNG_TỪ_INPUT]", "operator": "[PHÉP_SO_SÁNH]", "value": "[GIÁ_TRỊ]"}
    ]
  }
}

Operators: Chứa, Không chứa, Bằng, Nằm trong, Không nằm trong, Lớn hơn, Nhỏ hơn, Sau, Trước, Là đúng, Là sai, Tồn tại, Không tồn tại

PHÂN TÍCH ĐIỀU KIỆN:
- "hoặc" → logic: "HOẶC"
- "và" → logic: "VÀ"  
- "bằng" → operator: "Bằng"
- "nhỏ hơn" → operator: "Nhỏ hơn"
- "lớn hơn" → operator: "Lớn hơn"
- "là false" → operator: "Là false"
- "là true" → operator: "Là true"
- "đúng" → operator: "Là true"
"""
        base_structure += condition_part
    
    # Add input and language
    input_part = f"""
Input: {input_text}
Language: {language}

PHÂN TÍCH QUY TRÌNH:
1. Xác định các BƯỚC THỰC TẾ (nodes) - bỏ qua "Tách nhánh", "điều kiện"
2. Xác định ĐIỀU KIỆN (đặt trên edges) - từ "nếu", "chỉ khi", "hoặc"
3. Tạo ít nodes nhất có thể - chỉ tạo cho bước thực tế

Ví dụ phân tích:
- "A → Tách nhánh → Nếu X → B, Nếu Y → C" = Node A, Node B, Node C + Edge A→B (rule X), Edge A→C (rule Y)
- "A → Nếu Path A đúng → B → C → D, Nếu Path B đúng → E" = Node A,B,C,D,E + Edge A→B (rule Path A), Edge A→E (rule Path B), Edge B→C→D

XỬ LÝ NHÁNH SONG SONG:
- Khi có nhiều path từ 1 node, tạo nhiều edges từ node đó
- Mỗi edge có rule riêng cho path tương ứng
- KHÔNG tạo node trung gian

Tạo JSON thuần với cấu trúc tối giản:"""
    
    return base_structure + input_part


def extract_condition_info(input_text: str) -> List[Dict]:
    """Extract actual condition information from input text"""
    conditions = []
    
    # Common condition patterns in Vietnamese
    condition_patterns = [
        r'nếu\s+([^→]+)→',
        r'khi\s+([^→]+)→',
        r'path\s+([a-zA-Z])\s+([^→]+)→',
        r'nhánh\s+([^→]+)→',
    ]
    
    for pattern in condition_patterns:
        matches = re.findall(pattern, input_text.lower())
        for match in matches:
            if isinstance(match, tuple):
                condition_text = ' '.join(match).strip()
            else:
                condition_text = match.strip()
            
            # Parse condition into field, operator, value
            if 'đúng' in condition_text:
                field = condition_text.replace('đúng', '').strip()
                conditions.append({
                    'field': field,
                    'operator': 'Là true',
                    'value': ''
                })
            elif 'sai' in condition_text or 'false' in condition_text:
                field = condition_text.replace('sai', '').replace('false', '').strip()
                conditions.append({
                    'field': field,
                    'operator': 'Là false',
                    'value': ''
                })
            elif '>' in condition_text:
                parts = condition_text.split('>')
                if len(parts) == 2:
                    conditions.append({
                        'field': parts[0].strip(),
                        'operator': 'Lớn hơn',
                        'value': parts[1].strip()
                    })
            elif '<' in condition_text:
                parts = condition_text.split('<')
                if len(parts) == 2:
                    conditions.append({
                        'field': parts[0].strip(),
                        'operator': 'Nhỏ hơn',
                        'value': parts[1].strip()
                    })
            elif '=' in condition_text or 'là' in condition_text:
                if '=' in condition_text:
                    parts = condition_text.split('=')
                else:
                    parts = condition_text.split('là')
                if len(parts) == 2:
                    conditions.append({
                        'field': parts[0].strip(),
                        'operator': 'Bằng',
                        'value': parts[1].strip()
                    })
            else:
                # Default condition
                conditions.append({
                    'field': condition_text,
                    'operator': 'Là true',
                    'value': ''
                })
    
    return conditions


def post_process_diagram(diagram: Dict) -> Dict:
    """Post-process diagram to ensure consistency"""
    try:
        # Ensure proper positioning
        nodes = diagram.get('nodes', [])
        for i, node in enumerate(nodes):
            if 'position' not in node:
                node['position'] = {'x': 100 + (i * 250), 'y': 100}
            
            # Ensure proper node type
            if 'type' not in node:
                if i == 0:
                    node['type'] = 'input'
                elif i == len(nodes) - 1:
                    node['type'] = 'output'
                else:
                    node['type'] = 'default'
        
        # Ensure edge IDs are unique
        edges = diagram.get('edges', [])
        for i, edge in enumerate(edges):
            if 'id' not in edge:
                edge['id'] = f"e{edge['source']}-{edge['target']}"
        
        return diagram
        
    except Exception as e:
        print(f"Post-processing error: {e}")
        return diagram


def extract_json_from_response(text: str) -> Dict:
    """Enhanced JSON extraction with multiple fallback methods"""
    try:
        # Method 1: Direct JSON parsing (most reliable)
        lines = text.strip().split('\n')
        for line in lines:
            line = line.strip()
            if line.startswith('{') and line.endswith('}'):
                try:
                    parsed = json.loads(line)
                    if 'nodes' in parsed and 'edges' in parsed:
                        return parsed
                except:
                    continue
        
        # Method 2: Find largest JSON object
        import re
        json_candidates = []
        
        # Find all potential JSON objects
        brace_level = 0
        start_pos = -1
        
        for i, char in enumerate(text):
            if char == '{':
                if brace_level == 0:
                    start_pos = i
                brace_level += 1
            elif char == '}':
                brace_level -= 1
                if brace_level == 0 and start_pos != -1:
                    json_str = text[start_pos:i+1]
                    json_candidates.append(json_str)
        
        # Try parsing candidates, prefer ones with nodes and edges
        for candidate in sorted(json_candidates, key=len, reverse=True):
            try:
                parsed = json.loads(candidate)
                if isinstance(parsed, dict) and 'nodes' in parsed and 'edges' in parsed:
                    return parsed
            except:
                continue
        
        # Method 3: Regex extraction
        json_pattern = r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}'
        matches = re.findall(json_pattern, text, re.DOTALL)
        
        for match in matches:
            try:
                parsed = json.loads(match)
                if isinstance(parsed, dict) and 'nodes' in parsed:
                    return parsed
            except:
                continue
                
    except Exception as e:
        print(f"JSON extraction error: {e}")
    
    return None


def validate_diagram_structure(diagram: Dict) -> bool:
    """Streamlined validation focusing on essential structure"""
    if not diagram or not isinstance(diagram, dict):
        return False
        
    try:
        # Check required fields
        if 'nodes' not in diagram or 'edges' not in diagram:
            return False
            
        nodes = diagram['nodes']
        edges = diagram['edges']
        
        if not isinstance(nodes, list) or not isinstance(edges, list):
            return False
            
        # Must have at least 1 node
        if len(nodes) == 0:
            return False
        
        # Quick node validation
        for node in nodes:
            if not isinstance(node, dict):
                return False
            if 'id' not in node or 'data' not in node:
                return False
            if not isinstance(node['data'], dict) or 'label' not in node['data']:
                return False
        
        # Quick edge validation
        node_ids = {node['id'] for node in nodes}
        for edge in edges:
            if not isinstance(edge, dict):
                return False
            if 'source' not in edge or 'target' not in edge:
                return False
            if edge['source'] not in node_ids or edge['target'] not in node_ids:
                return False
            
            # Quick validation for conditional edges
            if 'data' in edge and 'logic' in edge['data']:
                if edge['data']['logic'] not in ['VÀ', 'HOẶC']:
                    return False
        
        return True
        
    except Exception as e:
        print(f"Validation error: {e}")
        return False


def count_conditional_edges(diagram: Dict) -> int:
    """Count edges with conditional logic"""
    try:
        edges = diagram.get('edges', [])
        return len([edge for edge in edges if 'data' in edge and 'logic' in edge['data']])
    except:
        return 0


def detect_image_media_type(base64_data: str) -> str:
    """Detect image media type from base64 data"""
    try:
        import base64
        image_data = base64.b64decode(base64_data[:100])
        
        if image_data.startswith(b'\xff\xd8\xff'):
            return "image/jpeg"
        elif image_data.startswith(b'\x89PNG'):
            return "image/png"
        elif image_data.startswith(b'GIF8'):
            return "image/gif"
        elif image_data.startswith(b'RIFF') and b'WEBP' in image_data:
            return "image/webp"
        else:
            return "image/jpeg"
    except:
        return "image/jpeg"


def create_fallback_diagram(text: str) -> Dict:
    """Create fallback diagram when parsing fails"""
    short_text = text[:30] + "..." if len(text) > 30 else text
    
    return {
        "nodes": [
            {
                "id": "1",
                "type": "input",
                "data": {"label": short_text},
                "position": {"x": 100, "y": 100}
            },
            {
                "id": "2",
                "type": "output",
                "data": {"label": "Kết quả"},
                "position": {"x": 350, "y": 100}
            }
        ],
        "edges": [
            {
                "id": "e1-2",
                "source": "1",
                "target": "2"
            }
        ]
    }


def create_error_response(status_code: int, error_message: str) -> Dict:
    """Create standardized error response"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'success': False,
            'error': error_message
        }, ensure_ascii=False)
    }