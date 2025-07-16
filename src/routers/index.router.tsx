import { createBrowserRouter } from "react-router-dom";
import RedirectToNewSession from "../components/Redirect/RedirectToNewSession";
import ChatPageWrapper from "../pages/wrapper/ChatPageWrapper";
import DiagramPageWrapper from "../pages/wrapper/DiagramPageWrapper";
import AnalyzePageWrapper from "../pages/wrapper/AnalyzePageWrapper";

import DocumentsPage from '../pages/DocumentsPage';
import DocumentDetailPage from '../pages/DocumentDetailPage';

const router = createBrowserRouter([
  { 
    path: "/", 
    element: <RedirectToNewSession /> 
  },
  { 
    path: "/chat", 
    element: <RedirectToNewSession /> 
  },

  { 
    path: "/chat/:sessionId", 
    element: <ChatPageWrapper /> 
  },
  { 
    path: "/diagram/:sessionId", 
    element: <DiagramPageWrapper /> 
  },
  { 
    path: "/analyze/:sessionId", 
    element: <AnalyzePageWrapper /> 
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