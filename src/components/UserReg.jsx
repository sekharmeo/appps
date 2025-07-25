import React, { useState } from "react";
import { database, ref, push, set, get } from "../../firebase";
import { useNavigate } from "react-router-dom";

const UserReg = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page refresh
    if (!name || !email || !password) {
      setStatus("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const usersRef = ref(database, "users");
      const snapshot = await get(usersRef);

      let emailExists = false;
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const user = childSnapshot.val();
          if (user.email === email) {
            emailExists = true;
          }
        });

        if (emailExists) {
          setStatus("This email is already registered. Please use a different one.");
          setLoading(false);
          return;
        }
      }

      const newUserRef = push(usersRef);
      await set(newUserRef, { name, email, password, role: "user" });

      setStatus("User registered successfully!");
      setName("");
      setEmail("");
      setPassword("");
      navigate("/login");
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-100">
      <form onSubmit={handleSubmit}>
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-96 border p-6 shadow-md">
          <legend className="fieldset-legend text-lg font-bold">User Registration</legend>

          <label className="label">
            <span className="label-text">Name</span>
          </label>
          <input
            type="text"
            placeholder="Name"
            className="input input-bordered w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <input
            type="email"
            placeholder="Email"
            className="input input-bordered w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="label">
            <span className="label-text">Password</span>
          </label>
          <input
            type="password"
            placeholder="Password"
            className="input input-bordered w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn btn-neutral w-full mt-4" disabled={loading}>
            {loading ? <span className="loading loading-ring loading-md"></span> : "Register"}
          </button>

          <button type="button" onClick={goToLogin} className="btn btn-link w-full mt-2">
            Go to Login
          </button>

          {status && (
            <div
              className={`mt-4 text-sm ${
                status.toLowerCase().includes("error") ? "text-error" : "text-success"
              }`}
            >
              {status}
            </div>
          )}
        </fieldset>
      </form>
    </div>
  );
};

export default UserReg;
