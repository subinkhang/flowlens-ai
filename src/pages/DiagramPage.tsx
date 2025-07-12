import React, { useState, useCallback, useEffect } from "react";
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

const edgeTypes = { custom: CustomEdge };
let nodeIdCounter = 5;

export const DiagramPage: React.FC = () => {
  const { initialData, error } = useDiagramData();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

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
    (event: React.MouseEvent, node: Node) => {
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

  const onExport = useCallback(() => {
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
    const goldenFlowData = { nodes: cleanedNodes, edges: cleanedEdges };
    console.log("--- GOLDEN JSON ---");
    console.log(JSON.stringify(goldenFlowData, null, 2));
    alert("Đã xuất 'Golden JSON' sạch sẽ ra Console!");
  }, [nodes, edges]);

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

      <DiagramFooter onExport={onExport} />
    </div>
  );
};
