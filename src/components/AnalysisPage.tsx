import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../api/endpoints';
import './css/AnalysisPage.css';
import type { StructuredAnalysis, FullAnalysisResponse } from '../types/ApiResponse';
import { useDiagramAnalysis } from '../hooks/useDiagramAnalysis';


export const AnalysisPage: React.FC = () => {
  const [analysisData, setAnalysisData] = useState<StructuredAnalysis | null>(null);
  // const [sources, setSources] = useState<CitationSource[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    document.title = `Đang Phân tích Quy trình...`;

    // 1. Lấy trạng thái từ localStorage
    const savedStateJSON = localStorage.getItem('analysisState');
    if (!savedStateJSON) {
      setError("Không tìm thấy dữ liệu để phân tích. Vui lòng quay lại trang Sơ đồ và thử lại.");
      setIsLoading(false);
      return;
    }

    const analysisState = JSON.parse(savedStateJSON);

    // 2. TẠO MỘT "CHÌA KHÓA" CACHE DUY NHẤT
    // Chúng ta sẽ băm (hash) toàn bộ đối tượng trạng thái để tạo ra một khóa đại diện.
    // Đây là một cách đơn giản để tạo hash. Trong dự án thực tế có thể dùng thư viện như object-hash.
    const createCacheKey = (state: object): string => {
      try {
        const stateString = JSON.stringify(state);
        // Một hàm hash đơn giản
        let hash = 0;
        for (let i = 0; i < stateString.length; i++) {
          const char = stateString.charCodeAt(i);
          hash = (hash << 5) - hash + char;
          hash |= 0; // Chuyển thành số nguyên 32-bit
        }
        return `analysis_cache_${hash}`;
      } catch {
        return `analysis_cache_default`;
      }
    };
    
    const cacheKey = createCacheKey(analysisState);
    console.log("Sử dụng cache key:", cacheKey);


    const performAnalysis = async () => {
      // 3. KIỂM TRA CACHE TRƯỚC KHI GỌI API
      const cachedResult = localStorage.getItem(cacheKey);
      if (cachedResult) {
        console.log("Tìm thấy kết quả phân tích trong cache. Đang sử dụng lại...");
        const { analysis } = JSON.parse(cachedResult);
        setAnalysisData(analysis);
        document.title = `Phân tích (Cache): ${analysis.overview?.process_name || 'Hoàn tất'}`;
        setIsLoading(false);
        return; // Dừng lại nếu có cache
      }

      // 4. NẾU KHÔNG CÓ CACHE, TIẾP TỤC GỌI API
      console.log("Không có cache. Bắt đầu gọi API phân tích...");
      try {
        const response = await fetch(API_ENDPOINTS.analyzeProcess, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(analysisState),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Lỗi từ phía server.');
        }

        const result: FullAnalysisResponse = await response.json();
        
        if (result.success && result.analysis) {
          // 5. LƯU VÀO CACHE SAU KHI GỌI API THÀNH CÔNG
          const dataToCache = { analysis: result.analysis, sources: result.sources };
          localStorage.setItem(cacheKey, JSON.stringify(dataToCache));
          console.log("Đã lưu kết quả phân tích vào cache.");

          setAnalysisData(result.analysis);
          // setSources(result.sources || []);
          document.title = `Phân tích: ${result.analysis.overview?.process_name || 'Hoàn tất'}`;
        } else {
          throw new Error('Định dạng phản hồi từ API không hợp lệ.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định');
      } finally {
        setIsLoading(false);
      }
    };

    performAnalysis();
  }, []);

  if (isLoading) {
    return (
      <div className="analysis-loading">
        <h1>Đang thực hiện phân tích chuyên sâu...</h1>
        <p>AI đang huy động toàn bộ tri thức để đưa ra kết quả tốt nhất. Vui lòng chờ trong giây lát.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analysis-error">
        <h1>Đã xảy ra lỗi</h1>
        <p>{error}</p>
      </div>
    );
  }
  
  if (!analysisData) {
    return null; 
  }

  // --- PHẦN JSX ĐÃ ĐƯỢC CẬP NHẬT TOÀN BỘ ---
  return (
    <div className="analysis-container">
      <h1>Báo cáo Phân tích Quy trình: {analysisData.overview.process_name}</h1>

      {/* <TextWithCitations text={testText} sources={testSources} /> */}
      
      {/* <AnalysisSection title="I. Tổng quan (Overview)">
        <InfoPair label="Mục đích"><TextWithCitations text={analysisData.overview.purpose} sources={sources} /></InfoPair>
        <InfoPair label="Loại quy trình"><TextWithCitations text={analysisData.overview.process_type} sources={sources} /></InfoPair>
        <InfoPair label="Phạm vi"><TextWithCitations text={analysisData.overview.scope} sources={sources} /></InfoPair>
        <InfoPair label="Độ phức tạp"><TextWithCitations text={analysisData.overview.complexity_level} sources={sources} /></InfoPair>
      </AnalysisSection>

      <AnalysisSection title="II. Phân rã Thành phần (Components)">
        <InfoPair label="Sự kiện bắt đầu"><TextWithCitations text={analysisData.components.start_event} sources={sources} /></InfoPair>
        <InfoPair label="Sự kiện kết thúc"><TextWithCitations text={analysisData.components.end_event} sources={sources} /></InfoPair>
        <InfoList label="Các bên tham gia" items={analysisData.components.actors.map((item, index) => <TextWithCitations key={index} text={item} sources={sources} />)} />
        <InfoList label="Các bước chính" items={analysisData.components.steps.map((item, index) => <TextWithCitations key={index} text={item} sources={sources} />)} />
        <InfoPair label="Trình tự thực hiện"><TextWithCitations text={analysisData.components.sequence} sources={sources} /></InfoPair>
      </AnalysisSection>

      <AnalysisSection title="III. Đánh giá (Evaluation)">
        <InfoPair label="Tính logic & Mạch lạc"><TextWithCitations text={analysisData.evaluation.logic_coherence} sources={sources} /></InfoPair>
        <InfoPair label="Tính đầy đủ"><TextWithCitations text={analysisData.evaluation.completeness} sources={sources} /></InfoPair>
        <InfoList label="Rủi ro tiềm ẩn" items={analysisData.evaluation.risks.map((item, index) => <TextWithCitations key={index} text={item} sources={sources} />)} />
        <InfoList label="Các điểm kiểm soát" items={analysisData.evaluation.controls.map((item, index) => <TextWithCitations key={index} text={item} sources={sources} />)} />
        <InfoPair label="Phân tích Tuân thủ"><TextWithCitations text={analysisData.evaluation.compliance} sources={sources} /></InfoPair>
      </AnalysisSection>

      <AnalysisSection title="IV. Đề xuất Cải tiến (Improvement)">
        <InfoList label="Điểm nghẽn (Bottlenecks)" items={analysisData.improvement.bottlenecks.map((item, index) => <TextWithCitations key={index} text={item} sources={sources} />)} />
        <InfoList label="Cơ hội Tối ưu hóa" items={analysisData.improvement.optimization_opportunities.map((item, index) => <TextWithCitations key={index} text={item} sources={sources} />)} />
        <InfoPair label="Khả năng Tự động hóa"><TextWithCitations text={analysisData.improvement.automation_possibility} sources={sources} /></InfoPair>
        <InfoList label="Chỉ số Đo lường (KPIs)" items={analysisData.improvement.kpis.map((item, index) => <TextWithCitations key={index} text={item} sources={sources} />)} />
      </AnalysisSection>

      <AnalysisSection title="V. Kết luận (Summary)">
        <InfoPair label="Tóm tắt chung"><TextWithCitations text={analysisData.summary.conclusion} sources={sources} /></InfoPair>
        <InfoList label="Khuyến nghị chính" items={analysisData.summary.recommendations.map((item, index) => <TextWithCitations key={index} text={item} sources={sources} />)} />
      </AnalysisSection>

      <AnalysisSection title="VI. Nguồn Tri Thức Đã Tham Khảo">
        <div className="sources-list">
          {sources.length > 0 ? (
            <table>
              <thead><tr><th>#</th><th>Tên tài liệu</th><th>Trích đoạn liên quan</th><th>Độ liên quan</th></tr></thead>
              <tbody>
                {sources.map(source => (
                  <tr key={source.citationId}>
                    <td><Link to={`/documents/${source.documentId}?highlight=${encodeURIComponent(source.content_preview)}`}>[{source.citationId}]</Link></td>
                    <td><Link to={`/documents/${source.documentId}`}>{source.title}</Link></td>
                    <td><em>"{source.content_preview}"</em></td>
                    <td>{source.score.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>Phân tích này không sử dụng nguồn tri thức nào.</p>}
        </div>
      </AnalysisSection> */}
    </div>
  );
};