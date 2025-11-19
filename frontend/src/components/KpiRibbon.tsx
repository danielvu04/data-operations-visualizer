export default function KpiRibbon() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-around",
      padding: "10px",
      background: "#0d1117",
      color: "white",
      fontWeight: 500
    }}>
      <div>Throughput: --</div>
      <div>Avg Latency: --</div>
      <div>Error Rate: --</div>
      <div>Backlog: --</div>
    </div>
  );
}