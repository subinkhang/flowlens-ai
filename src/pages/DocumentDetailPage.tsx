// src/pages/DocumentDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Document } from '../types/document'; // Import kiểu dữ liệu
import { API_ENDPOINTS } from '../api/endpoints'; // Import cấu hình API

const DocumentDetailPage: React.FC = () => {
  // Lấy documentId từ URL
  const { documentId } = useParams<{ documentId: string }>();

  // State để quản lý dữ liệu của tài liệu chi tiết
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Dùng useEffect để lấy dữ liệu chi tiết khi documentId thay đổi
  useEffect(() => {
    if (!documentId) {
        setIsLoading(false);
        setError("Không tìm thấy ID tài liệu trong URL.");
        return;
    }

    const fetchDocumentDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Gọi hàm để tạo URL động
        const apiUrl = API_ENDPOINTS.getDocumentById(documentId);
        const response = await fetch(apiUrl);

        if (!response.ok) {
          if (response.status === 404) throw new Error('Tài liệu không tồn tại trong hệ thống.');
          throw new Error('Không thể tải chi tiết tài liệu.');
        }
        const data: Document = await response.json();
        setDocument(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocumentDetail();
  }, [documentId]); // Dependency là documentId, sẽ chạy lại khi ID trên URL thay đổi

  // Xử lý các trạng thái UI trước khi render nội dung chính
  if (isLoading) {
    return <div style={{padding: '20px'}}>Đang tải chi tiết tài liệu...</div>;
  }

  if (error) {
    return <div style={{padding: '20px', color: 'red'}}>Lỗi: {error}. <Link to="/documents">Quay lại danh sách</Link></div>;
  }

  // Nếu không loading, không lỗi, nhưng không có document
  if (!document) {
    return <div style={{padding: '20px'}}>Không tìm thấy dữ liệu cho tài liệu này. <Link to="/documents">Quay lại danh sách</Link></div>;
  }

  // Render nội dung chính khi có dữ liệu
  return (
    <div style={{ padding: '20px' }}>
      <Link to="/documents">← Quay lại danh sách</Link>
      <h1 style={{ marginTop: '20px' }}>{document.documentName}</h1>

      <div style={{ background: '#f0f0f0', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
        <h3 style={{ marginTop: 0 }}>Thông tin Nguồn gốc</h3>
        {document.documentType === 'REFERENCE' ? (
          <div>
            <strong>Nguồn chính thức:</strong>{' '}
            <a href={document.sourceUrl} target="_blank" rel="noopener noreferrer">
              {document.sourceUrl}
            </a>
          </div>
        ) : (
          <div>
            <strong>Nguồn:</strong> Tài liệu do người dùng "{document.ownerId || 'không rõ'}" tải lên.
            <br/>
            {/* TODO: Implement download from S3 */}
            <button style={{marginTop: '10px'}}>Tải về file gốc</button>
          </div>
        )}
      </div>

      <div>
        <h3>Nội dung</h3>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#fff', padding: '15px', border: '1px solid #ddd', fontFamily: 'inherit' }}>
          {/* Hiển thị textContent đã được trích xuất từ backend */}
          {document.textContent || "[Không có nội dung text để hiển thị]"}
        </pre>
      </div>
    </div>
  );
};

export default DocumentDetailPage;