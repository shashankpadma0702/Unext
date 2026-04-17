import { useState } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import TickerTape from "./components/TickerTape";
import DailyReport from "./components/DailyReport";
import "./App.css";

function App() {
  const [category, setCategory] = useState("icici");
  const [showReport, setShowReport] = useState(false);

  return (
    <div>
      <Navbar setCategory={setCategory} category={category} setShowReport={setShowReport} />
      
      {showReport ? (
        <DailyReport />
      ) : (
        <>
          <TickerTape />
          <Dashboard category={category} />
        </>
      )}
    </div>
  );
}

export default App;
