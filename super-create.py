# File: lambda_function.py

import json
import boto3
import uuid
import os
from datetime import datetime

# Khởi tạo clients
s3_client = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

# Lấy tên các tài nguyên từ biến môi trường
S3_BUCKET_NAME = os.environ.get('S3_BUCKET_NAME')
DYNAMODB_TABLE_NAME = os.environ.get('DYNAMODB_TABLE_NAME')

def lambda_handler(event, context):
    # In ra toàn bộ event để debug khi cần
    print("Received event:", json.dumps(event))

    # Bọc toàn bộ logic trong một khối try...except lớn
    try:
        # --- 1. PARSE VÀ VALIDATE INPUT ---
        body = {}
        if 'body' in event and event['body']:
            body = json.loads(event['body'])
        
        file_name = body.get('fileName')
        content_type = body.get('contentType')

        # Nếu thiếu thông tin cần thiết, trả về lỗi 400 và dừng lại ngay
        if not file_name or not content_type:
            print("Validation Error: fileName or contentType is missing.")
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'fileName and contentType are required in the request body'})
            }

        # --- 2. KIỂM TRA CẤU HÌNH SERVER (BIẾN MÔI TRƯỜNG) ---
        if not S3_BUCKET_NAME or not DYNAMODB_TABLE_NAME:
            print("Configuration Error: Environment variables are not set.")
            raise ValueError("Server configuration error: S3_BUCKET_NAME or DYNAMODB_TABLE_NAME is missing.")

        # --- 3. LOGIC CỐT LÕI ---
        document_id = str(uuid.uuid4())
        s3_folder_path = f"user-uploads/{document_id}"
        s3_key_for_pdf = f"{s3_folder_path}/{file_name}"
        s3_key_for_metadata = f"{s3_key_for_pdf}.metadata.json"

        # Tạo bản ghi trong DynamoDB
        table = dynamodb.Table(DYNAMODB_TABLE_NAME)
        item = {
            'documentId': document_id,
            'documentName': file_name,
            'documentType': 'INTERNAL',
            's3Path': f"s3://{S3_BUCKET_NAME}/{s3_key_for_pdf}",
            'createdAt': datetime.utcnow().isoformat() + "Z",
        }
        table.put_item(Item=item)

        # Tạo và upload file metadata.json
        metadata_content = {
            "metadataAttributes": {
                "document_id": {"value": {"type": "STRING", "stringValue": document_id}, "includeForEmbedding": False},
                "document_name": {"value": {"type": "STRING", "stringValue": file_name}, "includeForEmbedding": True}
            }
        }
        s3_client.put_object(
            Bucket=S3_BUCKET_NAME,
            Key=s3_key_for_metadata,
            Body=json.dumps(metadata_content),
            ContentType='application/json'
        )

        # Tạo Presigned URL cho file PDF
        presigned_url_for_pdf = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': S3_BUCKET_NAME,
                'Key': s3_key_for_pdf,
                'ContentType': content_type,
            },
            ExpiresIn=300
        )

        # --- 4. TRẢ VỀ KẾT QUẢ THÀNH CÔNG ---
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'uploadUrl': presigned_url_for_pdf,
                'documentId': document_id,
            })
        }

    # --- 5. BẮT TẤT CẢ CÁC LỖI KHÁC ---
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {e}")
        return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Invalid JSON format in request body.'})}
    
    except ValueError as e:
        # Lỗi do chúng ta tự ném ra (ví dụ: thiếu biến môi trường)
        print(f"Configuration Value Error: {e}")
        return {'statusCode': 500, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': str(e)})}
        
    except Exception as e:
        # Các lỗi không lường trước khác
        print(f"An unexpected error occurred: {e}")
        return {'statusCode': 500, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'An unexpected server error occurred.'})}