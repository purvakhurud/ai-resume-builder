import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="container auth-container">
      <h1>Welcome Back</h1>
      <p className="subtitle">Log in to access your saved resumes</p>

      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)} required />

        {error && <p className="error-text">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <p className="switch-auth">
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}

export default Login;
