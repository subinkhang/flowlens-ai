import { SessionProvider } from "../../contexts/SessionProvider";
import { ChatPage } from "../ChatPage";

const ChatPageWrapper = () => (
  <SessionProvider>
    <ChatPage />
  </SessionProvider>
);

export default ChatPageWrapper;
