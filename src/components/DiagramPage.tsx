import React, { useState, useCallback } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  addEdge,
  MarkerType,
  BackgroundVariant,
} from 'reactflow';
import type { OnConnect, Node, Edge, Connection } from 'reactflow'; 

import { ConditionPanel } from './ConditionPanel';
import type { Rule } from './ConditionPanel';
import { CustomEdge } from './CustomEdge'; // *** QUAN TRỌNG (1): Import CustomEdge ***

import 'reactflow/dist/style.css';
import './DiagramPage.css';

// *** QUAN TRỌNG (2): Đăng ký component CustomEdge ***
// Đây là bước "đăng ký" component của chúng ta với ReactFlow.
const edgeTypes = {
  custom: CustomEdge,
};

// ... (initialNodes giữ nguyên) ...
const initialNodes: Node[] = [
    { id: '1', type: 'input', data: { label: 'Khách hàng nộp hồ sơ vay' }, position: { x: 250, y: 5 } },
    { id: '2', data: { label: 'Chuyên viên tín dụng thẩm định hồ sơ' }, position: { x: 250, y: 100 } },
    { id: '3', data: { label: 'Trình hồ sơ lên cấp quản lý' }, position: { x: 250, y: 200 } },
    { id: '4', type: 'output', data: { label: 'Phê duyệt hoặc Từ chối' }, position: { x: 250, y: 300 } },
];

// *** QUAN TRỌNG (3): Cập nhật dữ liệu mẫu để sử dụng type 'custom' ***
const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'custom', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e2-3', source: '2', target: '3', type: 'custom', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e3-4', source: '3', target: '4', type: 'custom', markerEnd: { type: MarkerType.ArrowClosed } },
];

let nodeId = 5;

export const DiagramPage: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  const onConnect = useCallback(
    (params: Connection) => {
      // *** QUAN TRỌNG (4): Edge mới tạo ra cũng phải có type 'custom' ***
      const newEdge = { ...params, type: 'custom', animated: true, markerEnd: { type: MarkerType.ArrowClosed } };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    setSelectedEdge(edge);
  }, []);

  const onPaneClick = useCallback(() => setSelectedEdge(null), []);

  const handleSaveConditions = (edgeId: string, logic: 'AND' | 'OR', rules: Rule[]) => {
    setEdges((eds) =>
      eds.map((edge) => (edge.id === edgeId ? { ...edge, data: { ...edge.data, rules, logic } } : edge))
    );
  };
  
  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    const newLabel = prompt('Nhập tên mới cho bước này:', node.data.label);
    if (newLabel !== null && newLabel.trim() !== '') {
      setNodes((nds) => nds.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, label: newLabel } } : n)));
    }
  }, [setNodes]);

  const onAddNode = useCallback(() => {
    const newNode = { id: `${nodeId++}`, data: { label: 'Bước mới' }, position: { x: Math.random() * 400, y: Math.random() * 400 } };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const onExport = useCallback(() => {
    const cleanedNodes = nodes.map(({ id, type, data, position }) => ({ id, type, data, position }));
    const cleanedEdges = edges.map(({ id, source, target, type, data }) => ({ id, source, target, type, data }));
    const goldenFlowData = { nodes: cleanedNodes, edges: cleanedEdges };
    const jsonString = JSON.stringify(goldenFlowData, null, 2);
    console.log('--- GOLDEN JSON (Đã dọn dẹp, có điều kiện) ---');
    console.log(jsonString);
    alert('Đã xuất "Golden JSON" sạch sẽ ra Console!');
  }, [nodes, edges]);

  return (
    <div className="diagram-page">
      <div className="diagram-header">
        <h1>Tinh chỉnh Sơ đồ Quy trình</h1>
        <p>Click vào đường dẫn để thêm điều kiện. Double-click bước để sửa tên.</p>
        <button onClick={onAddNode} className="add-node-button">Thêm Bước Mới</button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        onEdgeClick={onEdgeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        edgeTypes={edgeTypes} // *** QUAN TRỌNG (5): Truyền edgeTypes vào ReactFlow ***
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>

      {selectedEdge && (
        <ConditionPanel
          selectedEdge={selectedEdge}
          onSave={handleSaveConditions}
          onClose={() => setSelectedEdge(null)}
        />
      )}

      <div className="diagram-footer">
        <button onClick={onExport} className="confirm-button">Xác nhận & Xuất JSON</button>
      </div>
    </div>
  );
};