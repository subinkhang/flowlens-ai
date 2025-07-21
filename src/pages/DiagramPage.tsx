import React, { useState, useCallback, useEffect } from "react";
// 1. Import thêm useLocation
import { useNavigate, useLocation } from "react-router-dom";
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
import { useSession } from "../hooks/useSession";
import { DiagramHeader } from "../components/Diagram/DiagramHeader";
import { DiagramFooter } from "../components/Diagram/DiagramFooter";
import "reactflow/dist/style.css";
import "./css/DiagramPage.css";
import { CustomEdge } from "../components/CustomEdge";
import { useDiagramData } from "../hooks/useDiagram";
import { ConditionPanel } from "../components/ConditionPanel";
import type { DiagramEdge, DiagramNode, Rule } from "../types/ApiResponse";

// Các hằng số giữ nguyên
const edgeTypes = { custom: CustomEdge };
let nodeIdCounter = 5;

export const DiagramPage: React.FC = () => {
  // --- LẤY DỮ LIỆU TỪ CÁC HOOK ---
  const { initialData, error } = useDiagramData();
  const { sessionId } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);

  useEffect(() => {
    if (location.state && location.state.selectedDocumentIds) {
      const ids: string[] = location.state.selectedDocumentIds;
      setSelectedDocumentIds(ids);
      console.log("Đã nhận các ID tài liệu được chọn:", ids);
    }
  }, [location.state]);

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

  const handleNavigateToDocuments = () => {
    // location object đã có sẵn từ hook useLocation ở đầu file
    const currentDiagramPath = location.pathname + location.search;

    // THAY ĐỔI Ở ĐÂY: Gửi đi URL đầy đủ của trang Diagram hiện tại
    navigate('/documents', { 
      state: { 
        // Chúng ta sẽ gọi nó là fromDiagramUrl để rõ ràng hơn
        fromDiagramUrl: currentDiagramPath 
      } 
    });
  };

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
    alert("Đã xuất JSON ra Console!");
  }, [getCleanedDiagramData]);

  const onAnalyze = useCallback(
    (question: string) => {
      const diagramData = getCleanedDiagramData();

      // Thêm sessionId vào payload để hook useDiagramAnalysis có thể sử dụng
      const analysisState = {
        sessionId: sessionId, // <-- Thêm sessionId vào đây
        diagram: diagramData,
        question: question,
        selectedDocumentIds: selectedDocumentIds,
      };

      // Tạo khóa động cho analysisState
      const analysisStateKey = `analysisState_${sessionId}`;

      // Lưu trạng thái phân tích vào localStorage với khóa động
      localStorage.setItem(analysisStateKey, JSON.stringify(analysisState));
      
      window.open(`/analyze/${sessionId}`, "_blank");
    },
    [getCleanedDiagramData, selectedDocumentIds, sessionId] 
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
        <h2>FlowLens đang tạo sơ đồ từ...</h2>
        <p>Vui lòng chờ trong giây lát.</p>
      </div>
    );
  }

  return (
    <div className="diagram-page">
      <DiagramHeader onAddNode={onAddNode} />

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
      <DiagramFooter onExport={onExport} onAnalyze={onAnalyze} onNavigateToDocuments={handleNavigateToDocuments} />
    </div>
  );
};