import React from "react";
import ReportCard from "./ReportCard";
import type { Improvement } from "../../types/ApiResponse";

interface ReportImprovementProps {
  improvement: Improvement;
}

const ReportImprovement: React.FC<ReportImprovementProps> = ({
  improvement,
}) => {
  return (
    <ReportCard title="Cải tiến">
      <p>
        <strong>Điểm nghẽn:</strong>{" "}
        {improvement.bottlenecks.length > 0
          ? improvement.bottlenecks.join(", ")
          : "Không có"}
      </p>
      <p>
        <strong>Cơ hội tối ưu:</strong>{" "}
        {improvement.optimization_opportunities.join(", ")}
      </p>
      <p>
        <strong>Tự động hóa:</strong> {improvement.automation_possibility}
      </p>
      <p>
        <strong>KPIs:</strong>
      </p>
      <ul className="list-disc pl-5">
        {improvement.kpis.map((kpi, index) => (
          <li key={index}>{kpi}</li>
        ))}
      </ul>
    </ReportCard>
  );
};

export default ReportImprovement;
