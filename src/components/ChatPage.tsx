import React, { useState, useEffect, useRef } from 'react';
import './ChatPage.css'; // Import file CSS
import { useNavigate } from 'react-router-dom';

// Định nghĩa kiểu dữ liệu cho một tin nhắn
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

export const ChatPage: React.FC = () => {
  // State để lưu danh sách tin nhắn
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Xin chào! Tôi là FlowLens AI. Hãy mô tả quy trình nghiệp vụ bạn muốn phân tích.',
      sender: 'ai',
    },
  ]);
  
  // State cho nội dung người dùng đang gõ
  const [inputText, setInputText] = useState<string>('');
  
  // State để hiển thị trạng thái AI đang "suy nghĩ"
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Ref để tự động cuộn xuống tin nhắn mới nhất
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Tự động cuộn xuống dưới cùng khi có tin nhắn mới
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, isLoading]);


  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

    // ... (phần code thêm tin nhắn người dùng giữ nguyên) ...

    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now() + 1,
        text: `Đã hiểu! Tôi đã phân tích xong. Bây giờ, hãy xác thực sơ đồ trực quan.`,
        sender: 'ai',
      };
      
      setIsLoading(false);
      setMessages(prevMessages => [...prevMessages, aiResponse]);
      
      // 3. CHUYỂN TRANG!
      // Thêm một chút độ trễ để người dùng kịp đọc tin nhắn
      setTimeout(() => {
        navigate('/diagram'); // Chuyển đến trang có URL là /diagram
      }, 1000); // Chờ 1 giây sau khi AI trả lời rồi mới chuyển

    }, 1500);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };


  return (
    <div className="chat-page">
      <div className="message-list" ref={messageListRef}>
        {messages.map(message => (
          <div
            key={message.id}
            className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
          >
            {message.text}
          </div>
        ))}
        {isLoading && <div className="loading-indicator">FlowLens đang suy nghĩ...</div>}
      </div>

      <div className="message-input-container">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nhập mô tả quy trình ở đây..."
          disabled={isLoading}
        />
        <button onClick={handleSendMessage} disabled={isLoading}>
          Gửi
        </button>
      </div>
    </div>
  );
};