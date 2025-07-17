import React, { useEffect, useState, useRef } from "react";
import { useDiagramAnalysis } from "../hooks/useDiagramAnalysis";
import { useSession } from "../hooks/useSession"; 
// Import các component con để hiển thị báo cáo
import ReportOverview from "../components/Analysis/ReportOverview";
import ReportComponents from "../components/Analysis/ReportComponents";
import ReportExecution from "../components/Analysis/ReportExecution";
import ReportEvaluation from "../components/Analysis/ReportEvaluation";
import ReportImprovement from "../components/Analysis/ReportImprovement";
import ReportSummary from "../components/Analysis/ReportSummary";
import ReportSources from "../components/Analysis/ReportSources";

const AnalyzePage: React.FC = () => {
  // Lấy các hàm và state từ cả hai hook
  const { analysisData, isLoading, error, runAnalysis, statusMessage } = useDiagramAnalysis();
  const { sessionId } = useSession(); // Lấy sessionId từ URL
  const [timestamp, setTimestamp] = useState("");
  const hasRunAnalysis = useRef(false);

  // Logic set timestamp (giữ nguyên)
  useEffect(() => {
    const now = new Date();
    setTimestamp(
      now.toLocaleString("vi-VN", {
        dateStyle: "full",
        timeStyle: "short",
      })
    );
  }, []);

  // --- useEffect chính đã được MERGE ---
  useEffect(() => {
    // Chỉ chạy logic nếu đây là lần đầu tiên component được render
    if (hasRunAnalysis.current === false) {
      const storedState = localStorage.getItem("analysisState");
      if (!storedState) {
        console.error("Không tìm thấy 'analysisState' để bắt đầu phân tích.");
        // Bạn có thể muốn set một lỗi cụ thể ở đây nếu cần
        return;
      }
      
      const parsedPayload = JSON.parse(storedState);
      
      // Kích hoạt quá trình phân tích từ hook
      runAnalysis(
        parsedPayload.nodes || [],
        parsedPayload.edges || [],
        parsedPayload.selectedDocumentIds || [],
        parsedPayload.question || "Hãy phân tích sơ đồ này.",
        parsedPayload.sessionId || ""
      );

      // Đánh dấu là đã chạy để tránh gọi lại khi re-render
      hasRunAnalysis.current = true;
    }
  }, [runAnalysis]);
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-700 bg-white">
        <svg
          className="animate-spin h-10 w-10 text-blue-500 mb-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3 3 3H4z"></path>
        </svg>
        {/* Hiển thị thông báo trạng thái động từ hook */}
        <h2 className="text-xl font-semibold">{statusMessage || "Đang khởi tạo..."}</h2>
        <p className="text-sm text-gray-500 mt-2">Quá trình này có thể mất vài giây.</p>
      </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-red-50 text-red-600">
            {/* ... JSX cho lỗi ... */}
            <h2 className="text-xl font-semibold">Đã xảy ra lỗi</h2>
            <p className="text-sm text-gray-500 mt-2">{error}</p>
        </div>
    );
  }

  if (!analysisData || !analysisData.analysis) {
    // Trạng thái này sẽ ít xảy ra hơn, vì `isLoading` sẽ true cho đến khi có kết quả hoặc lỗi
    return (
        <div className="flex flex-col items-center justify-center h-screen text-gray-600">
            {/* ... JSX khi không có dữ liệu ... */}
        </div>
    );
  }

  const { analysis, sources } = analysisData;

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Báo cáo & phân tích</h1>
      <p className="text-sm text-gray-600 mb-6">Thời gian tạo báo cáo: {timestamp}</p>
      
      <ReportOverview overview={analysis.overview} />
      <ReportComponents components={analysis.components} />
      <ReportExecution execution={analysis.execution} />
      <ReportEvaluation evaluation={analysis.evaluation} sources={sources} />
      <ReportImprovement improvement={analysis.improvement} sources={sources} />
      <ReportSummary summary={analysis.summary} sources={sources} />
      <ReportSources sources={sources} />
    </div>
  );
};

export default AnalyzePage;