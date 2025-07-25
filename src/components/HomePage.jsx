import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center space-y-4">
      <h1 className="text-4xl font-bold text-primary">Welcome to the Quiz App</h1>
      <p className="text-lg text-base-content">Please log in to continue</p>

      <div className="flex flex-col gap-3">
        <Link to="/login">
          <button className="btn btn-info btn-lg">Go to Login</button>
        </Link>

        
      </div>
    </div>
  );
};

export default HomePage;
