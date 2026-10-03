import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

function MyResumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/resumes");
      setResumes(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this resume?")) return;
    try {
      await api.delete(`/api/resumes/${id}`);
      setResumes(resumes.filter(r => r.id !== id));
    } catch (err) {
      alert("Failed to delete resume.");
    }
  };

  const handleOpen = (id) => {
    navigate(`/?resumeId=${id}`);
  };

  const getScoreClass = (score) => {
    if (score >= 70) return "score-good";
    if (score >= 40) return "score-mid";
    return "score-low";
  };

  return (
    <div className="container">
      <h1>My Resumes</h1>
      <p className="subtitle">All your saved resumes in one place</p>

      {loading && <p>Loading...</p>}

      {!loading && resumes.length === 0 && (
        <p className="empty-state">No saved resumes yet. Build one and save it!</p>
      )}

      <div className="resume-list">
        {resumes.map((r) => (
          <div key={r.id} className="resume-card">
            <div className="resume-card-info">
              <h3>{r.title}</h3>
              <p className="resume-date">
                Last updated: {new Date(r.updated_at).toLocaleDateString()}
              </p>
            </div>
            {r.match_score != null && (
              <div className={`score-circle-sm ${getScoreClass(r.match_score)}`}>
                {r.match_score}%
              </div>
            )}
            <div className="resume-card-actions">
              <button onClick={() => handleOpen(r.id)}>Open</button>
              <button className="remove-btn" onClick={() => handleDelete(r.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyResumes;
