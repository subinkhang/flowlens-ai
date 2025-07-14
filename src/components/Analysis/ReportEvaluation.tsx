import React from "react";
import ReportCard from "./ReportCard";
import type { Evaluation } from "../../types/ApiResponse";

interface ReportEvaluationProps {
  evaluation: Evaluation;
}

const ReportEvaluation: React.FC<ReportEvaluationProps> = ({ evaluation }) => {
  return (
    <ReportCard title="Đánh giá">
      <p className="mb-2">
        <strong className="text-gray-800">Tính logic:</strong>{" "}
        {evaluation.logic_coherence}
      </p>
      <p className="mb-2">
        <strong className="text-gray-800">Tính đầy đủ:</strong>{" "}
        <span className="bg-yellow-50 text-gray-800 p-2 rounded-md inline-flex items-center">
          {evaluation.completeness}
        </span>
      </p>
      <p className="mb-2">
        <strong className="text-gray-800">Rủi ro:</strong>
      </p>
      <ul className="list-disc pl-5">
        {evaluation.risks.map((risk, index) => (
          <li
            key={index}
            className="bg-red-50 text-red-600 p-2 mb-2 rounded-md flex items-center"
          >
            <span className="mr-2">❗</span> {risk}
          </li>
        ))}
      </ul>
      <p>
        <strong className="text-gray-800">Tuân thủ:</strong>{" "}
        {evaluation.compliance}
      </p>
    </ReportCard>
  );
};

export default ReportEvaluation;
