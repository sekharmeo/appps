import React, { useState, useEffect } from "react";
import { database, ref, push, set, update, remove, onValue } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import CountdownTimer from "./CountdownTimer";


const QuestionPage = () => {
  const [testName, setTestName] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState(0);
  const [status, setStatus] = useState("");
  const [tests, setTests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [testTimer, setTestTimer] = useState(null);
  const [timerDuration, setTimerDuration] = useState(120);
  const navigate = useNavigate();

  const shuffleArray = (array) => {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  };

  useEffect(() => {
    const testsRef = ref(database, "tests");
    const questionsRef = ref(database, "quiz/questions");

    const unsubscribeTests = onValue(testsRef, (snapshot) => {
      if (snapshot.exists()) {
        const testsData = [];
        snapshot.forEach((childSnapshot) => {
          const test = childSnapshot.val();
          testsData.push({
            id: childSnapshot.key,
            ...test,
          });
        });
        setTests(testsData);
      } else {
        setTests([]);
        setStatus("No tests found.");
      }
    });

    const unsubscribeQuestions = onValue(questionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const questionsData = [];
        snapshot.forEach((childSnapshot) => {
          const question = childSnapshot.val();
          questionsData.push({
            id: childSnapshot.key,
            ...question,
          });
        });
        setQuestions(questionsData);
      } else {
        setQuestions([]);
        setStatus("No questions found.");
      }
    });

    return () => {
      unsubscribeTests();
      unsubscribeQuestions();
    };
  }, []);

  const handleTestSubmit = async () => {
    if (!testName || numberOfQuestions <= 0) {
      message.warning("Please provide a valid test name and number of questions.");
      return;
    }

    if (numberOfQuestions > questions.length) {
      message.error(`Not enough questions available. Only ${questions.length} questions are available.`);
      return;
    }

    try {
      const testsRef = ref(database, "tests");
      const shuffledQuestions = shuffleArray(questions);
      const selectedQuestions = shuffledQuestions.slice(0, numberOfQuestions);

      const newTestRef = push(testsRef);
      await set(newTestRef, {
        name: testName,
        numberOfQuestions,
        createdAt: new Date().toISOString(),
        status: "stopped",
        questions: selectedQuestions.map((q) => ({
          id: q.id,
          question: q.question,
          choices: q.choices,
          answer: q.answer,
        })),
      });

      setStatus("Test created successfully!");
      setTestName("");
      setNumberOfQuestions(0);
    } catch (error) {
      message.error(`Error: ${error.message}`);
    }
  };

  const toggleTestStatus = async (testId, currentStatus) => {
    const test = tests.find((test) => test.id === testId);
    const runningTest = tests.find((test) => test.status === "started");

    if (runningTest && currentStatus !== "started") {
      message.warning("A test is already running. Only one test can be started at a time.");
      return;
    }

    const newStatus = currentStatus === "stopped" ? "started" : "stopped";
    const testRef = ref(database, `tests/${testId}`);
    const presentRef = ref(database, "present");

    try {
      if (newStatus === "stopped") {
        clearTimeout(testTimer);
        await remove(presentRef);
      } else if (newStatus === "started") {
        await remove(presentRef);
        const selectedQuestions = test.questions.map((q) => ({
          id: q.id,
          question: q.question,
          choices: q.choices,
          answer: q.answer,
          testId: testId,
        }));

        for (const question of selectedQuestions) {
          const newQuestionRef = push(presentRef);
          await set(newQuestionRef, question);
        }

        setTestTimer(setTimeout(() => stopTestAfterTimeout(testId), timerDuration * 1000));
      }

      await update(testRef, { status: newStatus });
      setTests((prevTests) =>
        prevTests.map((test) =>
          test.id === testId ? { ...test, status: newStatus } : test
        )
      );

      message.success(`Test "${test.name}" is now ${newStatus}.`);
    } catch (error) {
      message.error(`Error updating test status: ${error.message}`);
    }
  };

  const stopTestAfterTimeout = async (testId) => {
    try {
      const testRef = ref(database, `tests/${testId}`);
      const test = tests.find((test) => test.id === testId);

      await update(testRef, { status: "stopped" });
      setTests((prevTests) =>
        prevTests.map((test) =>
          test.id === testId ? { ...test, status: "stopped" } : test
        )
      );

      message.success(`Test "${test.name}" has been automatically stopped due to time limit.`);
      navigate("/answers");
    } catch (error) {
      message.error(`Error stopping test: ${error.message}`);
    }
  };

  const deleteTest = async (testId) => {
    const testRef = ref(database, `tests/${testId}`);
    const presentRef = ref(database, "present");

    try {
      const test = tests.find((test) => test.id === testId);
      if (test && test.status === "started") {
        await remove(presentRef);
      }

      await remove(testRef);
      setTests((prevTests) => prevTests.filter((test) => test.id !== testId));
      message.success(`Test deleted successfully.`);
    } catch (error) {
      message.error(`Error deleting test: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 flex flex-col items-center justify-start p-6 space-y-6">
      
      <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
      <p className="text-sm text-neutral-content">Welcome, Admin!</p>

      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full max-w-md border p-6">
        <legend className="fieldset-legend text-lg font-semibold text-primary">Create a New Test</legend>

        <label className="label">Test Name</label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          placeholder="Enter test name"
        />

        <label className="label mt-4">Number of Questions</label>
        <input
          type="number"
          className="input input-bordered w-full"
          value={numberOfQuestions}
          onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
          placeholder="Enter number of questions"
        />

        <button className="btn btn-neutral mt-6 w-full" onClick={handleTestSubmit}>
          Create Test
        </button>
      </fieldset>

      <h2 className="text-2xl font-semibold text-primary mt-8">Existing Tests</h2>

      {tests.length > 0 ? (
        <div className="w-full max-w-3xl space-y-4">
          {tests.map((test) => (
            <div
              key={test.id}
              className="card bg-base-200 border border-base-300 shadow p-4"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div className="text-left">
                  <h3 className="text-lg font-bold text-primary">{test.name}</h3>
                  <p className="text-sm text-neutral-content">
                    Status: {test.status} | Questions: {test.numberOfQuestions}
                  </p>
                </div>
                <div className="flex space-x-2 mt-4 sm:mt-0">
                  <button
                    className="btn btn-primary"
                    onClick={() => toggleTestStatus(test.id, test.status)}
                  >
                    {test.status === "stopped" ? "Start Test" : "Stop Test"}
                  </button>
                  <button
                    className="btn btn-error"
                    onClick={() => deleteTest(test.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-neutral-content">No tests found.</p>
      )}
    </div>
  );
};

export default QuestionPage;
