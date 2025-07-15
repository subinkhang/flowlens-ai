import json
import boto3
from typing import Dict, Any, List, Tuple
import os

def lambda_handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """
    Analyze diagram using RAG with Knowledge Base
    """
    
    # Initialize clients
    bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
    bedrock_agent = boto3.client('bedrock-agent-runtime', region_name='us-east-1')
    
    # Extract input from event
    try:
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event
            
        diagram_json = body.get('diagram', {})
        user_question = body.get('question', 'Hãy phân tích sơ đồ này')
        
        # Validate input
        if not diagram_json:
            return create_error_response(400, 'Diagram data is required')
            
    except Exception as e:
        return create_error_response(400, f'Invalid input format: {str(e)}')
    
    try:
        # Step 1: Retrieve relevant context from Knowledge Base with source tracking
        context, sources = retrieve_from_knowledge_base_with_sources(
            bedrock_agent, 
            diagram_json, 
            user_question
        )
        
        # Step 2: Analyze with Claude + RAG context + sources
        analysis = analyze_with_claude_structured(
            bedrock_runtime, 
            diagram_json, 
            user_question, 
            context,
            sources
        )
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'analysis': analysis,
                'sources': sources,
                'metadata': {
                    'context_sources': len(context.split('\n\n')) if context else 0,
                    'diagram_complexity': calculate_complexity(diagram_json),
                    'question': user_question
                }
            }, ensure_ascii=False)
        }
        
    except Exception as e:
        return create_error_response(500, f'Analysis error: {str(e)}')

def retrieve_from_knowledge_base_with_sources(bedrock_agent, diagram_json: Dict, question: str) -> Tuple[str, List[Dict]]:
    """Retrieve relevant context from Knowledge Base with source tracking"""
    
    # Get Knowledge Base ID from environment variable
    kb_id = os.environ.get('KNOWLEDGE_BASE_ID', 'YOUR-KB-ID')
    
    # Enhanced query with diagram summary
    diagram_summary = create_diagram_summary(diagram_json)
    
    query = f"""
    Phân tích sơ đồ quy trình:
    
    Tóm tắt sơ đồ: {diagram_summary}
    Câu hỏi cụ thể: {question}
    
    Tìm thông tin về:
    - Phương pháp phân tích quy trình
    - Best practices cho loại sơ đồ này
    - Các tiêu chí đánh giá chất lượng
    - Đề xuất cải tiến
    """
    
    try:
        response = bedrock_agent.retrieve(
            knowledgeBaseId=kb_id,
            retrievalQuery={
                'text': query
            },
            retrievalConfiguration={
                'vectorSearchConfiguration': {
                    'numberOfResults': 6,
                    'overrideSearchType': 'HYBRID'
                }
            }
        )
        
        # Combine retrieved results with source tracking
        context_parts = []
        sources = []
        
        for i, result in enumerate(response['retrievalResults']):
            score = result.get('score', 0)
            if score > 0.2:
                context_parts.append(f"Nguồn {i+1}:\n{result['content']['text']}")
                
                # Extract source information
                source_info = {
                    'id': i + 1,
                    'title': result.get('location', {}).get('s3Location', {}).get('uri', '').split('/')[-1],
                    'url': result.get('location', {}).get('s3Location', {}).get('uri', ''),
                    'score': score,
                    'content_preview': result['content']['text'][:100] + "..." if len(result['content']['text']) > 100 else result['content']['text']
                }
                sources.append(source_info)
        
        context = "\n\n".join(context_parts) if context_parts else "Không tìm thấy thông tin liên quan."
        return context, sources
        
    except Exception as e:
        print(f"Knowledge Base retrieval error: {e}")
        return "Lỗi truy xuất Knowledge Base. Sử dụng kiến thức cơ bản để phân tích.", []

def create_diagram_summary(diagram_json: Dict) -> str:
    """Create concise diagram summary for KB query"""
    try:
        nodes = diagram_json.get('nodes', [])
        edges = diagram_json.get('edges', [])
        
        node_labels = [node.get('data', {}).get('label', 'Unknown') for node in nodes]
        
        return f"Sơ đồ có {len(nodes)} bước: {' -> '.join(node_labels[:5])}{'...' if len(node_labels) > 5 else ''}"
    except:
        return "Sơ đồ quy trình"

def analyze_with_claude_structured(bedrock_runtime, diagram_json: Dict, question: str, context: str, sources: List[Dict]) -> Dict:
    """Analyze diagram with Claude using RAG context and return structured JSON"""
    
    # Create source references for the prompt
    source_refs = ""
    if sources:
        source_refs = "\n\nNGUỒN THAM KHẢO:\n"
        for source in sources:
            source_refs += f"- Nguồn [{source['id']}]: {source['title']} ({source['url']})\n"
    
    # Enhanced prompt for structured output
    prompt = f"""
    Bạn là chuyên gia phân tích quy trình và sơ đồ hệ thống. Hãy phân tích chi tiết sơ đồ sau và trả về kết quả dưới dạng JSON theo schema đã định.
    
    SƠ ĐỒ CẦN PHÂN TÍCH:
    {json.dumps(diagram_json, ensure_ascii=False, indent=2)}
    
    CÂU HỎI CỦA NGƯỜI DÙNG:
    {question}
    
    KIẾN THỨC THAM KHẢO:
    {context}
    {source_refs}
    
    YÊU CẦU QUAN TRỌNG:
    1. Khi trích dẫn thông tin từ nguồn tham khảo, hãy sử dụng định dạng: "(Nguồn [số])"
    2. Trả về kết quả theo JSON schema sau:
    
    {{
        "overview": {{
            "process_name": "Tên quy trình",
            "purpose": "Mục đích và chức năng chính",
            "process_type": "Loại quy trình (tuần tự, song song, có nhánh...)",
            "complexity_level": "Độ phức tạp (Đơn giản/Trung bình/Phức tạp)",
            "scope": "Phạm vi áp dụng"
        }},
        "components": {{
            "start_event": "Sự kiện bắt đầu",
            "end_event": "Sự kiện kết thúc",
            "actors": ["Danh sách các tác nhân tham gia"],
            "steps": ["Danh sách các bước xử lý"],
            "sequence": "Mô tả trình tự thực hiện"
        }},
        "execution": {{
            "sla": "Thời gian xử lý dự kiến",
            "input_requirements": ["Yêu cầu đầu vào"],
            "output": "Kết quả đầu ra",
            "system_integration": ["Hệ thống liên quan"]
        }},
        "evaluation": {{
            "logic_coherence": "Đánh giá tính logic và mạch lạc",
            "completeness": "Đánh giá tính đầy đủ",
            "risks": ["Danh sách rủi ro có thể xảy ra"],
            "controls": ["Các điểm kiểm soát"],
            "compliance": "Tuân thủ quy định"
        }},
        "improvement": {{
            "bottlenecks": ["Điểm nghẽn cần cải thiện"],
            "optimization_opportunities": ["Cơ hội tối ưu hóa"],
            "automation_possibility": "Khả năng tự động hóa",
            "kpis": ["Chỉ số đánh giá hiệu suất"]
        }},
        "summary": {{
            "conclusion": "Kết luận tổng thể",
            "recommendations": ["Khuyến nghị quan trọng"]
        }}
    }}
    
    Hãy phân tích chi tiết và trả về JSON hoàn chỉnh. Nhớ trích dẫn nguồn khi sử dụng thông tin từ tài liệu tham khảo.
    """
    
    response = bedrock_runtime.invoke_model(
        modelId='anthropic.claude-3-sonnet-20240229-v1:0',
        body=json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 4000,
            "temperature": 0.2,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        })
    )
    
    response_body = json.loads(response['body'].read())
    analysis_text = response_body['content'][0]['text']
    
    # Try to extract JSON from the response
    try:
        # Find JSON in the response
        start_idx = analysis_text.find('{')
        end_idx = analysis_text.rfind('}') + 1
        
        if start_idx != -1 and end_idx != -1:
            json_str = analysis_text[start_idx:end_idx]
            analysis_json = json.loads(json_str)
            return analysis_json
        else:
            # Fallback: create structured response from text
            return create_fallback_structure(analysis_text)
            
    except json.JSONDecodeError:
        # Fallback: create structured response from text
        return create_fallback_structure(analysis_text)

def create_fallback_structure(analysis_text: str) -> Dict:
    """Create structured JSON when Claude doesn't return proper JSON"""
    return {
        "overview": {
            "process_name": "Quy trình được phân tích",
            "purpose": "Được xác định từ phân tích",
            "process_type": "Cần xác định thêm",
            "complexity_level": "Trung bình",
            "scope": "Theo sơ đồ được cung cấp"
        },
        "components": {
            "start_event": "Được xác định từ sơ đồ",
            "end_event": "Được xác định từ sơ đồ",
            "actors": ["Cần xác định từ phân tích"],
            "steps": ["Được liệt kê trong phân tích"],
            "sequence": "Tuần tự theo sơ đồ"
        },
        "execution": {
            "sla": "Cần xác định",
            "input_requirements": ["Theo yêu cầu quy trình"],
            "output": "Kết quả mong đợi",
            "system_integration": ["Cần xác định"]
        },
        "evaluation": {
            "logic_coherence": "Đánh giá dựa trên phân tích",
            "completeness": "Cần đánh giá thêm",
            "risks": ["Cần xác định từ phân tích"],
            "controls": ["Cần bổ sung"],
            "compliance": "Cần kiểm tra"
        },
        "improvement": {
            "bottlenecks": ["Được xác định từ phân tích"],
            "optimization_opportunities": ["Cần đánh giá thêm"],
            "automation_possibility": "Có thể tự động hóa một phần",
            "kpis": ["Cần định nghĩa"]
        },
        "summary": {
            "conclusion": "Phân tích chi tiết được cung cấp",
            "recommendations": ["Xem phân tích chi tiết"]
        },
        "detailed_analysis": analysis_text
    }

def calculate_complexity(diagram_json: Dict) -> str:
    """Calculate diagram complexity"""
    try:
        nodes_count = len(diagram_json.get('nodes', []))
        edges_count = len(diagram_json.get('edges', []))
        
        # Calculate branching factor
        branching_score = edges_count / max(nodes_count, 1)
        
        if nodes_count <= 3:
            return "Đơn giản"
        elif nodes_count <= 6 and branching_score < 1.5:
            return "Trung bình"
        elif nodes_count <= 10 and branching_score < 2.0:
            return "Phức tạp"
        else:
            return "Rất phức tạp"
            
    except:
        return "Không xác định"

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