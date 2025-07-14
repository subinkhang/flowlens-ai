// src/components/DocumentUpload.tsx
import React, { useState, useRef } from 'react';
import { API_ENDPOINTS } from '../api/endpoints'; // Import cấu hình API

// Định nghĩa props cho component
interface Props {
  // Callback này sẽ được gọi khi upload thành công,
  // để báo cho component cha (DocumentsPage) biết cần tải lại danh sách.
  onUploadSuccess: () => void;
}

const DocumentUpload: React.FC<Props> = ({ onUploadSuccess }) => {
  // State để lưu trữ file người dùng đã chọn
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // State để quản lý trạng thái đang tải lên (để vô hiệu hóa nút, hiển thị loading...)
  const [isUploading, setIsUploading] = useState(false);
  // State để lưu trữ thông báo lỗi nếu có
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Sử dụng ref để có thể reset input file sau khi upload thành công
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hàm được gọi khi người dùng chọn file từ máy tính
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Chỉ lấy file đầu tiên nếu người dùng chọn nhiều file
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setUploadError(null); // Xóa lỗi cũ khi chọn file mới
    }
  };

  // Hàm được gọi khi người dùng nhấn nút "Tải lên"
  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Vui lòng chọn một file để tải lên.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    // FormData là cách chuẩn để gửi file qua các yêu cầu HTTP
    const formData = new FormData();
    formData.append('file', selectedFile); // Tên 'file' phải khớp với tên mà backend Lambda của bạn mong đợi

    try {
      const response = await fetch(API_ENDPOINTS.uploadDocument, {
        method: 'POST',
        body: formData,
        // Lưu ý: KHÔNG cần set header 'Content-Type'.
        // Trình duyệt sẽ tự động set thành 'multipart/form-data' với boundary phù hợp.
      });

      if (!response.ok) {
        // Cố gắng đọc lỗi từ body của response
        const errorData = await response.json().catch(() => ({ error: 'Upload không thành công và không thể đọc lỗi chi tiết.' }));
        throw new Error(errorData.error || `Lỗi HTTP: ${response.status}`);
      }
      
      // Nếu thành công
      alert('Tải lên tài liệu thành công!');
      setSelectedFile(null); // Xóa file đã chọn
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset input file để có thể chọn lại file cũ
      }
      onUploadSuccess(); // Gọi callback để làm mới danh sách ở trang cha
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định');
    } finally {
      setIsUploading(false); // Luôn kết thúc trạng thái loading
    }
  };

  return (
    <div style={{ marginBottom: '20px', padding: '15px', border: '1px dashed #ccc', borderRadius: '5px' }}>
      <h4 style={{ marginTop: 0 }}>Tải lên tài liệu mới</h4>
      <div>
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange} 
          accept=".pdf,.txt,.docx" // Giới hạn loại file có thể chọn
          disabled={isUploading}
        />
        <button 
          onClick={handleUpload} 
          disabled={!selectedFile || isUploading}
          style={{ marginLeft: '10px', padding: '8px 12px' }}
        >
          {isUploading ? 'Đang tải lên...' : 'Bắt đầu Tải lên'}
        </button>
      </div>
      {uploadError && <p style={{ color: 'red', marginTop: '10px' }}>Lỗi Upload: {uploadError}</p>}
    </div>
  );
};

export default DocumentUpload;