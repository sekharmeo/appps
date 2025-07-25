// src/components/CountdownTimer.jsx

import React, { useEffect, useState } from "react";
import { Typography } from "antd";

const { Text } = Typography;

const CountdownTimer = ({ initialTime, onTimeUp, submitted, testStarted }) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);

  useEffect(() => {
    let countdownInterval;

    if (testStarted && timeRemaining > 0 && !submitted) {
      countdownInterval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    }

    if (timeRemaining === 0 && !submitted) {
      onTimeUp();
    }

    return () => clearInterval(countdownInterval);
  }, [timeRemaining, testStarted, submitted, onTimeUp]);

  return (
    <fieldset className="fieldset  border-base-300 rounded-box w-fit p-4">
      <legend className="fieldset-legend text-lg font-semibold text-primary">
        Time
      </legend>
      
      <div className="text-lg font-bold text-error">
        {Math.floor(timeRemaining / 60)}:
        {(timeRemaining % 60).toString().padStart(2, "0")}
      </div>

      
    </fieldset>
  );
};

export default CountdownTimer;
