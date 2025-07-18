import React from "react";
import ReportCard from "./ReportCard";
import type { SourceDocument, Evaluation } from "../../types/ApiResponse";
import { TextWithCitations } from "./TextWithCitations";

interface ReportEvaluationProps {
  evaluation: Evaluation;
  sources: SourceDocument[];
}

const ReportEvaluation: React.FC<ReportEvaluationProps> = ({ evaluation, sources }) => {
  return (
    <ReportCard title="Đánh giá">
      <p className="mb-2">
        <strong className="text-gray-800">Tính logic:</strong>{" "}
        <TextWithCitations text={evaluation.logic_coherence} sources={sources} />
      </p>
      <p className="mb-2">
        <strong className="text-gray-800">Tính đầy đủ:</strong>{" "}
        <span className="bg-yellow-50 text-gray-800 p-2 rounded-md inline-flex items-center">
          <TextWithCitations text={evaluation.completeness} sources={sources} />
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
            <span className="mr-2">❗</span> <TextWithCitations text={risk} sources={sources} />
          </li>
        ))}
      </ul>
      <p>
        <strong className="text-gray-800">Tuân thủ:</strong>{" "}
        <TextWithCitations text={evaluation.compliance} sources={sources} />
      </p>
    </ReportCard>
  );
};

export default ReportEvaluation;
