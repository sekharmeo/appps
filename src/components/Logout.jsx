import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, update } from "firebase/database";
import { database } from "../../firebase"; // Adjust the import path as necessary

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));

    if (userData?.email) {
      // Convert email to Firebase-safe key
      const safeEmail = userData.email.replace(/[.#$[\]]/g, "_");
      const userRef = ref(database, `users/${safeEmail}`);

      // Clear session fields in Firebase
      update(userRef, {
        sessionId: null,
        sessionExpiresAt: null,
      })
        .then(() => {
          console.log("✅ Session fields cleared from Firebase.");
          localStorage.clear();
          navigate("/login");
        })
        .catch((error) => {
          console.error("❌ Failed to clear session fields:", error);
          localStorage.clear();
          navigate("/login");
        });
    } else {
      localStorage.clear();
      navigate("/login");
    }
  }, [navigate]);

  return null;
};

export default Logout;
