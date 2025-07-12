import type { Message } from "./types";

export const MessageItem = ({ message }: { message: Message }) => (
  <div className={`message ${message.sender}-message`}>{message.text}</div>
);
