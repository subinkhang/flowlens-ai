import { Routes, Route } from 'react-router-dom';
import { ChatPage } from './pages/ChatPage';
import { DiagramPage } from './pages/DiagramPage';
import { AnalysisPage } from './components/AnalysisPage';
import DocumentsPage from './pages/DocumentsPage';
import DocumentDetailPage from './pages/DocumentDetailPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ChatPage />} />

      <Route path="/diagram" element={<DiagramPage />} />

      <Route path="/analysis" element={<AnalysisPage />} />
        
      <Route path="/documents" element={<DocumentsPage />} />

      <Route path="/documents/:documentId" element={<DocumentDetailPage />} />
    </Routes>
  );
}

export default App;