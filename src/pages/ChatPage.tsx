import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import "./css/ChatPage.css";
import { generateSessionId } from "../utils/sessionId";
import { generateDiagram } from "../api/diagramApi";
import { MessageList } from "../components/Chat/MessageList";
import { Suggestions } from "../components/Chat/Suggestions";
import { ChatInput } from "../components/Chat/ChatInput";
import { isVietnameseText } from "../utils/isVietnameseText";
import { History } from "../components/History/History";
import { askQuestionApi } from "../api/chatApi";
import { getLatestDiagramForSession } from "../utils/diagramUtils";

export interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
}
export const TAG_SUGGESTIONS = ["@diagram", "@ask", "@improve"];

const createChatCacheKey = (sessionId: string) =>
  `flowlens_chat_history_${sessionId}`;

export const ChatPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId?: string }>();
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  // === START: State mới cho responsive ===
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  // === END: State mới cho responsive ===

  useEffect(() => {
    if (!sessionId) {
      const newId = generateSessionId();
      navigate(`/chat/${newId}`, { replace: true });
      return;
    }
    const cacheKey = createChatCacheKey(sessionId);
    const cachedMessages = localStorage.getItem(cacheKey);

    if (cachedMessages) {
      setMessages(JSON.parse(cachedMessages));
    } else {
      setMessages([
        {
          id: 1,
          text: `🎯 Phiên làm việc: ${sessionId.substring(0, 18)}... Gõ @ để xem lệnh.`,
          sender: "ai",
        },
      ]);
    }
  }, [sessionId, navigate]);

  useEffect(() => {
    if (sessionId && messages.length > 0) {
      const cacheKey = createChatCacheKey(sessionId);
      localStorage.setItem(cacheKey, JSON.stringify(messages));
    }
  }, [messages, sessionId]);

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
        { id: Date.now(), text: "⚠️ Bạn cần nhập nội dung hoặc tải ảnh lên.", sender: "ai" },
      ]);
      return;
    }
    setShowSuggestions(false);

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

    const newUserMessage: Message = { id: Date.now(), text: trimmedInput || "[đã gửi ảnh]", sender: "user" };
    
    const chatHistoryForApi: { role: "user" | "assistant"; content: string }[] = messages
      .filter(m => m.sender === 'user' || m.sender === 'ai')
      .map(m => ({ role: m.sender === 'ai' ? 'assistant' : 'user', content: m.text }));

    setMessages((prev) => [...prev, newUserMessage]);
    setInputText("");
    setIsLoading(true);

    if (tag === "@diagram") {
      try {
        if (imageBase64 && !imageBase64.startsWith("data:image/")) {
          setMessages((prev) => [...prev, { id: Date.now(), text: "❌ Ảnh không hợp lệ hoặc chưa tải xong.", sender: "ai" }]);
          setIsLoading(false);
          return;
        }

        const response = await generateDiagram({
          text: payload || undefined,
          image: imageBase64?.split(",")[1] || undefined,
          language: isVietnameseText(inputText) ? "vietnamese" : "english",
        });
        console.log("response ->", response);

        setMessages((prev) => [...prev, { id: Date.now() + 1, text: "✅ Đã phân tích sơ đồ. Mở tab mới để xem!", sender: "ai" }]);

        if (imageBase64) {
          const diagramImageKey = `diagram_image_${sessionId}`;
          localStorage.setItem(diagramImageKey, imageBase64);
          window.open(`/diagram/${sessionId}?type=image`, "_blank");
        } else {
          const inputData = encodeURIComponent(payload);
          window.open(`/diagram/${sessionId}?type=text&q=${inputData}`, "_blank");
        }
      } catch {
        setMessages((prev) => [...prev, { id: Date.now() + 2, text: "❌ Gặp lỗi khi phân tích sơ đồ", sender: "ai" }]);
      } finally {
        setIsLoading(false);
        setImageBase64(null);
      }
    } else if (tag === "@ask") {
      try {
        const diagramData = getLatestDiagramForSession(sessionId || '');

        if (!diagramData) {
          setMessages((prev) => [...prev, { id: Date.now() + 1, text: "⚠️ Không tìm thấy sơ đồ nào liên quan đến phiên này để hỏi. Vui lòng tạo một sơ đồ trước bằng lệnh `@diagram`.", sender: "ai" }]);
          setIsLoading(false);
          return;
        }

        const apiPayload = { diagram: diagramData, question: payload, chatHistory: chatHistoryForApi, selectedDocumentIds: [] };
        const response = await askQuestionApi(apiPayload);
        setMessages((prev) => [...prev, { id: Date.now() + 2, text: response.answer, sender: "ai" }]);

      } catch (error) {
        setMessages((prev) => [...prev, { id: Date.now() + 3, text: "❌ Rất tiếc, đã có lỗi xảy ra khi xử lý câu hỏi của bạn.", sender: "ai" }]);
      } finally {
        setIsLoading(false);
        setImageBase64(null);
      }
    } else {
      setTimeout(() => {
        setMessages((prev) => [...prev, { id: Date.now() + 3, text: "📌 Đã ghi nhận yêu cầu.", sender: "ai" }]);
        setIsLoading(false);
        setImageBase64(null);
      }, 1000);
    }
  };

  return (
    <div className="chat-layout">
      {/* === THAY ĐỔI: Thêm class is-open dựa trên state === */}
      <aside className={`chat-sidebar-left ${isLeftSidebarOpen ? "is-open" : ""}`}>
        <button className="close-sidebar-btn" onClick={() => setIsLeftSidebarOpen(false)}>
          Đóng Lịch sử
        </button>
        <History
          onSelect={(selectedId) => {
            navigate(`/chat/${selectedId}`);
            setIsLeftSidebarOpen(false); // Đóng sidebar sau khi chọn
          }}
        />
      </aside>

      <main className="chat-main">
        {/* === THÊM MỚI: Header chỉ hiển thị trên mobile === */}
        <div className="mobile-header">
          <button onClick={() => setIsLeftSidebarOpen(true)}>Lịch sử</button>
          <span>Flowlens AI</span>
          <button onClick={() => setIsRightSidebarOpen(true)}>Công cụ</button>
        </div>

        <MessageList
          messages={messages}
          isLoading={isLoading}
          messageListRef={messageListRef}
        />

        <div className="input-area">
          {showSuggestions && (
            <Suggestions onClickTag={handleSuggestionClick} />
          )}
          <ChatInput
            inputText={inputText}
            isLoading={isLoading}
            onInputChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onSend={handleSendMessage}
            onFileUpload={(base64) => setImageBase64(base64)}
            imageBase64={imageBase64}
            setImageBase64={setImageBase64}
          />
        </div>
      </main>

      {/* === THAY ĐỔI: Thêm class is-open dựa trên state === */}
      <aside className={`chat-sidebar-right ${isRightSidebarOpen ? "is-open" : ""}`}>
        <button className="close-sidebar-btn" onClick={() => setIsRightSidebarOpen(false)}>
          Đóng Công cụ
        </button>
        <h3 className="sidebar-title">Công cụ</h3>
        <div className="sidebar-buttons">
          <Link to={`/diagram/${sessionId}`} className="sidebar-button">
            Xem Sơ đồ
          </Link>
          <Link to={`/analyze/${sessionId}`} className="sidebar-button">
            Xem Báo cáo
          </Link>
          <Link to={`/documents`} className="sidebar-button">
            Xem Tài liệu
          </Link>
        </div>
      </aside>
    </div>
  );
};