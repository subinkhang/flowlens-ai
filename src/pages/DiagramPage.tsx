import React, { useState, useCallback, useEffect } from "react";
// 1. Import thêm useLocation
import { useLocation } from "react-router-dom";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  addEdge,
  MarkerType,
  BackgroundVariant,
  type Node,
  type Edge,
  type Connection,
} from "reactflow";
import { DiagramHeader } from "../components/Diagram/DiagramHeader";
import { DiagramFooter } from "../components/Diagram/DiagramFooter";
import "reactflow/dist/style.css";
import "./css/DiagramPage.css";
import { CustomEdge } from "../components/CustomEdge";
import { useDiagramData } from "../hooks/useDiagram";
import { ConditionPanel } from "../components/ConditionPanel";
import type { DiagramEdge, DiagramNode, Rule } from "../types/ApiResponse";
import { useSession } from "../hooks/useSession";

const edgeTypes = { custom: CustomEdge };
let nodeIdCounter = 5;

export const DiagramPage: React.FC = () => {
  const { initialData, error } = useDiagramData();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const { sessionId } = useSession();

  // 2. Thêm state mới để lưu các ID tài liệu đã chọn
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);

  // 3. Dùng useLocation để lấy state từ navigation
  const location = useLocation();

  // 4. Dùng useEffect để cập nhật state khi người dùng quay lại từ trang documents
  useEffect(() => {
    if (location.state && location.state.selectedDocumentIds) {
      const ids: string[] = location.state.selectedDocumentIds;
      setSelectedDocumentIds(ids);
      console.log("Đã nhận các ID tài liệu được chọn:", ids);
    }
  }, [location.state]); // Chạy lại effect khi location.state thay đổi

  useEffect(() => {
    if (initialData) {
      const normalizedNodes: Node[] = initialData.diagram.nodes.map(
        (n: DiagramNode) => ({
          id: String(n.id),
          type: n.type || "default",
          data: n.data || { label: "Chưa có nội dung" },
          position: n.position || {
            x: Math.random() * 400,
            y: Math.random() * 400,
          },
        })
      );

      const normalizedEdges: Edge[] = initialData.diagram.edges.map(
        (e: DiagramEdge) => ({
          id: String(e.id),
          source: String(e.source),
          target: String(e.target),
          type: e.type || "custom",
          data: e.data || {},
        })
      );

      setNodes(normalizedNodes);
      setEdges(normalizedEdges);
      nodeIdCounter = normalizedNodes.length + 1;
    }
  }, [initialData, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        type: "custom",
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    setSelectedEdge(edge);
  }, []);

  const onPaneClick = useCallback(() => setSelectedEdge(null), []);

  const handleSaveConditions = useCallback(
    (edgeId: string, logic: "AND" | "OR", rules: Rule[]) => {
      setEdges((eds) =>
        eds.map((edge) =>
          edge.id === edgeId
            ? { ...edge, data: { ...edge.data, rules, logic } }
            : edge
        )
      );
    },
    [setEdges]
  );

  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const newLabel = prompt("Nhập tên mới cho bước này:", node.data.label);
      if (newLabel !== null && newLabel.trim() !== "") {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id
              ? { ...n, data: { ...n.data, label: newLabel } }
              : n
          )
        );
      }
    },
    [setNodes]
  );

  const onAddNode = useCallback(() => {
    const newNode: Node = {
      id: `${nodeIdCounter++}`,
      type: "default",
      data: { label: "Bước mới" },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const getCleanedDiagramData = useCallback(() => {
    const cleanedNodes = nodes.map(({ id, type, data, position }) => ({
      id,
      type,
      data,
      position,
    }));
    const cleanedEdges = edges.map(({ id, source, target, type, data }) => ({
      id,
      source,
      target,
      type,
      data,
    }));
    return { nodes: cleanedNodes, edges: cleanedEdges };
  }, [nodes, edges]);

  const onExport = useCallback(() => {
    const goldenFlowData = getCleanedDiagramData();
    console.log("--- GOLDEN JSON ---");
    console.log(JSON.stringify(goldenFlowData, null, 2));
    alert("Đã xuất 'Golden JSON' sạch sẽ ra Console!");
  }, [getCleanedDiagramData]);

  // 5. Cập nhật hàm onAnalyze để bao gồm cả `selectedDocumentIds`
  const onAnalyze = useCallback(
    (question: string) => {
      // Lấy dữ liệu sơ đồ sạch
      const diagramData = getCleanedDiagramData();

      // Tạo một đối tượng state hoàn chỉnh để gửi đi
      const analysisState = {
        diagram: diagramData,
        question: question,
        selectedDocumentIds: selectedDocumentIds, // Thêm ID vào đây
      };

      // Lưu state vào localStorage để trang /analyze có thể đọc
      localStorage.setItem("analysisState", JSON.stringify(analysisState));
      
      // Mở trang phân tích trong tab mới
      window.open("/analyze", "_blank");
    },
    [getCleanedDiagramData, selectedDocumentIds] // Thêm selectedDocumentIds vào dependencies
  );

  if (error) {
    return (
      <div style={{ padding: "20px", color: "red" }}>
        <h1>Lỗi</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="loading-container">
        <h2>Đang tạo sơ đồ từ AI...</h2>
        <p>Vui lòng chờ trong giây lát.</p>
      </div>
    );
  }

  return (
    <div className="diagram-page">
      <DiagramHeader onAddNode={onAddNode} />

      {/* 6. Thêm phần hiển thị thông báo về các nguồn đã chọn */}
      {selectedDocumentIds.length > 0 && (
        <div className="info-banner">
          Đang áp dụng phân tích với <strong>{selectedDocumentIds.length}</strong> nguồn tri thức đã chọn.
        </div>
      )}

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
      <DiagramFooter onExport={onExport} onAnalyze={onAnalyze} />
    </div>
  );
};