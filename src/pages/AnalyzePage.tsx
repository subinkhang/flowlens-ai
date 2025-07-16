import React, { useEffect, useState } from "react";
import { useDiagramAnalysis } from "../hooks/useDiagramAnalysis";
import ReportOverview from "../components/Analysis/ReportOverview";
import ReportComponents from "../components/Analysis/ReportComponents";
import ReportExecution from "../components/Analysis/ReportExecution";
import ReportEvaluation from "../components/Analysis/ReportEvaluation";
import ReportImprovement from "../components/Analysis/ReportImprovement";
import ReportSummary from "../components/Analysis/ReportSummary";
import ReportSources from "../components/Analysis/ReportSources";

const AnalyzePage: React.FC = () => {
  const { analysisData, loading, error, runAnalysis } = useDiagramAnalysis();
  const [timestamp, setTimestamp] = useState("");

  useEffect(() => {
    const now = new Date();
    setTimestamp(
      now.toLocaleString("vi-VN", {
        dateStyle: "full",
        timeStyle: "short",
      })
    );
  }, []);

  useEffect(() => {
    // Đặt một cái tên rõ ràng cho hàm xử lý logic
    const initializeAndRunAnalysis = () => {
        // Lấy dữ liệu đã được lưu từ trang Diagram
        const storedState = localStorage.getItem("analysisState");

        // Nếu không có dữ liệu, dừng lại và báo lỗi (hook sẽ tự set state error)
        if (!storedState) {
            console.error("Không tìm thấy 'analysisState' trong localStorage. Không thể chạy phân tích.");
            // Bạn có thể set một lỗi cụ thể ở đây nếu muốn
            // setError("Không tìm thấy dữ liệu để phân tích. Vui lòng bắt đầu lại.");
            return;
        }

        try {
            const parsedPayload = JSON.parse(storedState);

            // Kiểm tra cấu trúc cơ bản của dữ liệu đã parse
            if (parsedPayload && parsedPayload.diagram) {
                // Lấy các giá trị ra, cung cấp giá trị mặc định để tránh lỗi
                const nodes = parsedPayload.diagram?.nodes || [];
                const edges = parsedPayload.diagram?.edges || [];
                const question = parsedPayload.question || "Hãy phân tích sơ đồ này.";
                const selectedDocumentIds = parsedPayload.selectedDocumentIds || [];
                
                // Gọi hàm phân tích với các tham số đã được chuẩn hóa
                runAnalysis(nodes, edges, selectedDocumentIds, question);
            } else {
                // Nếu dữ liệu có nhưng cấu trúc sai, ném lỗi
                throw new Error("Dữ liệu trong localStorage có cấu trúc không hợp lệ.");
            }
        } catch (e) {
            // Nếu JSON.parse thất bại, bắt lỗi
            console.error("Lỗi khi parse dữ liệu từ localStorage:", e);
            //setError("Dữ liệu phân tích đã lưu bị lỗi, không thể đọc được.");
        }
    };
    
    // Gọi hàm xử lý logic
    initializeAndRunAnalysis();

    // Set timestamp
    setTimestamp(new Date().toLocaleString("vi-VN", {
        dateStyle: "full",
        timeStyle: "short",
    }));
  }, []);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-700 bg-white">
        <svg
          className="animate-spin h-10 w-10 text-blue-500 mb-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3 3 3H4z"
          ></path>
        </svg>
        <h2 className="text-xl font-semibold">Đang phân tích quy trình...</h2>
        <p className="text-sm text-gray-500 mt-2">
          Vui lòng chờ trong giây lát.
        </p>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-red-50 text-red-600">
        <svg
          className="w-12 h-12 mb-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 className="text-xl font-semibold">Đã xảy ra lỗi</h2>
        <p className="text-sm text-gray-500 mt-2">{error}</p>
      </div>
    );

  console.log("analysisData", analysisData);
  if (!analysisData || !analysisData.analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-600">
        <svg
          className="w-12 h-12 mb-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-4-14v14"
          />
        </svg>
        <h2 className="text-xl font-semibold">Không có dữ liệu phân tích</h2>
        <p className="text-sm text-gray-500 mt-2">
          Vui lòng nhập sơ đồ và câu hỏi trước đó.
        </p>
      </div>
    );
  }

  const { analysis, sources } = analysisData;

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Báo cáo & phân tích
      </h1>
      <p className="text-sm text-gray-600 mb-6">
        Thời gian tạo báo cáo: {timestamp}
      </p>
      <ReportOverview overview={analysis.overview} />
      <ReportComponents components={analysis.components} />
      <ReportExecution execution={analysis.execution} />
      <ReportEvaluation evaluation={analysis.evaluation} />
      <ReportImprovement improvement={analysis.improvement} />
      <ReportSummary summary={analysis.summary} />
      <ReportSources sources={sources} />
    </div>
  );
};

export default AnalyzePage;
