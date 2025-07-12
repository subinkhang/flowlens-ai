export const DiagramHeader = ({ onAddNode }: { onAddNode: () => void }) => (
  <div className="diagram-header">
    <h1>Tinh chỉnh Sơ đồ Quy trình</h1>
    <p>Click vào đường dẫn để thêm điều kiện. Double-click bước để sửa tên.</p>
    <button onClick={onAddNode} className="add-node-button">
      Thêm Bước Mới
    </button>
  </div>
);
