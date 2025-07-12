// --- NODE & EDGE STRUCTURE FOR DIAGRAM ---

export interface NodeData {
  label: string;
}

export interface DiagramNode {
  id: string;
  type: "input" | "default" | "output" | string;
  data: NodeData;
  position: {
    x: number;
    y: number;
  };
}

export interface Rule {
  id: string;
  field: string;
  operator: string;
  value: string;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: {
    rules?: Rule[];
    logic?: "AND" | "OR";
  };
}

// --- METADATA FOR DIAGRAM RESPONSE ---

export interface DiagramMetadata {
  nodes_count: number;
  edges_count: number;
  input_text: string;
  has_image: boolean;
  language: string;
}

export interface DiagramResponse {
  success: true;
  diagram: {
    nodes: DiagramNode[];
    edges: DiagramEdge[];
  };
  metadata: DiagramMetadata;
}

// --- ANALYSIS STRUCTURE ---

export interface Overview {
  process_name: string;
  purpose: string;
  process_type: string;
  complexity_level: string;
  scope: string;
}

export interface Components {
  start_event: string;
  end_event: string;
  actors: string[];
  steps: string[];
  sequence: string;
}

export interface Execution {
  sla: string;
  input_requirements: string[];
  output: string;
  system_integration: string[];
}

export interface Evaluation {
  logic_coherence: string;
  completeness: string;
  risks: string[];
  controls: string[];
  compliance: string;
}

export interface Improvement {
  bottlenecks: string[];
  optimization_opportunities: string[];
  automation_possibility: string;
  kpis: string[];
}

export interface Summary {
  conclusion: string;
  recommendations: string[];
}

export interface Analysis {
  overview: Overview;
  components: Components;
  execution: Execution;
  evaluation: Evaluation;
  improvement: Improvement;
  summary: Summary;
}

export interface SourceDocument {
  id: number;
  title: string;
  url: string;
  score: number;
  content_preview: string;
}

export interface AnalysisMetadata {
  context_sources: number;
  diagram_complexity: string;
  question: string;
}

export interface AnalysisResponse {
  success: true;
  analysis: Analysis;
  sources: SourceDocument[];
  metadata: AnalysisMetadata;
}

// --- UNIFIED RESPONSE TYPE ---

export type ApiResponse = DiagramResponse | AnalysisResponse;
