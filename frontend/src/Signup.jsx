import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="container auth-container">
      <h1>Create Account</h1>
      <p className="subtitle">Sign up to save and manage your resumes</p>

      <form onSubmit={handleSubmit}>
        <input placeholder="Full Name" value={name}
          onChange={e => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password (min 6 characters)" value={password}
          onChange={e => setPassword(e.target.value)} required minLength={6} />

        {error && <p className="error-text">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <p className="switch-auth">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}

export default Signup;
