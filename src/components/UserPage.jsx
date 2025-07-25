import React, { useState, useEffect } from "react";
import { database, ref, onValue, push, set } from "../../firebase";
import { Modal } from "antd";
import CountdownTimer from "./CountdownTimer";
import { User, Mail, Book, FileText, CheckCircle, Handshake } from "lucide-react";

const UserPage = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [testStarted, setTestStarted] = useState(false);
  const [testName, setTestName] = useState(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const userId = localStorage.getItem("userId") || "user123";

  useEffect(() => {
    const handleUnload = () => {
      localStorage.removeItem("userData");
      localStorage.removeItem("testName");
      localStorage.removeItem("testStarted");
      localStorage.removeItem("answers");
      localStorage.removeItem("submitted");
      sessionStorage.clear();
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData")) || {};
    if (!userData.email) {
      setUserName("");
      setUserEmail("");
      setTestStarted(false);
      setTestName(null);
      setAnswers({});
      setSubmitted(false);
    } else {
      setUserName(userData.name || "John Doe");
      setUserEmail(userData.email || "john.doe@example.com");
    }

    const testsRef = ref(database, "tests");
    const testStatusListener = onValue(testsRef, (snapshot) => {
      let testFound = false;
      snapshot.forEach((childSnapshot) => {
        const test = childSnapshot.val();
        if (test.status === "started") {
          setTestName(test.name);
          setTestStarted(true);
          testFound = true;
        }
      });
      if (!testFound) {
        setTestName(null);
        setTestStarted(false);
      }
    });

    const presentRef = ref(database, "present");
    const questionsListener = onValue(presentRef, (snapshot) => {
      const questionsData = [];
      snapshot.forEach((childSnapshot) => {
        const question = childSnapshot.val();
        questionsData.push({
          id: childSnapshot.key,
          ...question,
        });
      });
      setQuestions(questionsData);
      setLoading(false);
    });

    return () => {
      testStatusListener();
      questionsListener();
    };
  }, []);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => {
      const updated = { ...prev, [questionId]: answer };
      localStorage.setItem("answers", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSubmitAnswers = async () => {
    if (submitted) {
      Modal.warning({ title: "Warning", content: "You have already submitted your answers!" });
      return;
    }

    if (Object.keys(answers).length !== questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    if (!testName) {
      alert("Test name is undefined. Please wait or contact the admin.");
      return;
    }

    setSubmitting(true);
    const answersRef = ref(database, "answers");
    const newAnswersRef = push(answersRef);
    const answersData = {
      userId,
      name: userName,
      email: userEmail,
      testName,
      answers,
      submittedAt: new Date().toISOString(),
    };

    try {
      await set(newAnswersRef, answersData);
      setSubmitted(true);
      Modal.success({ title: "Submitted", content: "Your answers have been submitted successfully!" });
      localStorage.setItem("submitted", "true");
    } catch (error) {
      alert("Error submitting answers: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-base-100 p-4">
      <div className="w-full max-w-4xl">
        <div className="card bg-[#B0E0E6] text-black shadow-md p-6 rounded-box">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <User className="w-5 h-5" /> Hi!
          </h2>
          <p className="mt-2">
            <strong className="flex items-center gap-2"><Handshake className="w-5 h-5" />Welcome: {userName}</strong>
          </p>
          <p>
            <strong className="flex items-center gap-2"><Mail className="w-4 h-4" />Email:{userEmail}</strong> 
          </p>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <span className="loading loading-ring loading-md"></span>
            </div>
          ) : testStarted ? (
            <>
              <div className="mt-6 border border-base-300 p-4 rounded-box text-center">
                <h3 className="text-xl font-semibold flex justify-center items-center gap-2">
                  <Book className="w-5 h-5" /> {testName}
                </h3>
                <div className="mt-2 flex justify-center">
                  <CountdownTimer
                    initialTime={119}
                    onTimeUp={handleSubmitAnswers}
                    submitted={submitted}
                    testStarted={testStarted}
                  />
                </div>
              </div>

              <form onSubmit={(e) => e.preventDefault()} className="mt-6 space-y-6">
                {questions.map((q, idx) => (
                  <div key={q.id}>
                    <fieldset className="border border-base-300 rounded-box p-4">
                      <legend className="text-md font-medium flex items-center gap-2">
                        <FileText className="w-4 h-4" /> {q.question}
                      </legend>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                        {q.choices.map((choice, index) => (
                          <label key={index} className="flex items-center gap-2">
                            <input
                              type="radio"
                              className="radio radio-primary"
                              name={`q_${q.id}`}
                              value={choice}
                              checked={answers[q.id] === choice}
                              onChange={() => handleAnswerChange(q.id, choice)}
                            />
                            <span>{choice}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    {idx < questions.length - 1 && (
                      <div className="divider text-black">Next Question</div>
                    )}
                  </div>
                ))}

                <div className="text-center">
                  <button
                    type="button"
                    className="btn btn-success mt-4 flex items-center justify-center gap-2"
                    onClick={handleSubmitAnswers}
                    disabled={submitted || submitting}
                  >
                    {submitting ? (
                      <span className="loading loading-ring loading-md"></span>
                    ) : submitted ? (
                      <>
                        <CheckCircle className="w-4 h-4" /> Submitted
                      </>
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <p className="mt-6 font-medium">Wait, the test will start soon...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPage;
