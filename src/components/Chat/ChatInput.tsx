// ChatInput.tsx
import React from "react";

export const ChatInput = ({
  inputText,
  isLoading,
  onInputChange,
  onKeyPress,
  onSend,
  onFileUpload,
}: {
  inputText: string;
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSend: () => void;
  onFileUpload: (file: File) => void;
}) => (
  <div className="message-input-container">
    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) onFileUpload(file); // ✅ Dùng props
      }}
    />

    <input
      id="chat-input"
      type="text"
      value={inputText}
      onChange={onInputChange}
      onKeyPress={onKeyPress} // ✅ Dùng props
      placeholder="Dùng @tag để ra lệnh..."
      disabled={isLoading}
      autoComplete="off"
    />

    <button onClick={onSend} disabled={isLoading}>
      Gửi
    </button>
  </div>
);
