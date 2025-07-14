import { createBrowserRouter } from "react-router-dom";
import { DiagramPage } from "../pages/DiagramPage";
import { ChatPage } from "../pages/ChatPage";
import AnalyzePage from "../pages/AnalyzePage";

const router = createBrowserRouter([
  { children: [{ element: <ChatPage />, path: "/" }] },
  {
    element: <DiagramPage />,
    path: "/diagram",
  },
  {
    element: <AnalyzePage />,
    path: "/analyze",
  },
]);

export default router;
