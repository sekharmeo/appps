import React, { useState } from "react";
import UploadQuestions from "./UploadQuestions";
import UserSignup from "./UserSignup";
import QuestionPage from "./SetQuestions";
import ResultsPage from "./ResultPage";
import ActiveSessions from "./ActiveSessions"; // ✅ Import

const AdminPage = () => {
  const [activeComponent, setActiveComponent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleButtonClick = (component) => {
    setActiveComponent(component);
  };

  const handleStartTest = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setActiveComponent("ResultsPage");
    }, 120000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 text-center px-4">
      <h2 className="text-3xl font-bold text-primary mb-2">Admin Dashboard</h2>
      <p className="text-base-content mb-8">Welcome, Admin!</p>

      {/* Button group */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <button
          className="btn btn-primary w-40"
          onClick={() => handleButtonClick("UploadQuestions")}
        >
          Upload
        </button>
        <button
          className="btn btn-secondary w-40"
          onClick={() => handleButtonClick("UserSignup")}
        >
          Registration
        </button>
        <button
          className="btn btn-accent w-40"
          onClick={() => handleButtonClick("QuestionPage")}
        >
          Test
        </button>
        <button
          className="btn btn-info w-40"
          onClick={() => handleButtonClick("ActiveSessions")}
        >
          Sessions
        </button>
      </div>

      {/* Conditional rendering */}
      <div className="w-full max-w-4xl">
        {activeComponent === "UploadQuestions" && <UploadQuestions />}
        {activeComponent === "UserSignup" && <UserSignup />}
        {activeComponent === "QuestionPage" && (
          <>
            <QuestionPage handleStartTest={handleStartTest} />
            {loading && (
              <div className="flex justify-center mt-6">
                <span className="loading loading-spinner loading-lg text-accent"></span>
              </div>
            )}
          </>
        )}
        {activeComponent === "ResultsPage" && <ResultsPage />}
        {activeComponent === "ActiveSessions" && <ActiveSessions />}
      </div>
    </div>
  );
};

export default AdminPage;
