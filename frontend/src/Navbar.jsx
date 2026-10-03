import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="navbar">
      <Link to="/" className="navbar-brand">AI Resume Builder</Link>
      <div className="navbar-links">
        {user ? (
          <>
            <Link to="/my-resumes">My Resumes</Link>
            <span className="navbar-user">Hi, {user.name.split(" ")[0]}</span>
            <button className="navbar-logout" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default Navbar;
