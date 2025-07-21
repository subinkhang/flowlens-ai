// src/pages/DocumentDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import type { Document } from '../types/ApiResponse';
import { API_ENDPOINTS } from '../api/endpoints';
import { HighlightedContent } from '../components/Document/HighlightedContent';

// Import file CSS vừa tạo
import './css/DocumentDetailPage.css';

const DocumentDetailPage: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const [searchParams] = useSearchParams();
  const highlightText = searchParams.get('highlight');

  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
  }, [documentId]);

  if (isLoading) {
    return <div className="status-message">Đang tải chi tiết tài liệu...</div>;
  }

  if (error) {
    return (
      <div className="status-message error-message">
        Lỗi: {error}. <Link to="/documents">Quay lại danh sách</Link>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="status-message">
        Không tìm thấy dữ liệu cho tài liệu này. <Link to="/documents">Quay lại danh sách</Link>
      </div>
    );
  }

  // --- Bắt đầu phần JSX đã được cập nhật ---
  return (
    <div className="detail-page">
      <Link to="/documents" className="back-link">
        ← Quay lại danh sách
      </Link>
      <h1 className="page-title">{document.documentName}</h1>

      <div className="info-box">
        <h3>Thông tin Nguồn gốc</h3>
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
            <br />
            {/* TODO: Implement download from S3 */}
            <button className="download-button" disabled>Tải về file gốc</button>
          </div>
        )}
      </div>

      <div className="content-section">
        <h3>Nội dung</h3>
        <pre className="content-pre">
          <HighlightedContent 
            content={document.textContent}
            highlight={highlightText}
          />
        </pre>
      </div>
    </div>
  );
};

export default DocumentDetailPage;