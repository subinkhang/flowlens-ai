import { useState } from "react";

export const DiagramFooter: React.FC<{
  onExport: () => void;
  onAnalyze: (question: string) => void;
  onNavigateToDocuments: () => void;
}> = ({ onAnalyze, onNavigateToDocuments }) => {
  const [question, setQuestion] = useState("");

  const handleAnalyzeClick = () => {
    onAnalyze(question.trim());
    setQuestion("");
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
      <button onClick={onNavigateToDocuments} className="select-source-button">
        Chọn Nguồn Tri Thức
      </button>

      {/* <button onClick={onExport} className="confirm-button">
        Xuất Sơ đồ (JSON)
      </button> */}
    </div>
  );
};