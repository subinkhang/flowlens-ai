import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createConversation } from "../../api/mocks/conversationApi";

const RedirectToNewSession = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await createConversation();
        navigate(`/chat/${session.conversationId}`);
        console.log("session ->", session);
      } catch (err) {
        console.error("Lỗi tạo session:", err);
        navigate("/error"); // nếu muốn
      }
    };

    fetchSession();
  }, []);

  return <p>Đang tạo phiên làm việc...</p>;
};

export default RedirectToNewSession;
