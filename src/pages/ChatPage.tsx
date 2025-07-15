import React, { useState, useEffect, useRef } from "react";
import "./css/ChatPage.css";
import { generateSessionId } from "../utils/sessionId";
import { generateDiagram } from "../api/diagramApi";
import { MessageList } from "../components/Chat/MessageList";
import { Suggestions } from "../components/Chat/Suggestions";
import { ChatInput } from "../components/Chat/ChatInput";
import { isVietnameseText } from "../utils/isVietnameseText";

// --- STEP 1: ĐỊNH NGHĨA CÁC KIỂU DỮ LIỆU VÀ KHÓA CACHE ---
export interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
}
export const TAG_SUGGESTIONS = ["@diagram", "@ask", "@improve"];

// Đặt tên cho khóa localStorage để dễ quản lý
const CHAT_HISTORY_KEY = 'flowlens_chat_history';
const SESSION_ID_KEY = 'flowlens_session_id';


export const ChatPage: React.FC = () => {
  // State management không thay đổi
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sessionId, setSessionId] = useState(""); // Vẫn giữ sessionId
  const messageListRef = useRef<HTMLDivElement>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  // --- STEP 2: CẬP NHẬT useEffect KHỞI TẠO ĐỂ ĐỌC TỪ CACHE ---
  useEffect(() => {
    // Ưu tiên đọc lịch sử chat và session ID từ cache
    const cachedMessages = localStorage.getItem(CHAT_HISTORY_KEY);
    const cachedSessionId = localStorage.getItem(SESSION_ID_KEY);

    if (cachedMessages && cachedSessionId) {
      console.log("Đã tìm thấy lịch sử chat trong cache. Đang khôi phục...");
      setMessages(JSON.parse(cachedMessages));
      setSessionId(cachedSessionId);
    } else {
      // Nếu không có cache, mới tạo một phiên làm việc mới
      console.log("Không có cache. Đang tạo phiên làm việc mới...");
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      setMessages([
        {
          id: 1,
          text: `Chào mừng bạn! Một phiên làm việc mới đã được tạo với ID: ${newSessionId.substring(
            0,
            18
          )} ... Gõ @ để xem lệnh.`,
          sender: "ai",
        },
      ]);
    }
  }, []); // Mảng dependency rỗng đảm bảo chỉ chạy 1 lần duy nhất

  // --- STEP 3: THÊM useEffect ĐỂ TỰ ĐỘNG LƯU VÀO CACHE ---
  useEffect(() => {
    // Hook này sẽ chạy mỗi khi `messages` hoặc `sessionId` thay đổi.
    // Chúng ta chỉ lưu khi có ít nhất 1 tin nhắn và đã có session ID.
    if (messages.length > 0 && sessionId) {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
      localStorage.setItem(SESSION_ID_KEY, sessionId);
      console.log("Đã cập nhật lịch sử chat vào cache.");
    }
  }, [messages, sessionId]); // Dependencies

  // useEffect để cuộn xuống cuối cùng không thay đổi
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !isLoading) {
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputText(value);
    setShowSuggestions(value.startsWith("@"));
  };

  const handleSuggestionClick = (tag: string) => {
    setInputText(tag + " ");
    setShowSuggestions(false);
    document.getElementById("chat-input")?.focus();
  };

  const handleSendMessage = async () => {
    const trimmedInput = inputText.trim();

    if (!imageBase64 && trimmedInput === "") {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "⚠️ Bạn cần nhập nội dung hoặc tải ảnh lên.",
          sender: "ai",
        },
      ]);
      return;
    }

    setShowSuggestions(false);

    // Tách tag
    let tag = "no-tag";
    let payload = trimmedInput;
    if (trimmedInput.startsWith("@")) {
      const firstSpaceIndex = trimmedInput.indexOf(" ");
      if (firstSpaceIndex !== -1) {
        tag = trimmedInput.substring(0, firstSpaceIndex);
        payload = trimmedInput.substring(firstSpaceIndex + 1);
      } else {
        tag = trimmedInput;
        payload = "";
      }
    }

    const newUserMessage: Message = {
      id: Date.now(),
      text: trimmedInput || "[đã gửi ảnh]",
      sender: "user",
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputText("");
    setIsLoading(true);

    // Gửi ảnh hoặc text phân tích sơ đồ
    if (tag === "@diagram") {
      try {
        if (imageBase64 && !imageBase64.startsWith("data:image/")) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              text: "❌ Ảnh không hợp lệ hoặc chưa tải xong.",
              sender: "ai",
            },
          ]);
          setIsLoading(false);
          return;
        }

        const response = await generateDiagram({
          text: payload || undefined,
          image: imageBase64?.split(",")[1] || undefined,
          language: isVietnameseText(inputText) ? "vietnamese" : "english",
        });
        console.log("response ->", response);

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: "✅ Đã phân tích sơ đồ. Mở tab mới để xem!",
            sender: "ai",
          },
        ]);

        if (imageBase64) {
          sessionStorage.setItem("diagramImage", imageBase64);
          window.open(`/diagram/${currentSessionId}?type=image`, "_blank");
        } else {
          const inputData = encodeURIComponent(payload);
          window.open(
            `/diagram/${currentSessionId}?type=text&q=${inputData}`,
            "_blank"
          );
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 2,
            text: "❌ Gặp lỗi khi phân tích sơ đồ",
            sender: "ai",
          },
        ]);
      } finally {
        setIsLoading(false);
        setImageBase64(null);
      }
    } else {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 3,
            text: "📌 Đã ghi nhận yêu cầu.",
            sender: "ai",
          },
        ]);
        setIsLoading(false);
        setImageBase64(null);
      }, 1000);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !isLoading) {
      handleSendMessage();
    }
  };

  return (
    <div className="chat-page">
      <MessageList
        messages={messages}
        isLoading={isLoading}
        messageListRef={messageListRef}
      />

      <div className="input-area">
        {showSuggestions && <Suggestions onClickTag={handleSuggestionClick} />}

        <ChatInput
          inputText={inputText}
          isLoading={isLoading}
          onInputChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onSend={handleSendMessage}
          onFileUpload={(base64) => {
            setImageBase64(base64);
          }}
          imageBase64={imageBase64}
          setImageBase64={setImageBase64}
        />
      </div>
    </div>
  );
};
