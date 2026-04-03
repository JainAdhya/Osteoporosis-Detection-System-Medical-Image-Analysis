import "./App.css";
import { Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";

function App() {
  return (
    <div className="App min-h-screen flex bg-black text-white">
      <Routes>
        <Route path="/" element={<HomePage />} /> {/* default page */}
      </Routes>
    </div>
  );
}

export default App;
