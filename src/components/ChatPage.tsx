import React, { useState, useEffect, useRef } from 'react';
import { mockApiCall } from '../api/mockApi';
import { generateSessionId } from '../utils/sessionId';
import './ChatPage.css';

// Định nghĩa kiểu dữ liệu cho một tin nhắn
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

// Danh sách các tag gợi ý
const TAG_SUGGESTIONS = ['@diagram', '@ask', ' @improve'];

export const ChatPage: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // State quan trọng: Quản lý ID của phiên làm việc hiện tại
  const [sessionId, setSessionId] = useState<string>('');

  const messageListRef = useRef<HTMLDivElement>(null);


  // --- SIDE EFFECTS ---
  // Chạy 1 lần duy nhất khi component được tải lần đầu
  useEffect(() => {
    // 1. Tạo một Session ID duy nhất cho phiên làm việc này
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);

    // 2. Thêm tin nhắn chào mừng vào giao diện chat
    setMessages([
      { 
        id: 1, 
        text: `Chào mừng bạn! Một phiên làm việc mới đã được tạo với ID: ${newSessionId.substring(0, 18)}... Gõ @ để xem lệnh.`, 
        sender: 'ai' 
      },
    ]);
  }, []); // Mảng rỗng đảm bảo useEffect này chỉ chạy 1 lần

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, isLoading]);


  // --- EVENT HANDLERS ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputText(value);
    if (value.startsWith('@')) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (tag: string) => {
    setInputText(tag + ' ');
    setShowSuggestions(false);
    document.getElementById('chat-input')?.focus();
  };

  const handleSendMessage = async () => {
    const trimmedInput = inputText.trim();
    if (trimmedInput === '' || !sessionId) return;

    setShowSuggestions(false);

    let tag = 'no-tag';
    let payload = trimmedInput;
    if (trimmedInput.startsWith('@')) {
      const firstSpaceIndex = trimmedInput.indexOf(' ');
      if (firstSpaceIndex !== -1) {
        tag = trimmedInput.substring(0, firstSpaceIndex);
        payload = trimmedInput.substring(firstSpaceIndex + 1);
      } else {
        tag = trimmedInput;
        payload = '';
      }
    }
    
    const newUserMessage: Message = { id: Date.now(), text: trimmedInput, sender: 'user' };
    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setIsLoading(true);

    // Gọi API với đầy đủ tham số: tag, payload, và sessionId
    const response = await mockApiCall(tag, payload, sessionId);
    setIsLoading(false);
    
    const aiResponseMessage: Message = { id: Date.now() + 1, text: response.message, sender: 'ai' };
    setMessages(prev => [...prev, aiResponseMessage]);

    // Mở tab mới với sessionId, không còn dùng localStorage nữa
    if (response.action === 'NAVIGATE_TO_DIAGRAM' || response.action === 'NAVIGATE_TO_ANALYSIS') {
      const url = response.action === 'NAVIGATE_TO_DIAGRAM' 
        ? `/diagram?sessionId=${response.sessionId}` 
        : `/analysis?sessionId=${response.sessionId}`;
      
      window.open(url, '_blank');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };


  // --- JSX RENDER ---
  return (
    <div className="chat-page">
      <div className="message-list" ref={messageListRef}>
        {messages.map(message => (
          <div key={message.id} className={`message ${message.sender}-message`}>
            {message.text}
          </div>
        ))}
        {isLoading && <div className="loading-indicator">FlowLens đang suy nghĩ...</div>}
      </div>

      <div className="input-area">
        {showSuggestions && (
          <div className="suggestions-container">
            {TAG_SUGGESTIONS.map(tag => (
              <div key={tag} className="suggestion-item" onClick={() => handleSuggestionClick(tag)}>
                {tag}
              </div>
            ))}
          </div>
        )}

        <div className="message-input-container">
          <input
            id="chat-input"
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Dùng @tag để ra lệnh..."
            disabled={isLoading}
            autoComplete="off"
          />
          <button onClick={handleSendMessage} disabled={isLoading || !sessionId}>Gửi</button>
        </div>
      </div>
    </div>
  );
};