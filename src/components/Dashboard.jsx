import React, { useEffect, useState } from "react";
import { Spin, Typography } from "antd";
import UserPage from "./UserPage";
import AdminPage from "./AdminPage";
import SessionManager from "./SessionManager"; // ✅ Add this line

const { Text } = Typography;

const Dashboard = ({ role }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role) {
      setLoading(false);
    }
  }, [role]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin tip="Loading..." size="large" />
      </div>
    );
  }

  return (
    <>
      <SessionManager /> {/* ✅ Automatically handles logout */}
      {role === "admin" && <AdminPage />}
      {role === "user" && <UserPage />}
      {!["admin", "user"].includes(role) && (
        <div style={{ textAlign: "center", paddingTop: "20px" }}>
          <Text type="danger">Access Denied</Text>
        </div>
      )}
    </>
  );
};

export default Dashboard;
