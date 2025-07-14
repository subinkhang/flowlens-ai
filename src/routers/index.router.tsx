import { createBrowserRouter } from "react-router-dom";
import { DiagramPage } from "../pages/DiagramPage";
import { ChatPage } from "../pages/ChatPage";
import AnalyzePage from "../pages/AnalyzePage";
import DocumentsPage from '../pages/DocumentsPage';
import DocumentDetailPage from '../pages/DocumentDetailPage';

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
  {
    path: "/documents",
    element: <DocumentsPage />,
  },
  {
    path: "/documents/:documentId",
    element: <DocumentDetailPage />,
  },
]);

export default router;
