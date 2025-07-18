import React, { useState, useEffect } from 'react';
import type { Edge } from 'reactflow';
import './ConditionPanel.css';

// Định nghĩa các kiểu dữ liệu
export interface Rule {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface ConditionPanelProps {
  selectedEdge: Edge;
  onSave: (edgeId: string, logic: 'AND' | 'OR', rules: Rule[]) => void;
  onClose: () => void;
}

// Danh sách các toán tử để người dùng chọn
const OPERATORS = [
  'Chứa', 'Không chứa', 'Bằng', 'Nằm trong', 'Không nằm trong',
  'Lớn hơn', 'Nhỏ hơn', 'Sau', 'Trước', 'Là đúng', 'Là sai',
  'Tồn tại', 'Không tồn tại'
];

export const ConditionPanel: React.FC<ConditionPanelProps> = ({ selectedEdge, onSave, onClose }) => {
  const [logic, setLogic] = useState<'AND' | 'OR'>(selectedEdge.data?.logic || 'AND');
  const [rules, setRules] = useState<Rule[]>(selectedEdge.data?.rules || []);

  // Cập nhật state nội bộ khi một edge khác được chọn
  useEffect(() => {
    setLogic(selectedEdge.data?.logic || 'AND');
    setRules(selectedEdge.data?.rules || []);
  }, [selectedEdge]);

  const handleRuleChange = (index: number, field: keyof Rule, value: string) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: value };
    setRules(newRules);
  };

  const handleAddRule = () => {
    setRules([...rules, { id: `rule-${Date.now()}`, field: '', operator: 'Contains', value: '' }]);
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(selectedEdge.id, logic, rules);
    onClose();
  };

  return (
    <div className="condition-panel">
      <button onClick={onClose} className="panel-close-btn">×</button>
      <h3>Điều kiện cho đường dẫn</h3>
      
      <div className="logic-group">
        <label>Logic kết nối: </label>
        <select value={logic} onChange={(e) => setLogic(e.target.value as 'AND' | 'OR')}>
          <option value="AND">AND (Tất cả phải đúng)</option>
          <option value="OR">OR (Chỉ cần một cái đúng)</option>
        </select>
      </div>

      {rules.map((rule, index) => (
        <div key={rule.id} className="rule">
          <div className="rule-inputs">
            <input
              placeholder="Tên biến"
              value={rule.field}
              onChange={(e) => handleRuleChange(index, 'field', e.target.value)}
            />
            <select
              value={rule.operator}
              onChange={(e) => handleRuleChange(index, 'operator', e.target.value)}
            >
              {OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
            </select>
            <input
              placeholder="Giá trị"
              value={rule.value}
              onChange={(e) => handleRuleChange(index, 'value', e.target.value)}
            />
          </div>
          <button onClick={() => handleRemoveRule(index)} style={{marginTop: '5px'}}>Xóa Rule</button>
        </div>
      ))}
      
      <div className="panel-actions">
        <button onClick={handleAddRule}>Thêm Rule</button>
        <button onClick={handleSave} style={{fontWeight: 'bold'}}>Lưu thay đổi</button>
      </div>
    </div>
  );
};