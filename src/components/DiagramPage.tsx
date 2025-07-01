// src/components/DiagramPage.tsx (ĐÃ SỬA LỖI)

import React, { useCallback } from 'react';
// CẬP NHẬT: Tách làm 2 dòng import
// Dòng 1: Import các GIÁ TRỊ (components, hooks, functions)
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  addEdge,
  BackgroundVariant,
} from 'reactflow';
// Dòng 2: Import các KIỂU DỮ LIỆU (types)
import type { OnConnect, Node, Edge, MarkerType } from 'reactflow';

import 'reactflow/dist/style.css';
import './DiagramPage.css';

// Dữ liệu mẫu ban đầu
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Khách hàng nộp hồ sơ vay' },
    position: { x: 250, y: 5 },
  },
  {
    id: '2',
    data: { label: 'Chuyên viên tín dụng thẩm định hồ sơ' },
    position: { x: 250, y: 100 },
  },
  {
    id: '3',
    data: { label: 'Trình hồ sơ lên cấp quản lý' },
    position: { x: 250, y: 200 },
  },
  {
    id: '4',
    type: 'output',
    data: { label: 'Phê duyệt hoặc Từ chối' },
    position: { x: 250, y: 300 },
  },
];

const initialEdges: Edge[] = [ // Đổi kiểu thành Edge[]
  { id: 'e1-2', source: '1', target: '2', markerEnd: { type: 'arrowclosed' as MarkerType } },
  { id: 'e2-3', source: '2', target: '3', markerEnd: { type: 'arrowclosed' as MarkerType } },
  { id: 'e3-4', source: '3', target: '4', markerEnd: { type: 'arrowclosed' as MarkerType } },
];

let nodeId = 5;

export const DiagramPage: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, markerEnd: { type: 'arrowclosed' as MarkerType } }, eds)),
    [setEdges]
  );

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    const newLabel = prompt('Nhập tên mới cho bước này:', node.data.label);
    if (newLabel !== null && newLabel.trim() !== '') {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === node.id) {
            return {
              ...n,
              data: {
                ...n.data,
                label: newLabel,
              },
            };
          }
          return n;
        })
      );
    }
  }, [setNodes]);

  const onAddNode = useCallback(() => {
    const newNode = {
      id: `${nodeId++}`,
      data: { label: 'Bước mới' },
      position: {
        x: Math.random() * 400,
        y: Math.random() * 400,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const onExport = useCallback(() => {
        // --- BƯỚC DỌN DẸP BẮT ĐẦU ---

        // 1. Dọn dẹp mảng `nodes`
        // Chỉ lấy các thuộc tính cần thiết: id, type, và data
        const cleanedNodes = nodes.map(({ id, type, data, position }) => ({
            id,
            type,
            data,
            position, // Giữ lại position để có thể vẽ lại sơ đồ sau này nếu cần
        }));

        // 2. Dọn dẹp mảng `edges`
        // Chỉ lấy các thuộc tính cần thiết: id, source, và target
        const cleanedEdges = edges.map(({ id, source, target, animated }) => ({
            id,
            source,
            target,
            animated, // Giữ lại 'animated' nếu bạn muốn
        }));

        // 3. Tạo đối tượng "Golden JSON" cuối cùng
        const goldenFlowData = {
            nodes: cleanedNodes,
            edges: cleanedEdges,
        };

        // --- BƯỚC DỌN DẸP KẾT THÚC ---

        const jsonString = JSON.stringify(goldenFlowData, null, 2);
        console.log('--- GOLDEN JSON (ĐÃ ĐƯỢC DỌN DẸP) ---');
        console.log(jsonString);

        alert('Đã xuất "Golden JSON" sạch sẽ ra Console! (Nhấn F12 để xem)');
    }, [nodes, edges]);

  return (
    <div className="diagram-page">
      <div className="diagram-header">
        <h1>Tinh chỉnh Sơ đồ Quy trình</h1>
        <p>Double-click một bước để sửa tên. Kéo từ mép để nối các bước.</p>
        <button onClick={onAddNode} className="add-node-button">
          Thêm Bước Mới
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} /> {/* Nền dạng chấm */}
      </ReactFlow>

      <div className="diagram-footer">
        <button onClick={onExport} className="confirm-button">
          Xác nhận & Xuất JSON (Xem Console)
        </button>
      </div>
    </div>
  );
};