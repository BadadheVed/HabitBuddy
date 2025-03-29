import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./index.css";
import Landing from "./landing";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./login";
import Dashboard from "./Dashboard";
import Tokens from "./Tokens";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard/:email"
          element={
            <Tokens>
              <Dashboard />
            </Tokens>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
