import { Routes, Route } from 'react-router-dom';
import { ChatPage } from './components/ChatPage';
import { DiagramPage } from './components/DiagramPage';
import { AnalysisPage } from './components/AnalysisPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ChatPage />} />

      <Route path="/diagram" element={<DiagramPage />} />

      <Route path="/analysis" element={<AnalysisPage />} />
    </Routes>
  );
}

export default App;