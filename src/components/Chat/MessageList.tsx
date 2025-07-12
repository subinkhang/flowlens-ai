import { MessageItem } from "./MessageItem";
import type { Message } from "./types";

export const MessageList = ({
  messages,
  isLoading,
  messageListRef,
}: {
  messages: Message[];
  isLoading: boolean;
  messageListRef: React.RefObject<HTMLDivElement | null>;
}) => (
  <div className="message-list" ref={messageListRef}>
    {messages.map((msg) => (
      <MessageItem key={msg.id} message={msg} />
    ))}
    {isLoading && (
      <div className="loading-indicator">FlowLens đang suy nghĩ...</div>
    )}
  </div>
);
