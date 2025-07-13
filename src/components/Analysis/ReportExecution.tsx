import React from "react";
import ReportCard from "./ReportCard";
import type { Execution } from "../../types/ApiResponse";

interface ReportExecutionProps {
  execution: Execution;
}

const ReportExecution: React.FC<ReportExecutionProps> = ({ execution }) => {
  return (
    <ReportCard title="Thực thi">
      <p>
        <strong>SLA:</strong> {execution.sla}
      </p>
      <p>
        <strong>Yêu cầu đầu vào:</strong>{" "}
        {execution.input_requirements.join(", ")}
      </p>
      <p>
        <strong>Đầu ra:</strong> {execution.output}
      </p>
      <p>
        <strong>Tích hợp hệ thống:</strong>{" "}
        {execution.system_integration.length > 0
          ? execution.system_integration.join(", ")
          : "Không có"}
      </p>
    </ReportCard>
  );
};

export default ReportExecution;
