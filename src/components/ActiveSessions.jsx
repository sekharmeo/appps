// src/components/ActiveSessions.jsx

import React, { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { database } from "../../firebase";
import { Button, message } from "antd";

const ActiveSessions = () => {
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    const usersRef = ref(database, "users");

    const unsubscribe = onValue(usersRef, (snapshot) => {
      const users = [];
      snapshot.forEach((child) => {
        const data = child.val();
        if (data.sessionExpiresAt && data.sessionId) {
          users.push({
            id: child.key,
            ...data,
          });
        }
      });
      setActiveUsers(users);
    });

    return () => unsubscribe();
  }, []);

  const clearSession = async (userId) => {
    try {
      await update(ref(database), {
        [`users/${userId}/sessionExpiresAt`]: null,
        [`users/${userId}/sessionId`]: null,
      });
      message.success("Session cleared for user.");
    } catch (err) {
      message.error("Failed to clear session.");
    }
  };

  const clearAllSessions = async () => {
    try {
      const updates = {};
      activeUsers.forEach((user) => {
        updates[`users/${user.id}/sessionExpiresAt`] = null;
        updates[`users/${user.id}/sessionId`] = null;
      });
      await update(ref(database), updates);
      message.success("All sessions cleared.");
    } catch (err) {
      message.error("Failed to clear sessions.");
    }
  };

  return (
    <div className="bg-base-100 shadow rounded-box p-6 mt-4">
      <h3 className="text-xl font-bold mb-4 text-info">Active Sessions</h3>

      {activeUsers.length === 0 ? (
        <p className="text-neutral">No active sessions.</p>
      ) : (
        <>
          <ul className="space-y-3 mb-6">
            {activeUsers.map((user) => (
              <li
                key={user.id}
                className="flex justify-between items-center p-4 border rounded bg-base-200"
              >
                <div className="text-sm">
                  <strong>User:</strong> {user.name} &nbsp;
                  <strong>Email Id:</strong> {user.email} &nbsp;
                  <strong>Session:</strong> Active
                </div>
                <Button
                  type="primary"
                  danger
                  size="small"
                  onClick={() => clearSession(user.id)}
                >
                  Clear Session
                </Button>
              </li>
            ))}
          </ul>

          <div className="text-right">
            <Button type="primary" danger onClick={clearAllSessions}>
              Clear All Sessions
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ActiveSessions;
