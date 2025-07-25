import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import HomePage from "./components/HomePage";
import WaitingPage from "./components/WaitingPage";
import StartedTestQuestionsPage from "./components/StartedTestQuestionsPage";
import UserSignup from "./components/UserReg";
import ResultPage from "./components/ResultPage";
import UserReg from "./components/UserReg";
import Logout from "./components/Logout";
import AnswersPage from "./components/Answers";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const [testStarted, setTestStarted] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData) {
      setIsLoggedIn(true);
      setRole(userData.role);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userData");
    setIsLoggedIn(false);
    setRole("");
    setTestStarted(false);
    window.location.href = "/login";
  };

  return (
    <Router>
      <div className="min-h-screen bg-base-100 font-sans text-base-content p-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route path="/dashboard" element={isLoggedIn ? <Dashboard role={role} /> : <Navigate to="/login" />} />
          <Route
            path="/waiting"
            element={isLoggedIn ? <WaitingPage onTestStarted={() => setTestStarted(true)} /> : <Navigate to="/login" />}
          />
          <Route
            path="/started-test"
            element={testStarted ? <StartedTestQuestionsPage /> : <Navigate to="/waiting" />}
          />
          <Route path="/register" element={role === "admin" ? <UserSignup /> : <Navigate to="/dashboard" />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/answers" element={<AnswersPage />} /> 
          <Route path="/UserReg" element={<UserReg />} />
          <Route path="/logout" element={<Logout />} />
        </Routes>

        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className="btn btn-error absolute top-4 right-4"
          >
            Logout
          </button>
        )}
      </div>
    </Router>
  );
};

export default App;
