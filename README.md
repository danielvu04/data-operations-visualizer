# Data Operations Visualizer  
### Real-time 3D visualization of data pipelines as a living, interactive city

Data Operations Visualizer is a real-time dashboard that transforms complex data operations into an intuitive 3D cityscape.  
Each "building" represents a processing node. Lights, colors, motion, and brightness change dynamically based on live system metrics such as throughput, latency, error rate, and backlog.

Inspired by real-world high-volume workflows (like healthcare claim pipelines, financial transaction flows, and logistics routing), this project makes operational health **instantly understandable** for both managers and engineers.

---

## Key Features

### City-Based Data Visualization
- Buildings = System nodes (ingestion, validation, routing, enrichment, downstream systems)
- Height = Throughput  
- Brightness = System health  
- Color = SLA risk (green → amber → red)  
- Traffic flow = Processing activity  

### Real-Time Metrics Streaming
- Backend WebSocket server streams live metric frames 1–2 times per second  
- Metrics include:
  - Throughput per minute  
  - p95 latency  
  - Error rate  
  - Queue/backlog size  

### Manager Mode
- High-level KPIs: global latency, throughput, error rate, backlog
- Insight feed with plain-language event summaries
- SLA risk scoring with anomaly detection
- Aesthetic, simplified city view for non-technical audiences

### Engineer Mode
- Node drill-down panel with charts (latency history, error spikes, backlog trends)
- Raw JSON log previews
- WebSocket frame inspector
- Timeline scrubber to replay past incidents

### Story Mode (Playback)
- Scrub through historical data to replay outages, spikes, or high-load events
- Compare "Now" vs a selected point in history
- Visual markers for anomalies and insights

### What-If Simulation
- Modify simulation parameters: scale factor, routing distribution, latency profile
- Watch the city react immediately
- Useful for capacity discussions or architecture reviews

---

## Architecture Overview
backend/ (Fastify + WebSocket)
├── simulator: generates 20–30 virtual system nodes
├── metrics: throughput, latency, error rate, backlog
├── insights: SLA risk scoring + anomaly detection
└── history: short-term ring buffer for story mode

frontend/ (React + Three.js + Zustand)
├── 3D city visualization
├── UI panels (Manager/Engineer mode)
├── KPI ribbon + insight feed
├── timeline playback controls
└── IndexedDB caching for story mode

---

## 🛠️ Tech Stack

### Backend
- Node.js + Fastify
- WebSocket (live metric streaming)
- TypeScript
- Docker
- Zod (schema validation)

### Frontend
- React + Vite
- Three.js (3D rendering)
- Zustand (state management)
- Canvas/D3 (mini charts)
- IndexedDB (local history caching)

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm 10+
- Docker Desktop (optional, recommended)

---

### ▶️ Running Locally (Dev Mode)

#### Backend
```bash
cd backend
npm install
npm run dev
```

Backend runs on http://localhost:8080

Frontend
```
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

---

## Roadmap

- AI-driven insight explanations

- Automated incident report generation

- Advanced city layouts (districts based on workflow type)

- Kafka/Kinesis adapter for real streaming data

- Support for financial, logistics, and insurance presets

- Mobile/tablet-friendly version
