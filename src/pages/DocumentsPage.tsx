import React, { useState, useEffect } from 'react';
// 1. Import thêm useNavigate và useLocation
import { useNavigate, useLocation } from 'react-router-dom';
import type { Document } from '../types/document';
import DocumentItem from '../components/DocumentItem';
import DocumentUpload from '../components/DocumentUpload';
import { API_ENDPOINTS } from '../api/endpoints';

const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Khởi tạo navigate
  const navigate = useNavigate();

  // Hàm để gọi API và lấy danh sách tài liệu
  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.getDocuments);
      if (!response.ok) {
        throw new Error('Không thể tải danh sách tài liệu.');
      }
      const data: Document[] = await response.json();
      
      // --- THÊM DÒNG NÀY ĐỂ DEBUG ---
      console.log("Dữ liệu nhận được từ API:", data);
      
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định');
    } finally {
      setIsLoading(false);
    }
  };

  // Dùng useEffect để gọi API một lần khi component được render lần đầu
  useEffect(() => {
    fetchDocuments();
  }, []); // Mảng dependency rỗng đảm bảo chỉ chạy một lần

  const handleSelectionChange = (documentId: string, isSelected: boolean) => {
    const newSelectedIds = new Set(selectedIds);
    if (isSelected) {
      newSelectedIds.add(documentId);
    } else {
      newSelectedIds.delete(documentId);
    }
    setSelectedIds(newSelectedIds);
  };
  
  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
        // Cập nhật để dùng state `documents` thay vì mock
        const allIds = new Set(documents.map(doc => doc.documentId));
        setSelectedIds(allIds);
    } else {
        setSelectedIds(new Set());
    }
  };

  // 3. Tạo hàm xử lý sự kiện xác nhận
  const handleConfirmSelection = () => {
    // Chuyển Set thành Array để gửi đi
    const selectedIdsArray = Array.from(selectedIds);
    
    // Quay lại trang diagram và gửi kèm state
    navigate('/diagram', { 
      state: { 
        selectedDocumentIds: selectedIdsArray 
      } 
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Nguồn tri thức (Knowledge Sources)</h1>
      <p>Chọn các tài liệu bạn muốn AI tham khảo cho lần phân tích này.</p>
      
      <DocumentUpload onUploadSuccess={fetchDocuments} />
      
      {/* Hiển thị trạng thái Loading */}
      {isLoading && <p>Đang tải danh sách tài liệu...</p>}
      
      {/* Hiển thị thông báo Lỗi nếu có */}
      {error && <p style={{ color: 'red' }}>Lỗi: {error}</p>}

      {/* 4. Thêm nút Xác nhận ở cuối trang */}
      {!isLoading && !error && (
        <>
          <div style={{ border: '1px solid #ccc', borderRadius: '5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', backgroundColor: '#f7f7f7', fontWeight: 'bold' }}>
                <input 
                    type="checkbox" 
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    // Cập nhật để dùng state `documents`
                    checked={selectedIds.size === documents.length && documents.length > 0}
                />
                <span>Select All Sources</span>
            </div>
            {/* Map qua dữ liệu thật từ state `documents` */}
            {documents.map((doc) => (
              <DocumentItem
                key={doc.documentId}
                document={doc}
                isSelected={selectedIds.has(doc.documentId)}
                onSelectionChange={handleSelectionChange}
              />
            ))}
          </div>
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <button 
              onClick={handleConfirmSelection} 
              style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
            >
              Xác nhận và Quay lại ({selectedIds.size} đã chọn)
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DocumentsPage;