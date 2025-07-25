import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { database, ref, get } from "../../firebase";
import { Button, Typography, message } from "antd";
import { motion } from "framer-motion";

const { Title } = Typography;

const AnswersPage = () => {
  const [questions, setQuestions] = useState([]);
  const [activeTest, setActiveTest] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const testsSnap = await get(ref(database, "tests"));
        const allTests = testsSnap.exists() ? Object.entries(testsSnap.val()) : [];

        const latestTestEntry = allTests.reverse().find(([, val]) => val.questions?.length);
        if (!latestTestEntry) {
          message.warning("No test with questions found.");
          return;
        }

        const [testId, testData] = latestTestEntry;
        setActiveTest({ id: testId, ...testData });

        const selectedQuestions = testData.questions || [];
        setQuestions(selectedQuestions);
      } catch (err) {
        console.error("Error fetching data:", err);
        message.error("Error loading questions.");
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-5 bg-base-100 min-h-screen">
      <div className="mb-6 text-center">
        <Title level={2} className="text-primary">Correct Answers</Title>
        {activeTest?.name && (
          <Title level={4} className="text-secondary">Test Name: {activeTest.name}</Title>
        )}
      </div>

      <div className="grid gap-6">
        {questions.map((q, index) => {
          const correctAnswer =
            typeof q.answer === "number" ? q.choices[q.answer] : q.answer;

          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="card shadow-xl bg-base-200 border border-base-300"
            >
              <div className="card-body">
                <h2 className="card-title text-lg font-semibold text-primary">
                  Q{index + 1}: {q.question}
                </h2>
                <p className="text-success text-md">
                  ✅ Correct Answer: <span className="font-bold">{correctAnswer}</span>
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <Button type="primary" className="btn btn-primary" onClick={() => navigate("/result")}>
          View Results Page
        </Button>
      </div>
    </div>
  );
};

export default AnswersPage;
