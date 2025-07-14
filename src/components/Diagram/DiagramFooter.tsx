import { useState } from "react";

export const DiagramFooter: React.FC<{
  onExport: () => void;
  onAnalyze: (question: string) => void;
}> = ({ onExport, onAnalyze }) => {
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
        />
        <button onClick={handleAnalyzeClick} className="analyze-button">
          Gửi phân tích
        </button>
      </div>
      <button onClick={onExport} className="confirm-button">
        Xác nhận & Xuất JSON
      </button>
    </div>
  );
};
