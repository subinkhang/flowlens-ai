import React from "react";
import ReportCard from "./ReportCard";
import type { Summary } from "../../types/ApiResponse";
import { TextWithCitations } from "./TextWithCitations";

interface ReportSummaryProps {
  summary: Summary;
  sources: any[];
}

const ReportSummary: React.FC<ReportSummaryProps> = ({ summary, sources }) => {
  return (
    <ReportCard title="Tóm tắt & Khuyến nghị">
      <div>
        <strong className="block text-lg text-gray-800 mb-2">Kết luận:</strong>
        <div className="bg-teal-50 border-l-4 border-green-500 p-4 rounded-md font-semibold text-green-700">
          <TextWithCitations text={summary.conclusion} sources={sources} />
        </div>
      </div>

      <p>
        <strong>Khuyến nghị:</strong>
      </p>
      <ol className="list-disc pl-5">
        {summary.recommendations.map((rec, index) => (
          <li key={index} className="mb-2">
            <TextWithCitations text={rec} sources={sources} />
          </li>
        ))}
      </ol>
    </ReportCard>
  );
};

export default ReportSummary;
