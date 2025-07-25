import React, { useState, useEffect } from "react";
import { database, ref, push, set, get, remove } from "../../firebase";
import { useNavigate } from "react-router-dom";

const UserSignup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [status, setStatus] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      checkIfAdmin(userEmail);
    }
  }, []);

  const checkIfAdmin = async (userEmail) => {
    try {
      const usersRef = ref(database, "users");
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        let userIsAdmin = false;
        snapshot.forEach((childSnapshot) => {
          const user = childSnapshot.val();
          if (user.email === userEmail && user.role === "admin") {
            userIsAdmin = true;
          }
        });
        setIsAdmin(userIsAdmin);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setStatus("Please fill in all fields.");
      return;
    }

    try {
      const usersRef = ref(database, "users");
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        let emailExists = false;
        snapshot.forEach((childSnapshot) => {
          const user = childSnapshot.val();
          if (user.email === email) {
            emailExists = true;
          }
        });
        if (emailExists) {
          setStatus("This email is already registered. Please use a different one.");
          return;
        }
      }

      if (isAdmin) {
        setLoading(true);
        const newUserRef = push(usersRef);
        await set(newUserRef, {
          name,
          email,
          password,
          role,
        });

        setStatus("✅ User registered successfully!");
        setName("");
        setEmail("");
        setPassword("");
        setRole("user");
        setTimeout(() => navigate("/login"), 1000);
      } else {
        setStatus("❌ Only admins can add new users.");
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUsers = async () => {
    if (!isAdmin) {
      setStatus("❌ You are not authorized to delete users.");
      return;
    }

    try {
      const usersRef = ref(database, "users");
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const user = childSnapshot.val();
          if (user.role !== "admin") {
            const userRef = ref(database, `users/${childSnapshot.key}`);
            remove(userRef);
          }
        });
        setStatus("✅ All non-admin users have been deleted.");
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-100 px-4">
      <form onSubmit={handleSubmit}>
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-96 border p-6">
          <legend className="fieldset-legend text-lg font-bold">User Registration</legend>

          <label className="label mt-2">Name</label>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label className="label mt-2">Email</label>
          <input
            type="email"
            className="input input-bordered w-full"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="label mt-2">Password</label>
          <input
            type="password"
            className="input input-bordered w-full"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {isAdmin && (
            <>
              <label className="label mt-2">Role</label>
              <select
                className="select select-bordered w-full"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </>
          )}

          <button
            className={`btn btn-neutral w-full mt-4 ${loading ? "opacity-60 cursor-wait" : ""}`}
            type="submit"
            disabled={!isAdmin || loading}
          >
            {loading ? <span className="loading loading-ring loading-md"></span> : "Register User"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="btn btn-outline btn-primary w-full mt-2"
          >
            Go to Login
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={handleDeleteUsers}
              className="btn btn-error w-full mt-2"
            >
              Delete All Users (except Admin)
            </button>
          )}
        </fieldset>

        {status && (
          <p
            className={`text-sm text-center mt-2 ${
              status.startsWith("✅")
                ? "text-success"
                : status.startsWith("❌") || status.startsWith("Error")
                ? "text-error"
                : "text-warning"
            }`}
          >
            {status}
          </p>
        )}
      </form>
    </div>
  );
};

export default UserSignup;
