import React, { useState, useCallback, useEffect } from 'react';
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
import type { Node, Edge, Connection } from 'reactflow'; 

// Import các thành phần và API cần thiết
import { getSessionData } from '../api/mockApi';
import { ConditionPanel } from './ConditionPanel';
import type { Rule } from './ConditionPanel';
import { CustomEdge } from './CustomEdge';

import 'reactflow/dist/style.css';
import './DiagramPage.css';

// Đăng ký component Edge tùy chỉnh với ReactFlow
const edgeTypes = {
  custom: CustomEdge,
};

let nodeIdCounter = 5; // Dùng một tên khác để tránh xung đột với kiểu dữ liệu 'Node'

export const DiagramPage: React.FC = () => {
  // --- STATE MANAGEMENT ---
  // Tất cả các hook được gọi ở cấp cao nhất để tuân thủ "Rules of Hooks"
  const [initialData, setInitialData] = useState<{ nodes: Node[], edges: Edge[] } | null>(null);
  // const [error, setError] = useState<string | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);


  // --- SIDE EFFECTS ---
  // useEffect để lấy dữ liệu từ API dựa trên sessionId từ URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('sessionId');

    if (sessionId) {
      getSessionData(sessionId, 'diagram')
        .then(data => {
          setInitialData(data);
          document.title = `Sơ đồ - Session ${sessionId.substring(8, 14)}`;
        })
        .catch(err => {
          // setError(err.message || "Đã xảy ra lỗi không xác định.");
          console.log(err);
        });
    } else {
      // setError("Không tìm thấy Session ID trên URL. Vui lòng thử lại từ trang chat.");
      console.log("Không tìm thấy Session ID trên URL. Vui lòng thử lại từ trang chat.");
    }
  }, []); // Mảng rỗng đảm bảo chỉ chạy 1 lần

  // useEffect để cập nhật state của React Flow sau khi đã lấy được dữ liệu
  useEffect(() => {
    if (initialData) {
      setNodes(initialData.nodes);
      setEdges(initialData.edges);
      // Cập nhật bộ đếm nodeId để tránh trùng lặp khi thêm node mới
      nodeIdCounter = initialData.nodes.length + 1;
    }
  }, [initialData, setNodes, setEdges]);


  // --- EVENT HANDLERS & CALLBACKS ---
  const onConnect = useCallback((params: Connection) => {
    const newEdge = { ...params, type: 'custom', animated: true, markerEnd: { type: MarkerType.ArrowClosed } };
    setEdges((eds) => addEdge(newEdge, eds));
  }, [setEdges]);

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    setSelectedEdge(edge);
  }, []);

  const onPaneClick = useCallback(() => setSelectedEdge(null), []);

  const handleSaveConditions = useCallback((edgeId: string, logic: 'AND' | 'OR', rules: Rule[]) => {
    setEdges((eds) =>
      eds.map((edge) => (edge.id === edgeId ? { ...edge, data: { ...edge.data, rules, logic } } : edge))
    );
  }, [setEdges]);

  // const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
  const onNodeDoubleClick = useCallback((_event: React.MouseEvent, node: Node) => {
    const newLabel = prompt('Nhập tên mới cho bước này:', node.data.label);
    if (newLabel !== null && newLabel.trim() !== '') {
      setNodes((nds) => nds.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, label: newLabel } } : n)));
    }
  }, [setNodes]);

  const onAddNode = useCallback(() => {
    const newNode = { id: `${nodeIdCounter++}`, data: { label: 'Bước mới' }, position: { x: Math.random() * 400, y: Math.random() * 400 } };
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


  // --- CONDITIONAL RENDERING ---
  // Luôn đặt các lệnh return sớm ở dưới cùng, sau khi tất cả các hook đã được gọi
  // if (error) {
  //   return <div style={{ padding: '20px', color: 'red' }}><h1>Lỗi</h1><p>{error}</p></div>;
  // }
  // if (!initialData) {
  //   return <div style={{ padding: '20px' }}><h1>Đang tải dữ liệu sơ đồ...</h1></div>;
  // }

  // --- JSX RENDER ---
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
        edgeTypes={edgeTypes}
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