import { Routes, Route } from 'react-router-dom';
import { ChatPage } from './components/ChatPage';
import { DiagramPage } from './components/DiagramPage';

function App() {
  return (
    <Routes>
      {/* Route cho trang chat (trang chủ) */}
      <Route path="/" element={<ChatPage />} />

      {/* Route cho trang sơ đồ */}
      <Route path="/diagram" element={<DiagramPage />} />

      {/* Bạn có thể thêm route cho trang 3 ở đây sau */}
      {/* <Route path="/analysis" element={<AnalysisPage />} /> */}
    </Routes>
  );
}

export default App;