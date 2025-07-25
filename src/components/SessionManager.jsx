import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { database, ref, set } from "../../firebase";

const SessionManager = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const sessionExpiresAt = localStorage.getItem("sessionExpiresAt");
    const userData = JSON.parse(localStorage.getItem("userData"));

    if (sessionExpiresAt && userData) {
      const now = Date.now();
      const timeLeft = Number(sessionExpiresAt) - now;

      if (timeLeft <= 0) {
        handleLogout();
      } else {
        const timer = setTimeout(() => {
          handleLogout();
        }, timeLeft);

        return () => clearTimeout(timer);
      }
    }

    async function handleLogout() {
      message.warning("Session expired. Logging out...");

      if (userData?.email) {
        const userRef = ref(database, `users/${userData.email.replace(/[\\.@]/g, '_')}`);
        await set(userRef, {
          sessionId: null,
          sessionExpiresAt: null,
        });
      }

      localStorage.clear();
      navigate("/login");
    }
  }, [navigate]);

  return null;
};

export default SessionManager;
