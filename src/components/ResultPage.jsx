import React, { useState, useEffect } from "react";
import { database, ref, onValue, remove } from "../../firebase";
import { Table, Button, Typography, message } from "antd";
import { Collapse } from "antd";
import { motion } from "framer-motion";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const ResultsPage = () => {
  const [results, setResults] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [activeTest, setActiveTest] = useState(null);
  const [status, setStatus] = useState("Loading...");

  // Fetch latest test
  useEffect(() => {
    const testsRef = ref(database, "tests");
    onValue(testsRef, (snapshot) => {
      if (snapshot.exists()) {
        const allTests = Object.entries(snapshot.val()).map(([id, data]) => ({
          id,
          ...data,
        }));

        const sorted = allTests
          .filter((test) => test.status === "started" || test.status === "stopped")
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (sorted.length > 0) {
          setActiveTest(sorted[0]);
          setQuestions(sorted[0].questions || []);
        } else {
          setStatus("No active or stopped test found.");
        }
      } else {
        setStatus("No tests found.");
      }
    });
  }, []);

  // Fetch answers
  useEffect(() => {
    const answersRef = ref(database, "answers");
    onValue(answersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = Object.values(snapshot.val());
        setResults(data);
        setStatus("");
      } else {
        setResults([]);
        setStatus("No answers submitted.");
      }
    });
  }, []);

  const calculateScore = (userAnswers) => {
    let score = 0;
    questions.forEach((q) => {
      if (userAnswers[q.id] === q.answer) score++;
    });
    return score;
  };

  const deleteAllResults = async () => {
    try {
      await remove(ref(database, "answers"));
      setResults([]);
      message.success("All results deleted.");
    } catch (error) {
      message.error("Failed to delete results.");
    }
  };

  const sortedResults = results
    .map((result, i) => ({
      key: i,
      ...result,
      score: calculateScore(result.answers),
    }))
    .sort((a, b) => b.score - a.score);

  const columns = [
    {
      title: "🏅 Rank",
      key: "rank",
      render: (_, __, index) => index + 1,
    },
    { title: "👤 Name", dataIndex: "name", key: "name" },
    { title: "📧 Email", dataIndex: "email", key: "email" },
    {
      title: "✅ Score",
      dataIndex: "score",
      key: "score",
      render: (score) => (
        <span className="font-bold text-green-600">
          {score} / {questions.length}
        </span>
      ),
    },
  ];

  return (
    <motion.div
      className="max-w-6xl mx-auto px-4 py-10"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary">📊 Leaderboard</h1>
        <p className="text-sm text-gray-500 mt-2">{status}</p>
      </div>

      {activeTest && (
        <motion.div
          className="bg-base-200 p-5 rounded-xl shadow mb-6"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          <p className="text-lg">
            <span className="font-semibold text-neutral">Test Name:</span>{" "}
            <span className="text-accent">{activeTest.name}</span>
          </p>
          <p>
            <span className="font-semibold text-neutral">Created At:</span>{" "}
            {new Date(activeTest.createdAt).toLocaleString()}
          </p>
          <p>
            <span className="font-semibold text-neutral">Status:</span>{" "}
            <span className="badge badge-info">{activeTest.status}</span>
          </p>
        </motion.div>
      )}

      {sortedResults.length > 0 && questions.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
            <Table
              dataSource={sortedResults}
              columns={columns}
              pagination={{ pageSize: 5 }}
              className="bg-white rounded-xl"
              expandable={{
                expandedRowRender: (record) => (
                  <Collapse ghost className="mt-2">
                    {questions.map((q, idx) => {
                      const userAnswer = record.answers[q.id];
                      const isCorrect = userAnswer === q.answer;
                      return (
                        <Panel header={`Q${idx + 1}: ${q.question}`} key={q.id}>
                          <p>
                            <strong>Your Answer:</strong>{" "}
                            <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                              {q.choices[userAnswer] ?? "Not Answered"}
                            </span>
                          </p>
                          <p>
                            <strong>Correct Answer:</strong>{" "}
                            <span className="text-green-700 font-medium">
                              {q.choices[q.answer]}
                            </span>
                          </p>
                        </Panel>
                      );
                    })}
                  </Collapse>
                ),
              }}
            />
          </div>

          <div className="flex justify-end mt-6">
            <button
              className="btn btn-error btn-outline"
              onClick={deleteAllResults}
            >
              🗑️ Delete All Results
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default ResultsPage;
