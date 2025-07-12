import { createBrowserRouter } from "react-router-dom";
import { DiagramPage } from "../pages/DiagramPage";
import { ChatPage } from "../pages/ChatPage";

const router = createBrowserRouter([
  { children: [{ element: <ChatPage />, path: "/" }] },
  {
    element: <DiagramPage />,
    path: "/diagram",
  },
]);

export default router;
