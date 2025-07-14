import React from "react";
import ReportCard from "./ReportCard";
import type { Summary } from "../../types/ApiResponse";

interface ReportSummaryProps {
  summary: Summary;
}

const ReportSummary: React.FC<ReportSummaryProps> = ({ summary }) => {
  return (
    <ReportCard title="Tóm tắt & Khuyến nghị">
      <div>
        <strong className="block text-lg text-gray-800 mb-2">Kết luận:</strong>
        <div className="bg-teal-50 border-l-4 border-green-500 p-4 rounded-md font-semibold text-green-700">
          {summary.conclusion}
        </div>
      </div>

      <p>
        <strong>Khuyến nghị:</strong>
      </p>
      <ol className="list-disc pl-5">
        {summary.recommendations.map((recommendation, index) => (
          <li key={index}>✅ {recommendation}</li>
        ))}
      </ol>
    </ReportCard>
  );
};

export default ReportSummary;
