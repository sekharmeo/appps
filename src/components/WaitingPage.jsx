import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../../firebase"; // Adjust path if needed
import { Row, Col, Card, Typography, Spin } from "antd";
const { Title, Text } = Typography;

const WaitingPage = ({ onTestStarted }) => {
  const [status, setStatus] = useState("Waiting for test to start...");
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    const presentRef = ref(database, "present");

    // Listen for changes in the 'present' collection
    const unsubscribe = onValue(presentRef, (snapshot) => {
      if (snapshot.exists()) {
        setStatus("Test started! Loading questions...");
        setLoading(false); // Stop loading when test starts
        onTestStarted();
      } else {
        setStatus("Waiting for test to start...");
        setLoading(true); // Keep loading if the test hasn't started
      }
    });

    return () => unsubscribe();
  }, [onTestStarted]);

  return (
    <Row justify="center" align="middle" style={{ minHeight: "100vh" }}>
      <Col span={8}>
        <Card bordered>
          <Title level={2} style={{ textAlign: "center" }}>
            {status}
          </Title>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            {loading ? (
              <Spin size="large" tip="Loading..." />
            ) : (
              <Text type="success" style={{ display: "block", marginTop: "20px" }}>
                Test has started! Please wait for the questions.
              </Text>
            )}
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default WaitingPage;
