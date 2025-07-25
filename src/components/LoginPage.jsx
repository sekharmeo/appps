import React, { useState } from "react";
import { database, ref, get, set, update } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const navigate = useNavigate();

  const addToast = (message, type = "info") => {
    setToasts((prev) => [...prev, { message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 3000);
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      addToast("Please enter both email and password.", "info");
      return;
    }

    try {
      setLoading(true);
      const userRef = ref(database, "users");
      const snapshot = await get(userRef);
      const newSessionId = nanoid();
      let userFound = false;

      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const user = childSnapshot.val();

          if (user.email === email && user.password === password) {
            const userKey = childSnapshot.key;
            const userDbRef = ref(database, `users/${userKey}`);
            const now = Date.now();

            if (user.sessionExpiresAt && now > user.sessionExpiresAt) {
              update(userDbRef, {
                sessionId: null,
                sessionExpiresAt: null,
              });
              user.sessionId = null;
              user.sessionExpiresAt = null;
            }

            if (user.sessionId && user.sessionExpiresAt > now) {
              addToast("Already logged in on another device.", "info");
              userFound = true;
              setLoading(false);
              return;
            }

            const sessionDuration = 1000 * 60 * 60;
            const sessionExpiresAt = now + sessionDuration;

            localStorage.setItem(
              "userData",
              JSON.stringify({
                name: user.name,
                email: user.email,
                role: user.role,
              })
            );
            localStorage.setItem("sessionId", newSessionId);
            localStorage.setItem("sessionExpiresAt", sessionExpiresAt.toString());

            update(userDbRef, {
              sessionId: newSessionId,
              sessionExpiresAt: sessionExpiresAt,
            });

            userFound = true;
            addToast("Login successful!", "success");
            setLoading(false);

            setTimeout(() => {
              if (user.role === "admin") {
                window.location.href = "/dashboard";
              } else {
                window.location.href = "/waiting";
              }
            }, 1000);
          }
        });

        if (!userFound) {
          setStatus("Invalid email or password.");
          addToast("Invalid email or password.", "error");
        }
      } else {
        setStatus("No users found.");
        addToast("No users found.", "error");
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
      addToast(`Error: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 px-4">
      {/* Toasts */}
      {toasts.length > 0 && (
        <div className="toast toast-top toast-center z-50">
          {toasts.map((toast, index) => (
            <div
              key={index}
              className={`alert ${
                toast.type === "success"
                  ? "alert-success"
                  : toast.type === "error"
                  ? "alert-error"
                  : "alert-info"
              }`}
            >
              <span>{toast.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Login Form */}
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full max-w-sm border p-6 shadow">
        <legend className="fieldset-legend text-lg font-bold text-primary">Login</legend>

        <label className="label mt-2">Email</label>
        <input
          type="email"
          className="input input-bordered w-full"
          placeholder="e.g. student@school.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="label mt-4">Password</label>
        <input
          type="password"
          className="input input-bordered w-full"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="btn btn-neutral mt-6 w-full"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <span className="loading loading-ring loading-md"></span> : "Login"}
        </button>

        {status && (
          <p className="text-error mt-3 text-center text-sm">
            {status}
          </p>
        )}

        <div className="text-center mt-4">
          <p className="text-sm">
            New to EduPortal?{" "}
            <button
              onClick={() => navigate("/UserReg")}
              className="btn btn-link p-0 text-primary hover:no-underline"
            >
              Register
            </button>
          </p>
        </div>
      </fieldset>
    </div>
  );
};

export default LoginPage;
