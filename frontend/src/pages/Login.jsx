// src/pages/Login.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // reset previous errors

    try {
      await login(email, password);
      navigate("/"); // go to Home after successful login
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Login</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <Link to="/signup">Signup</Link>
      </p>
    </div>
    </div>
  );
}

