import React from "react";
import ReportCard from "./ReportCard";
import type { Components } from "../../types/ApiResponse";

interface ReportComponentsProps {
  components: Components;
}

const ReportComponents: React.FC<ReportComponentsProps> = ({ components }) => {
  return (
    <ReportCard title="Thành phần quy trình">
      <p>
        <strong>Bắt đầu:</strong> {components.start_event}
      </p>
      <p>
        <strong>Kết thúc:</strong> {components.end_event}
      </p>
      <p>
        <strong>Các tác nhân chính:</strong>{" "}
        {components.actors.map((actor) => (
          <span
            key={actor}
            className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm mr-1"
          >
            {actor}
          </span>
        ))}
      </p>
      <p>
        <strong>Các bước:</strong>
      </p>
      <ol className="list-decimal pl-5">
        {components.steps.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ol>
      <p>
        <strong>Trình tự:</strong> {components.sequence}
      </p>
    </ReportCard>
  );
};

export default ReportComponents;
