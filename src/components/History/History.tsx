import React from "react";
import "./History.css";
import { generateSessionId } from "../../utils/sessionId";

interface HistoryProps {
  onSelect: (sessionId: string) => void;
}

export const History: React.FC<HistoryProps> = ({ onSelect }) => {
  const sessionKeys = Object.keys(localStorage).filter((key) =>
    key.startsWith("flowlens_chat_history_")
  );

  const sessions = sessionKeys
    .map((key) => {
      const messages = JSON.parse(localStorage.getItem(key) || "[]");
      // Lấy tin nhắn đầu tiên của AI làm preview, hoặc tin nhắn của user nếu không có
      const firstMessage = messages.find((m: any) => m.sender === 'ai');
      const userMessage = messages.find((m: any) => m.sender === 'user');

      return {
        id: key.replace("flowlens_chat_history_", ""),
        // Ưu tiên lấy preview từ tin nhắn đầu tiên của user để gợi nhớ tốt hơn
        preview:
          userMessage?.text || firstMessage?.text || "Bắt đầu cuộc trò chuyện mới...",
      };
    })
    .reverse();
    
  const handleCreateNewSession = () => {
    const newSessionId = generateSessionId();
    onSelect(newSessionId);
  };

  return (
    <div className="chat-layou">
      {/* <div className="chat-sidebar-left"> */}
      <h3 className="sidebar-title">Lịch sử trò chuyện</h3>
      <button className="new-session-button" onClick={handleCreateNewSession}>
        + 
      </button>
      <ul className="sidebar-buttons">
        {sessions.map((session) => (
          <li
            key={session.id}
            className="sidebar-button"
            onClick={() => onSelect(session.id)}
            title={session.preview}
          >
            <span className="history-preview">
              {session.preview.length > 25
                ? `${session.preview.substring(0, 25)}...`
                : session.preview}
            </span>
          </li>
        ))}
      </ul>
    </div>
    // </div>
  );
};