import React, { useState, useEffect } from "react";
import { database, ref, onValue, set, push } from "../../firebase";
import { Row, Col, Card, Radio, Button, Spin, notification } from "antd";

const StartedTestQuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const presentRef = ref(database, "present");

    // Use onValue to listen for changes in the "present" collection
    const unsubscribe = onValue(presentRef, (snapshot) => {
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
        setStatus(""); // Clear status if questions are available
      } else {
        setStatus("No questions available for the started test.");
        setQuestions([]); // Clear questions if none are available
      }
      setLoading(false); // Set loading to false after data is fetched
    });

    // Fetch user data from Firebase based on local storage
    const fetchUserData = async () => {
      const userEmail = localStorage.getItem("userEmail");
      if (userEmail) {
        try {
          const usersRef = ref(database, "users");
          onValue(usersRef, (usersSnapshot) => {
            usersSnapshot.forEach((userSnapshot) => {
              const user = userSnapshot.val();
              if (user.email === userEmail) {
                setUserData(user);
              }
            });
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();

    // Clean up the listener when the component is unmounted
    return () => unsubscribe();
  }, []);

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async () => {
    if (!userData) {
      setStatus("User data not found. Please try logging in again.");
      return;
    }

    let score = 0;

    // Calculate score
    questions.forEach((question) => {
      if (answers[question.id] === question.answer) {
        score += 1;
      }
    });

    // Extract testId from the first question object, if available
    const testId = questions.length > 0 ? questions[0].testId : null;

    try {
      const resultRef = push(ref(database, "result")); // Automatically generates a unique ID
      await set(resultRef, {
        email: userData.email,
        name: userData.name,
        score: score,
        testId: testId, // Add testId to the result entry
      });

      console.log("User Email:", userData.email);
      console.log("User Name:", userData.name);
      console.log("Score:", score);
      console.log("Test ID:", testId);

      // Reset the state after submission
      setQuestions([]);
      setAnswers({});
      setStatus("Submission successful. Your responses have been recorded in the 'result' collection.");
    } catch (error) {
      setStatus(`Error saving results: ${error.message}`);
    }
  };

  return (
    <Row justify="center" align="middle" style={{ minHeight: "100vh" }}>
      <Col span={12}>
        <Card title="Questions for Current Started Test" bordered>
          {status && <p>{status}</p>}

          {loading ? (
            <Spin tip="Loading..." />
          ) : questions.length > 0 ? (
            <ul>
              {questions.map((question) => (
                <li key={question.id}>
                  <p>{question.question}</p>
                  <Radio.Group
                    value={answers[question.id]}
                    onChange={(e) => handleAnswerSelect(question.id, e.target.value)}
                  >
                    {question.choices.map((choice, choiceIndex) => (
                      <Radio key={choiceIndex} value={choice}>
                        {choice}
                      </Radio>
                    ))}
                  </Radio.Group>
                </li>
              ))}
            </ul>
          ) : (
            !status && <p>No questions available.</p>
          )}

          <Button type="primary" block onClick={handleSubmit} style={{ marginTop: "20px" }}>
            Submit
          </Button>
        </Card>
      </Col>
    </Row>
  );
};

export default StartedTestQuestionsPage;
