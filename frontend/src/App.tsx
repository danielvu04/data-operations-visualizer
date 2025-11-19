import CityScene from "./CityScene";
import KpiRibbon from "./components/KpiRibbon";

export default function App() {
  return (
    <div>
      <h1 style={{ textAlign: "center" }}>
        Data Operations Visualizer</h1>
      <KpiRibbon />
      <CityScene /> 
      
    </div>
  );
}
