import React, { useState, useEffect } from 'react';
import { getSessionData } from '../api/mockApi'; // Import API để lấy dữ liệu session

// Định nghĩa kiểu dữ liệu cho dữ liệu phân tích để code được an toàn và dễ đọc hơn
interface AnalysisData {
  summary: string;
  suggestions: string[];
  risks: string[];
}

export const AnalysisPage: React.FC = () => {
  // --- STATE MANAGEMENT ---
  // State để lưu trữ dữ liệu phân tích sau khi đã lấy về từ API
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  // State để lưu trữ thông báo lỗi nếu có
  const [error, setError] = useState<string | null>(null);


  // --- SIDE EFFECTS ---
  // useEffect này sẽ chạy 1 lần duy nhất khi component được tải
  useEffect(() => {
    // 1. Lấy các tham số từ URL của trang
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('sessionId');

    // 2. Kiểm tra xem có sessionId hay không
    if (sessionId) {
      // 3. Nếu có, gọi API để lấy dữ liệu phân tích
      getSessionData(sessionId, 'analysis')
        .then(data => {
          // Nếu thành công, cập nhật state với dữ liệu nhận được
          setAnalysisData(data);
          // Cập nhật tiêu đề của tab trình duyệt để người dùng dễ phân biệt
          document.title = `Phân tích - Session ${sessionId.substring(8, 14)}`;
        })
        .catch(err => {
          // Nếu thất bại, cập nhật state lỗi
          setError(err.message);
        });
    } else {
      // Nếu không có sessionId trên URL, báo lỗi ngay lập tức
      setError("Không tìm thấy Session ID trên URL. Vui lòng thử lại từ trang chat.");
    }
  }, []); // Mảng rỗng `[]` đảm bảo useEffect chỉ chạy 1 lần khi component mount


  // --- CONDITIONAL RENDERING ---
  // Ưu tiên hiển thị lỗi nếu có
  if (error) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif', color: 'red' }}>
        <h1>Đã xảy ra lỗi</h1>
        <p>{error}</p>
      </div>
    );
  }

  // Hiển thị trạng thái "đang tải" trong khi chờ API trả về dữ liệu
  if (!analysisData) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h1>Đang tải dữ liệu phân tích...</h1>
      </div>
    );
  }

  // Khi đã có dữ liệu, hiển thị nội dung báo cáo chi tiết
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', lineHeight: '1.6' }}>
      <h1>Báo cáo Phân tích Quy trình</h1>
      
      <div style={{ marginTop: '30px' }}>
        <h2>Tóm tắt Quy trình</h2>
        <p>{analysisData.summary}</p>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2>Đề xuất Cải tiến</h2>
        <ul>
          {analysisData.suggestions.map((suggestion, index) => (
            <li key={`suggestion-${index}`}>{suggestion}</li>
          ))}
        </ul>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h2>Rủi ro tiềm ẩn & Cảnh báo Tuân thủ</h2>
        <ul>
          {analysisData.risks.map((risk, index) => (
            <li key={`risk-${index}`}>{risk}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};