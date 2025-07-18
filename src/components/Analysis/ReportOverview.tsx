import React from "react";
import ReportCard from "./ReportCard";
import type { Overview } from "../../types/ApiResponse";

interface ReportOverviewProps {
  overview: Overview;
}

const ReportOverview: React.FC<ReportOverviewProps> = ({ overview }) => {
  return (
    <ReportCard title="Tổng quan">
      <p>
        <strong>Tên quy trình:</strong> {overview.process_name}
      </p>
      <p>
        <strong>Mục đích:</strong> {overview.purpose}
      </p>
      <p>
        <strong>Loại quy trình:</strong>{" "}
        <span className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm">
          {overview.process_type}
        </span>
      </p>
      <p>
        <strong>Phạm vi:</strong> {overview.scope}
      </p>
      <p>
        <strong>Độ phức tạp:</strong>{" "}
        <span className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm">
          {overview.complexity_level}
        </span>
      </p>
    </ReportCard>
  );
};

export default ReportOverview;
