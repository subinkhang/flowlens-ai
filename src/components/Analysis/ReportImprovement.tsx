import React from "react";
import ReportCard from "./ReportCard";
import type { SourceDocument, Improvement } from "../../types/ApiResponse";
import { TextWithCitations } from "./TextWithCitations";

interface ReportImprovementProps {
  improvement: Improvement;
  sources: SourceDocument[];
}

const ReportImprovement: React.FC<ReportImprovementProps> = ({
  improvement,
  sources,
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
        <TextWithCitations text={improvement.optimization_opportunities.join(", ")} sources={sources} />
      </p>
      <p>
        <strong>Tự động hóa:</strong>{" "}
        <TextWithCitations text={improvement.automation_possibility} sources={sources} />
      </p>
      <p>
        <strong>KPIs:</strong>
      </p>
      <ul className="list-disc pl-5">
        {improvement.kpis.map((kpi, index) => (
          <li key={index}>
            <TextWithCitations text={kpi} sources={sources} />
          </li>
        ))}
      </ul>
    </ReportCard>
  );
};

export default ReportImprovement;
