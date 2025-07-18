import React from "react";
import ReportCard from "./ReportCard";
import type { SourceDocument } from "../../types/ApiResponse";

interface ReportSourcesProps {
  sources: SourceDocument[];
}

const ReportSources: React.FC<ReportSourcesProps> = ({ sources }) => {
  return (
    <ReportCard title="Nguồn tham khảo">
      <table className="w-full border-collapse mt-2">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-left">Tên</th>
            <th className="border border-gray-300 p-2 text-left">Trích đoạn</th>
            <th className="border border-gray-300 p-2 text-left">Score</th>
          </tr>
        </thead>
        <tbody>
          {sources.map((source, index) => (
            <tr key={index}>
              <td className="border border-gray-300 p-2">{source.title}</td>
              <td className="border border-gray-300 p-2">
                {source.content_preview}
              </td>
              <td className="border border-gray-300 p-2">
                {source.score.toFixed(3)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ReportCard>
  );
};

export default ReportSources;
