import React from 'react';
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';
import type { EdgeProps } from 'reactflow';
import type { Rule } from './ConditionPanel'; // Import Rule từ Panel

const EdgeLabel = ({ rules, logic }: { rules: Rule[], logic: 'AND' | 'OR' }) => {
  if (!rules || rules.length === 0) return null;
  return (
    <div
      style={{
        padding: '5px 10px',
        background: '#ffcc00',
        borderRadius: '5px',
        fontSize: '10px',
        pointerEvents: 'all',
      }}
    >
      {rules.map((rule, i) => (
        <div key={rule.id}>
          {`[${rule.field} ${rule.operator} ${rule.value}]`}
          {i < rules.length - 1 && <strong> {logic} </strong>}
        </div>
      ))}
    </div>
  );
};


export const CustomEdge: React.FC<EdgeProps> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'none',
          }}
          className="nodrag nopan"
        >
          <EdgeLabel rules={data?.rules} logic={data?.logic} />
        </div>
      </EdgeLabelRenderer>
    </>
  );
};