import { useState } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import TickerTape from "./components/TickerTape";
import "./App.css";

function App() {
  const [category, setCategory] = useState("icici");

  return (
    <div>
      <Navbar setCategory={setCategory} category={category} />
      <TickerTape />

      <Dashboard category={category} />
    </div>
  );
}

export default App;
