import { useState } from "react";
// 1. Import useNavigate
import { useNavigate } from "react-router-dom";

export const DiagramFooter: React.FC<{
  onExport: () => void;
  onAnalyze: (question: string) => void;
}> = ({ onExport, onAnalyze }) => {
  const [question, setQuestion] = useState("");
  // 2. Khởi tạo navigate
  const navigate = useNavigate();

  const handleAnalyzeClick = () => {
    onAnalyze(question.trim());
    setQuestion("");
  };

  // 3. Tạo hàm xử lý sự kiện cho nút mới
  const handleSelectSourcesClick = () => {
    // Điều hướng đến trang chọn tài liệu
    navigate('/documents');
  };

  return (
    <div className="diagram-footer">
      <div className="question-area">
        <input
          type="text"
          placeholder="Nhập câu hỏi để phân tích sơ đồ..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="question-input"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAnalyzeClick();
            }
          }}
        />
        <button onClick={handleAnalyzeClick} className="analyze-button">
          Gửi phân tích
        </button>
      </div>

      {/* 4. Thêm nút mới vào giữa hai nút cũ */}
      <button onClick={handleSelectSourcesClick} className="select-source-button">
        Chọn Nguồn Tri Thức
      </button>

      <button onClick={onExport} className="confirm-button">
        Xuất Sơ đồ (JSON)
      </button>
    </div>
  );
};