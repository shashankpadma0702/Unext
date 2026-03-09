import { useState } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function App() {
  const [category, setCategory] = useState("bfsi");

  return (
    <div>
      <Navbar setCategory={setCategory} />

      <Dashboard category={category} />
    </div>
  );
}

export default App;
