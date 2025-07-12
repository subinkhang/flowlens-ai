export const DiagramFooter = ({ onExport }: { onExport: () => void }) => (
  <div className="diagram-footer">
    <button onClick={onExport} className="confirm-button">
      Xác nhận & Xuất JSON
    </button>
  </div>
);
