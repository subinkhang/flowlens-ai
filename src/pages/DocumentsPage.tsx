import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Document } from '../types/ApiResponse';
import DocumentItem from '../components/DocumentItem';
import DocumentUpload from '../components/DocumentUpload';
import { API_ENDPOINTS } from '../api/endpoints';
import './css/DocumentsPage.css';

// SVG Icon cho trạng thái rỗng
const EmptyStateIcon = () => (
  <svg className="empty-state-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);


const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const fromSessionId = location.state?.fromSessionId;

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.getDocuments);
      if (!response.ok) throw new Error('Không thể tải danh sách tài liệu.');
      const data: Document[] = await response.json();
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const handleSelectionChange = (documentId: string, isSelected: boolean) => {
    const newSelectedIds = new Set(selectedIds);
    if (isSelected) newSelectedIds.add(documentId);
    else newSelectedIds.delete(documentId);
    setSelectedIds(newSelectedIds);
  };
  
  const handleSelectAll = (isSelected: boolean) => {
    setSelectedIds(isSelected ? new Set(documents.map(doc => doc.documentId)) : new Set());
  };

  const handleConfirmSelection = () => {
    if (!fromSessionId) {
      console.error("Không có sessionId để quay lại. Điều hướng về trang chủ.");
      navigate('/');
      return;
    }
    navigate(`/diagram/${fromSessionId}`, { state: { selectedDocumentIds: Array.from(selectedIds) } });
  };

  return (
    <div className="documents-page">
      <header className="page-header">
        <h1>Nguồn tri thức</h1>
        <p>Chọn các tài liệu bạn muốn AI tham khảo cho lần phân tích này.</p>
      </header>
      
      <div className="upload-section card">
        {/* Component DocumentUpload giờ sẽ nằm trong một card nổi bật */}
        <DocumentUpload onUploadSuccess={fetchDocuments} />
      </div>
      
      {isLoading && <p className="loading-state">Đang tải danh sách tài liệu...</p>}
      
      {error && <p className="error-state">Lỗi: {error}</p>}

      {!isLoading && !error && (
        <>
          <div className="documents-list-container card">
            <div className="select-all-bar">
                <input 
                    type="checkbox" 
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    checked={selectedIds.size === documents.length && documents.length > 0}
                    aria-label="Select all documents"
                />
                <span>Chọn tất cả ({documents.length})</span>
            </div>
            
            {documents.length > 0 ? (
                documents.map((doc) => (
                  <DocumentItem
                    key={doc.documentId}
                    document={doc}
                    isSelected={selectedIds.has(doc.documentId)}
                    onSelectionChange={handleSelectionChange}
                  />
                ))
            ) : (
                // --- Trạng thái Rỗng được thiết kế lại ---
                <div className="empty-state">
                  <EmptyStateIcon />
                  <p>Chưa có nguồn tri thức nào.</p>
                  <span style={{fontSize: '0.9rem', marginTop: '0.5rem'}}>Hãy tải lên tài liệu đầu tiên của bạn.</span>
                </div>
            )}
          </div>

          <div className="confirm-button-container">
            <button 
              onClick={handleConfirmSelection} 
              className="confirm-button"
              // disabled={!fromSessionId}
            >
              Xác nhận ({selectedIds.size} đã chọn)
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DocumentsPage;