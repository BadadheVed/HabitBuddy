import { useState } from "react";
import reactLogo from "./assets/react.svg";

import "./index.css";
import Landing from "./landing";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./login";
import Dashboard from "./Dashboard";
import Tokens from "./Tokens";
import AddActivity from "./AddActivity";
import MyActivities from "./MyActivities";
import AddFriend from "./AddFriend";
import ChallengeActivity from "./ChallengeFriend";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard/:name"
          element={
            <Tokens>
              <Dashboard />
            </Tokens>
          }
        />
        <Route
          path="/dashboard/:name/add"
          element={
            <Tokens>
              <AddActivity />
            </Tokens>
          }
        />
        <Route
          path="/dashboard/:name/activities"
          element={
            <Tokens>
              <MyActivities />
            </Tokens>
          }
        />
        <Route
          path="/dashboard/:name/add-friend"
          element={
            <Tokens>
              <AddFriend />
            </Tokens>
          }
        />
        <Route
          path="/dashboard/:name/challenge"
          element={
            <Tokens>
              <ChallengeActivity />
            </Tokens>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
