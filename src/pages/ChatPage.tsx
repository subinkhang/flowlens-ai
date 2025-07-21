import React, { useState, useEffect, useRef } from "react";
// Import các hook từ react-router-dom
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

// --- ĐỊNH NGHĨA KIỂU DỮ LIỆU VÀ TAGS ---
export interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
}
export const TAG_SUGGESTIONS = ["@diagram", "@ask", "@improve"];

// Hàm helper để tạo khóa cache động dựa trên sessionId
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

  useEffect(() => {
    if (!sessionId) {
      const newId = generateSessionId();
      navigate(`/chat/${newId}`, { replace: true });
      return; // Dừng lại để chờ component re-render với sessionId mới
    }

    const cacheKey = createChatCacheKey(sessionId);
    const cachedMessages = localStorage.getItem(cacheKey);

    if (cachedMessages) {
      console.log(
        `Đã tìm thấy lịch sử chat cho session ${sessionId}. Đang khôi phục...`
      );
      setMessages(JSON.parse(cachedMessages));
    } else {
      console.log(`Tạo phiên làm việc mới cho session ${sessionId}.`);
      setMessages([
        {
          id: 1,
          text: `🎯 Phiên làm việc: ${sessionId.substring(
            0,
            18
          )}... Gõ @ để xem lệnh.`,
          sender: "ai",
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, navigate]); // Chạy lại khi sessionId trên URL thay đổi

  useEffect(() => {
    // Chỉ lưu khi có sessionId và có tin nhắn
    if (sessionId && messages.length > 0) {
      const cacheKey = createChatCacheKey(sessionId);
      localStorage.setItem(cacheKey, JSON.stringify(messages));
      console.log(
        `Đã cập nhật lịch sử chat cho session ${sessionId} vào cache.`
      );
    }
  }, [messages, sessionId]); // Theo dõi sự thay đổi của messages và sessionId

  // useEffect để cuộn không thay đổi
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // --- CÁC HÀM HANDLER ---
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

    // Không có ảnh + không có text
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
    
    const chatHistoryForApi: { role: "user" | "assistant"; content: string }[] = messages
      .filter(m => m.sender === 'user' || m.sender === 'ai') // Lọc các tin nhắn hệ thống
      .map(m => ({
        role: m.sender === 'ai' ? 'assistant' : 'user',
        content: m.text,
      }));

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
          // Tạo một khóa động, duy nhất cho session này
          const diagramImageKey = `diagram_image_${sessionId}`;
          // Lưu ảnh vào localStorage với khóa động
          localStorage.setItem(diagramImageKey, imageBase64);
          // Mở tab mới, URL không đổi
          window.open(`/diagram/${sessionId}?type=image`, "_blank");
        } else {
          const inputData = encodeURIComponent(payload);
          window.open(
            `/diagram/${sessionId}?type=text&q=${inputData}`,
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
    } else if (tag === "@ask") {
      // Logic cho tag @ask
      try {
        // Lấy sơ đồ gần nhất liên quan đến session này
        const diagramData = getLatestDiagramForSession(sessionId || '');

        if (!diagramData) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              text: "⚠️ Không tìm thấy sơ đồ nào liên quan đến phiên này để hỏi. Vui lòng tạo một sơ đồ trước bằng lệnh `@diagram`.",
              sender: "ai",
            },
          ]);
          setIsLoading(false);
          return;
        }

        const apiPayload = {
          diagram: diagramData,
          question: payload, // `payload` là nội dung câu hỏi sau tag @ask
          chatHistory: chatHistoryForApi,
          selectedDocumentIds: [], // Tạm thời để rỗng
        };

        // Gọi API
        const response = await askQuestionApi(apiPayload);

        // Hiển thị câu trả lời của AI
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 2,
            text: response.answer,
            sender: "ai",
          },
        ]);

      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 3,
            text: "❌ Rất tiếc, đã có lỗi xảy ra khi xử lý câu hỏi của bạn.",
            sender: "ai",
          },
        ]);
      } finally {
        setIsLoading(false);
        setImageBase64(null); // Xóa ảnh nếu có
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

  return (
    <div className="chat-layout">
      <aside className="chat-sidebar-left">
        <History
          onSelect={(selectedId) => {
            navigate(`/chat/${selectedId}`);
          }}
        />
      </aside>

      <main className="chat-main">
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

      <aside className="chat-sidebar-right">
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
