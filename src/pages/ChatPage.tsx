import React, { useState, useEffect, useRef } from "react";

import "./css/ChatPage.css";
import type { Message } from "../components/Chat/types";
import { generateSessionId } from "../utils/sessionId";
import { generateDiagram } from "../api/diagramApi";
import { MessageList } from "../components/Chat/MessageList";
import { Suggestions } from "../components/Chat/Suggestions";
import { ChatInput } from "../components/Chat/ChatInput";
import { isVietnameseText } from "../utils/isVietnameseText";

export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [, setSessionId] = useState("");
  const messageListRef = useRef<HTMLDivElement>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !isLoading) {
      handleSendMessage();
    }
  };

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

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
    setMessages((prev) => [...prev, newUserMessage]);
    setInputText("");
    setIsLoading(true);

    // Gửi ảnh
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
          window.open(`/diagram?type=image`, "_blank");
        } else {
          const inputData = encodeURIComponent(payload);
          window.open(`/diagram?type=text&q=${inputData}`, "_blank");
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
