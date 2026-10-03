import { useState, useEffect } from "react";
import { Routes, Route, useSearchParams } from "react-router-dom";
import ResumeForm from "./ResumeForm";
import api from "./api";
import "./App.css";
import Navbar from "./Navbar";
import Login from "./Login";
import Signup from "./Signup";
import MyResumes from "./MyResumes";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "./AuthContext";

function ResumeBuilder() {
  const [result, setResult] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [jobDescription, setJobDescription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [initialData, setInitialData] = useState(null);

  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get("resumeId");

  useEffect(() => {
    if (resumeId && user) {
      loadSavedResume(resumeId);
    }
  }, [resumeId, user]);

  const loadSavedResume = async (id) => {
    try {
      const res = await api.get(`/api/resumes/${id}`);
      setInitialData(res.data.resume_data);
      setJobDescription(res.data.job_description);
      setResumeData(res.data.resume_data);
      setResult({
        ai_summary: res.data.ai_summary,
        match_score: res.data.match_score,
        missing_keywords: []
      });
    } catch (err) {
      console.error("Failed to load resume", err);
    }
  };

  const handleAnalyze = async (resume_data, job_description) => {
    setLoading(true);
    setResult(null);
    setPdfUrl(null);
    setSaveMessage("");
    setResumeData(resume_data);
    setJobDescription(job_description);
    try {
      const res = await api.post("/api/analyze", { resume_data, job_description });
      setResult(res.data);
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  const handlePreview = async () => {
    setPdfLoading(true);
    try {
      const res = await api.post("/api/generate-pdf", {
        resume_data: resumeData,
        summary: result.ai_summary
      }, { responseType: "blob" });

      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      setPdfUrl(url);
    } catch (err) {
      alert("Error generating PDF: " + err.message);
    }
    setPdfLoading(false);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.setAttribute("download", "resume.pdf");
    document.body.appendChild(link);
    link.click();
  };

  const handleSaveResume = async () => {
    if (!user) {
      alert("Please log in to save your resume.");
      return;
    }
    setSaving(true);
    setSaveMessage("");
    try {
      await api.post("/api/resumes", {
        title: resumeData?.name ? `${resumeData.name}'s Resume` : "Untitled Resume",
        resume_data: resumeData,
        job_description: jobDescription,
        ai_summary: result.ai_summary,
        match_score: result.match_score
      });
      setSaveMessage("Resume saved successfully!");
    } catch (err) {
      setSaveMessage("Failed to save resume.");
    }
    setSaving(false);
  };

  const getScoreClass = (score) => {
    if (score >= 70) return "score-good";
    if (score >= 40) return "score-mid";
    return "score-low";
  };

  return (
    <div className="container">
      <h1>AI Resume Builder</h1>
      <p className="subtitle">Create ATS-friendly resumes tailored to any job</p>

      <ResumeForm onSubmit={handleAnalyze} initialData={initialData} initialJD={jobDescription} />

      {loading && (
        <div className="loading-wrap">
          <div className="spinner"></div>
          <span>Analyzing your resume against the job description...</span>
        </div>
      )}

      {result && !loading && (
        <div className="result-box">
          <div className="score-row">
            <div className={`score-circle ${getScoreClass(result.match_score)}`}>
              {result.match_score}%
            </div>
            <div className="score-label">
              {result.match_score >= 70
                ? "Strong match with this job description"
                : result.match_score >= 40
                ? "Moderate match — consider adding missing keywords"
                : "Low match — resume needs more relevant keywords"}
            </div>
          </div>

          <h3>AI-Generated Summary</h3>
          <p>{result.ai_summary}</p>

          {result.missing_keywords && result.missing_keywords.length > 0 && (
            <>
              <h3>Missing Keywords</h3>
              <div className="keywords">
                {result.missing_keywords.map((kw, i) => (
                  <span className="keyword-chip" key={i}>{kw}</span>
                ))}
              </div>
            </>
          )}

          <div className="action-row">
            <button onClick={handleSaveResume} disabled={saving} className="secondary-btn">
              {saving ? "Saving..." : "Save Resume"}
            </button>
            {!pdfUrl && (
              <button onClick={handlePreview} disabled={pdfLoading}>
                {pdfLoading ? "Generating Preview..." : "Preview Resume PDF"}
              </button>
            )}
          </div>

          {saveMessage && <p className="save-message">{saveMessage}</p>}

          {pdfUrl && (
            <>
              <iframe src={pdfUrl} className="pdf-preview" title="Resume Preview"></iframe>
              <div className="action-row">
                <button className="secondary-btn" onClick={handlePreview}>Regenerate</button>
                <button onClick={handleDownload}>Download PDF</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<ResumeBuilder />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/my-resumes"
          element={
            <ProtectedRoute>
              <MyResumes />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
