/**
 * Core data types for the data operations visualizer
 */

/**
 * Represents a system node (ingestion, validation, routing, enrichment)
 */
export interface ProviderNode {
  id: string;
  displayName: string;
  region: string;
  slaTargetMs: number;
  capacityScore: number;
}

/**
 * Represents metrics for a single node at a point in time
 */
export interface Metric {
  nodeId: string;
  ts: number;
  throughputPerMin: number;
  errorRate: number; // 0 to 1
  p95LatencyMs: number;
  backlogSize: number;
}

/**
 * Represents a frame of metrics for all nodes
 */
export interface MetricFrame {
  type: "metrics.frame.v1";
  ts: number;
  nodes: Metric[];
}

