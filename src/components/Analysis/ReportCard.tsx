import React from "react";

interface ReportCardProps {
  title: string;
  children: React.ReactNode;
}

export const ReportCard: React.FC<ReportCardProps> = ({ title, children }) => (
  <div className="bg-white p-4 mb-4 rounded-lg shadow-md border border-gray-200">
    <h2 className="text-xl font-semibold text-gray-800 border-l-4 border-blue-500 pl-2 mb-4">
      {title}
    </h2>
    {children}
  </div>
);

export default ReportCard;
