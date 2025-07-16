import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../api/endpoints'; // Đảm bảo bạn có endpoint cho analyzeProcess
import './css/AnalysisPage.css'; // Tạo một file CSS riêng để trang trí

// --- STEP 1: ĐỊNH NGHĨA CẤU TRÚC DỮ LIỆU MỚI ---
// Interface này phải khớp với cấu trúc JSON mà Claude trả về
interface StructuredAnalysis {
  overview: {
    process_name: string;
    purpose: string;
    process_type: string;
    complexity_level: string;
    scope: string;
  };
  components: {
    start_event: string;
    end_event: string;
    actors: string[];
    steps: string[];
    sequence: string;
  };
  evaluation: {
    logic_coherence: string;
    completeness: string;
    risks: string[];
    controls: string[];
    compliance: string;
  };
  improvement: {
    bottlenecks: string[];
    optimization_opportunities: string[];
    automation_possibility: string;
    kpis: string[];
  };
  summary: {
    conclusion: string;
    recommendations: string[];
  };
}

// Component con để hiển thị từng phần cho gọn gàng
const AnalysisSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="analysis-section">
    <h2>{title}</h2>
    {children}
  </div>
);

const InfoPair: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="info-pair">
    <strong>{label}:</strong>
    <p>{value || 'Chưa có thông tin'}</p>
  </div>
);

const InfoList: React.FC<{ label: string; items: string[] }> = ({ label, items }) => (
  <div className="info-list">
    <strong>{label}:</strong>
    {items && items.length > 0 ? (
      <ul>
        {items.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    ) : (
      <p>Chưa có thông tin</p>
    )}
  </div>
);


export const AnalysisPage: React.FC = () => {
  // --- STEP 2: CẬP NHẬT STATE MANAGEMENT ---
  const [analysisData, setAnalysisData] = useState<StructuredAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Thêm state cho trạng thái loading
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // --- STEP 3: THAY ĐỔI HOÀN TOÀN LOGIC LẤY DỮ LIỆU ---
  useEffect(() => {
    // Đặt tiêu đề tab mặc định
    document.title = `Đang Phân tích Quy trình...`;

    // Lấy state đã được lưu từ trang Diagram
    const savedStateJSON = localStorage.getItem('analysisState');

    if (!savedStateJSON) {
      setError("Không tìm thấy dữ liệu để phân tích. Vui lòng quay lại trang Sơ đồ và thử lại.");
      setIsLoading(false);
      return;
    }

    const performAnalysis = async () => {
      try {
        // Parse dữ liệu từ localStorage
        const analysisState = JSON.parse(savedStateJSON);

        // Gọi API thật sự với dữ liệu đã lấy được
        const response = await fetch(API_ENDPOINTS.analyzeProcess, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(analysisState),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Lỗi từ phía server.');
        }

        const result = await response.json();
        
        if (result.success && result.analysis) {
          setAnalysisData(result.analysis);
          document.title = `Phân tích: ${result.analysis.overview?.process_name || 'Hoàn tất'}`;
        } else {
          throw new Error('Định dạng phản hồi từ API không hợp lệ.');
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định');
      } finally {
        // Dù thành công hay thất bại, cũng dừng trạng thái loading
        setIsLoading(false);
      }
    };

    performAnalysis();

  }, []); // Mảng rỗng đảm bảo chỉ chạy 1 lần

  
  // --- STEP 4: CẬP NHẬT LOGIC HIỂN THỊ ---

  // Hiển thị trạng thái "đang phân tích"
  if (isLoading) {
    return (
      <div className="analysis-loading">
        <h1>Đang thực hiện phân tích chuyên sâu...</h1>
        <p>AI đang huy động toàn bộ tri thức để đưa ra kết quả tốt nhất. Vui lòng chờ trong giây lát.</p>
        {/* Bạn có thể thêm một icon spinner ở đây */}
      </div>
    );
  }

  // Ưu tiên hiển thị lỗi nếu có
  if (error) {
    return (
      <div className="analysis-error">
        <h1>Đã xảy ra lỗi</h1>
        <p>{error}</p>
      </div>
    );
  }
  
  // Khi đã có dữ liệu, hiển thị báo cáo chi tiết
  // `analysisData` sẽ không thể là null ở đây nữa
  return (
    <div className="analysis-container">
      <h1>Báo cáo Phân tích Quy trình: {analysisData?.overview.process_name}</h1>
      
      <AnalysisSection title="I. Tổng quan (Overview)">
        <InfoPair label="Mục đích" value={analysisData!.overview.purpose} />
        <InfoPair label="Loại quy trình" value={analysisData!.overview.process_type} />
        <InfoPair label="Phạm vi" value={analysisData!.overview.scope} />
        <InfoPair label="Độ phức tạp" value={analysisData!.overview.complexity_level} />
      </AnalysisSection>

      <AnalysisSection title="II. Phân rã Thành phần (Components)">
        <InfoPair label="Sự kiện bắt đầu" value={analysisData!.components.start_event} />
        <InfoPair label="Sự kiện kết thúc" value={analysisData!.components.end_event} />
        <InfoList label="Các bên tham gia" items={analysisData!.components.actors} />
        <InfoList label="Các bước chính" items={analysisData!.components.steps} />
        <InfoPair label="Trình tự thực hiện" value={analysisData!.components.sequence} />
      </AnalysisSection>

      <AnalysisSection title="III. Đánh giá (Evaluation)">
        <InfoPair label="Tính logic & Mạch lạc" value={analysisData!.evaluation.logic_coherence} />
        <InfoPair label="Tính đầy đủ" value={analysisData!.evaluation.completeness} />
        <InfoList label="Rủi ro tiềm ẩn" items={analysisData!.evaluation.risks} />
        <InfoList label="Các điểm kiểm soát" items={analysisData!.evaluation.controls} />
        <InfoPair label="Phân tích Tuân thủ" value={analysisData!.evaluation.compliance} />
      </AnalysisSection>

      <AnalysisSection title="IV. Đề xuất Cải tiến (Improvement)">
        <InfoList label="Điểm nghẽn (Bottlenecks)" items={analysisData!.improvement.bottlenecks} />
        <InfoList label="Cơ hội Tối ưu hóa" items={analysisData!.improvement.optimization_opportunities} />
        <InfoPair label="Khả năng Tự động hóa" value={analysisData!.improvement.automation_possibility} />
        <InfoList label="Chỉ số Đo lường (KPIs)" items={analysisData!.improvement.kpis} />
      </AnalysisSection>

      <AnalysisSection title="V. Kết luận (Summary)">
        <InfoPair label="Tóm tắt chung" value={analysisData!.summary.conclusion} />
        <InfoList label="Khuyến nghị chính" items={analysisData!.summary.recommendations} />
      </AnalysisSection>

    </div>
  );
};