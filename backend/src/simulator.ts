/**
 * Metric data simulator that generates realistic metrics for 20-30 nodes
 */

import type { ProviderNode, Metric, MetricFrame } from "./types.js";

/**
 * Generate a fixed list of 20-30 ProviderNode entries with realistic sample data
 */
export function createNodes(): ProviderNode[] {
  const nodeTypes = [
    { name: "Ingestion", baseThroughput: 5000, baseLatency: 50 },
    { name: "Validation", baseThroughput: 4500, baseLatency: 80 },
    { name: "Routing", baseThroughput: 4000, baseLatency: 30 },
    { name: "Enrichment", baseThroughput: 3500, baseLatency: 120 },
    { name: "Transformation", baseThroughput: 3000, baseLatency: 150 },
    { name: "Aggregation", baseThroughput: 2500, baseLatency: 200 },
    { name: "Storage", baseThroughput: 6000, baseLatency: 40 },
    { name: "Notification", baseThroughput: 2000, baseLatency: 100 },
  ];

  const regions = ["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1"];

  const nodes: ProviderNode[] = [];
  let nodeId = 1;

  // Create 20-30 nodes by cycling through node types and regions
  for (let i = 0; i < 25; i++) {
    const nodeType = nodeTypes[i % nodeTypes.length]!;
    const region = regions[i % regions.length]!;
    const instanceNum = Math.floor(i / nodeTypes.length) + 1;

    nodes.push({
      id: `node-${nodeId}`,
      displayName: `${nodeType.name} ${instanceNum > 1 ? instanceNum : ""}`.trim(),
      region,
      slaTargetMs: nodeType.baseLatency * 2, // SLA target is 2x base latency
      capacityScore: 0.7 + Math.random() * 0.3, // Capacity between 0.7 and 1.0
    });

    nodeId++;
  }

  return nodes;
}

/**
 * Generate a single metric for a node with realistic variation
 */
function generateMetric(node: ProviderNode, baseThroughput: number): Metric {
  const now = Date.now();

  // Throughput fluctuates around base value with +/-20% variation
  const throughputVariation = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
  const throughputPerMin = Math.max(0, baseThroughput * throughputVariation);

  // Error rate: normally low (0-2%), occasionally spikes (up to 10%)
  const errorSpike = Math.random() < 0.1; // 10% chance of spike
  const errorRate = errorSpike
    ? 0.05 + Math.random() * 0.05 // 5-10% during spike
    : Math.random() * 0.02; // 0-2% normally

  // p95Latency is influenced by errorRate and slaTargetMs
  // Higher error rate increases latency
  const latencyMultiplier = 1 + errorRate * 2; // Error rate doubles latency impact
  const baseLatency = node.slaTargetMs * 0.5; // Base latency is half of SLA target
  const p95LatencyMs = baseLatency * latencyMultiplier * (0.8 + Math.random() * 0.4);

  // Backlog changes based on throughput and capacityScore
  // If throughput exceeds capacity, backlog grows
  const capacityThroughput = baseThroughput * node.capacityScore;
  const backlogGrowth = throughputPerMin > capacityThroughput ? 1.2 : 0.9;
  const backlogSize = Math.max(0, (throughputPerMin / 60) * backlogGrowth * (50 + Math.random() * 100));

  return {
    nodeId: node.id,
    ts: now,
    throughputPerMin,
    errorRate,
    p95LatencyMs: Math.round(p95LatencyMs),
    backlogSize: Math.round(backlogSize),
  };
}

/**
 * Generate a metric frame for all nodes
 */
export function generateMetricFrame(nodes: ProviderNode[]): MetricFrame {
  const baseThroughputs = new Map<string, number>();
  
  // Initialize base throughputs for each node type
  nodes.forEach((node) => {
    if (!baseThroughputs.has(node.id)) {
      // Extract base throughput from display name or use a default
      const baseThroughput = 3000 + Math.random() * 2000; // 3000-5000
      baseThroughputs.set(node.id, baseThroughput);
    }
  });

  const metrics: Metric[] = nodes.map((node) => {
    const baseThroughput = baseThroughputs.get(node.id) ?? 3000;
    return generateMetric(node, baseThroughput);
  });

  return {
    type: "metrics.frame.v1",
    ts: Date.now(),
    nodes: metrics,
  };
}

