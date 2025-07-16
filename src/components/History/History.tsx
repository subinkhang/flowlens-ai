import React from "react";
import "./History.css";

interface HistoryProps {
  onSelect: (sessionId: string) => void;
}

export const History: React.FC<HistoryProps> = ({ onSelect }) => {
  const sessionKeys = Object.keys(localStorage).filter((key) =>
    key.startsWith("flowlens_chat_history_")
  );

  const sessions = sessionKeys.map((key) => ({
    id: key.replace("flowlens_chat_history_", ""),
    preview:
      JSON.parse(localStorage.getItem(key) || "[]")[0]?.text ||
      "Phiên không có tin nhắn",
  }));

  return (
    <div className="history-container">
      <h3>Lịch sử trò chuyện</h3>
      <ul>
        {sessions.map((session) => (
          <li key={session.id} onClick={() => onSelect(session.id)}>
            <strong>{session.id.slice(0, 8)}...</strong> - {session.preview}
          </li>
        ))}
      </ul>
    </div>
  );
};
