// src/components/QuizPage.js

import React, { useState, useEffect } from "react";
import { database, ref, get } from "../../firebase"; // Import Firebase methods
import { Form, Radio, Button, Typography, message } from "antd";  // Import Ant Design components

const { Title, Text } = Typography;

const QuizPage = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [status, setStatus] = useState("Loading questions...");

  // Fetch questions from Firebase
  useEffect(() => {
    const fetchQuestions = async () => {
      const questionsRef = ref(database, "quiz/questions");
      const snapshot = await get(questionsRef);

      if (snapshot.exists()) {
        const questionsData = [];
        snapshot.forEach((childSnapshot) => {
          questionsData.push({
            id: childSnapshot.key,
            ...childSnapshot.val(),
          });
        });
        setQuestions(questionsData);
        setStatus(""); // Clear loading message
      } else {
        setStatus("No questions found.");
        message.info("No questions found.");
      }
    };

    fetchQuestions();
  }, []);

  // Handle answer change
  const handleAnswerChange = (questionId, selectedChoice) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: selectedChoice,
    }));
  };

  // Verify answers and calculate score
  const handleSubmit = () => {
    let totalScore = 0;

    questions.forEach((q) => {
      const userAnswer = answers[q.id];
      if (userAnswer === q.answer) {
        totalScore += 1;
      }
    });

    setScore(totalScore); // Set the score
    message.success(`You scored ${totalScore} out of ${questions.length}`);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", textAlign: "center" }}>
      <div style={{ maxWidth: "600px", width: "100%" }}>
        <Title level={2}>Quiz</Title>
        {status && <Text type="secondary">{status}</Text>}

        {questions.length > 0 && (
          <Form onFinish={handleSubmit} layout="vertical">
            {questions.map((q) => (
              <Form.Item key={q.id} label={<strong>{q.question}</strong>}>
                <Radio.Group
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  value={answers[q.id]}
                >
                  {q.choices.map((choice, index) => (
                    <Radio key={index} value={choice}>
                      {choice}
                    </Radio>
                  ))}
                </Radio.Group>
              </Form.Item>
            ))}
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Submit Answers
              </Button>
            </Form.Item>
          </Form>
        )}

        {score !== null && (
          <div style={{ marginTop: "20px" }}>
            <Title level={3}>Your Score: {score} / {questions.length}</Title>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
