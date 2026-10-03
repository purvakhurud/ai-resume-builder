import { useState, useEffect } from "react";
import api from "./api";

const emptyForm = {
  name: "", email: "", phone: "", linkedin: "", github: "",
  objective: "",
  skills: "",
  projects: [{ title: "", tech_stack: "", description: "", link: "" }],
  experience: [{ title: "", company: "", duration: "", description: "" }],
  education: [{ degree: "", institution: "", year: "" }],
  certifications: [{ name: "", issuer: "" }]
};

function ResumeForm({ onSubmit, initialData, initialJD }) {
  const [formData, setFormData] = useState(emptyForm);
  const [jobDescription, setJobDescription] = useState("");
  const [fixingField, setFixingField] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...emptyForm,
        ...initialData,
        skills: Array.isArray(initialData.skills) ? initialData.skills.join(", ") : (initialData.skills || ""),
        projects: initialData.projects?.length ? initialData.projects : emptyForm.projects,
        experience: initialData.experience?.length ? initialData.experience : emptyForm.experience,
        education: initialData.education?.length ? initialData.education : emptyForm.education,
        certifications: initialData.certifications?.length ? initialData.certifications : emptyForm.certifications
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (initialJD) setJobDescription(initialJD);
  }, [initialJD]);

  const updateField = (field, value) => setFormData({ ...formData, [field]: value });

  const updateArrayField = (arrName, index, field, value) => {
    const updated = [...formData[arrName]];
    updated[index][field] = value;
    setFormData({ ...formData, [arrName]: updated });
  };

  const addEntry = (arrName, emptyObj) => {
    setFormData({ ...formData, [arrName]: [...formData[arrName], emptyObj] });
  };

  const removeEntry = (arrName, index) => {
    const updated = formData[arrName].filter((_, i) => i !== index);
    setFormData({ ...formData, [arrName]: updated });
  };

  const fixGrammarField = async (field) => {
    setFixingField(field);
    try {
      const res = await api.post("/api/correct-grammar", { text: formData[field] });
      updateField(field, res.data.corrected);
    } catch (err) {
      alert("Grammar check failed. Try again.");
    }
    setFixingField(null);
  };

  const fixGrammarArrayField = async (arrName, index, field) => {
    const key = `${arrName}-${index}-${field}`;
    setFixingField(key);
    try {
      const res = await api.post("/api/correct-grammar", { text: formData[arrName][index][field] });
      updateArrayField(arrName, index, field, res.data.corrected);
    } catch (err) {
      alert("Grammar check failed. Try again.");
    }
    setFixingField(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const resume_data = {
      ...formData,
      skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean),
      projects: formData.projects.filter(p => p.title),
      certifications: formData.certifications.filter(c => c.name || c.issuer)
    };
    onSubmit(resume_data, jobDescription);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Your Details</h2>
      <input placeholder="Full Name" value={formData.name}
        onChange={e => updateField("name", e.target.value)} />
      <input placeholder="Email" value={formData.email}
        onChange={e => updateField("email", e.target.value)} />
      <input placeholder="Phone" value={formData.phone}
        onChange={e => updateField("phone", e.target.value)} />
      <input placeholder="LinkedIn URL" value={formData.linkedin}
        onChange={e => updateField("linkedin", e.target.value)} />
      <input placeholder="GitHub URL" value={formData.github}
        onChange={e => updateField("github", e.target.value)} />

      <h2>Career Objective</h2>
      <textarea placeholder="Briefly describe your career goal" value={formData.objective}
        onChange={e => updateField("objective", e.target.value)} />
      <button type="button" className="fix-btn" onClick={() => fixGrammarField("objective")}
        disabled={fixingField === "objective" || !formData.objective}>
        {fixingField === "objective" ? "Fixing..." : "✨ Fix Grammar"}
      </button>

      <h2>Skills</h2>
      <textarea placeholder="Skills (comma separated) e.g. Python, React, SQL" value={formData.skills}
        onChange={e => updateField("skills", e.target.value)} />

      <h2>Projects</h2>
      {formData.projects.map((proj, i) => (
        <div key={i} className="entry-block">
          <input placeholder="Project Title" value={proj.title}
            onChange={e => updateArrayField("projects", i, "title", e.target.value)} />
          <input placeholder="Tech Stack (e.g. React, Flask, PostgreSQL)" value={proj.tech_stack}
            onChange={e => updateArrayField("projects", i, "tech_stack", e.target.value)} />
          <input placeholder="Project Link (GitHub / Live Demo, optional)" value={proj.link}
            onChange={e => updateArrayField("projects", i, "link", e.target.value)} />
          <textarea placeholder="Description" value={proj.description}
            onChange={e => updateArrayField("projects", i, "description", e.target.value)} />
          <button type="button" className="fix-btn"
            onClick={() => fixGrammarArrayField("projects", i, "description")}
            disabled={fixingField === `projects-${i}-description` || !proj.description}>
            {fixingField === `projects-${i}-description` ? "Fixing..." : "✨ Fix Grammar"}
          </button>
          {formData.projects.length > 1 && (
            <button type="button" className="remove-btn" onClick={() => removeEntry("projects", i)}>Remove</button>
          )}
        </div>
      ))}
      <button type="button" className="add-btn"
        onClick={() => addEntry("projects", { title: "", tech_stack: "", description: "", link: "" })}>
        + Add Another Project
      </button>

      <h2>Experience / Internships</h2>
      {formData.experience.map((exp, i) => (
        <div key={i} className="entry-block">
          <input placeholder="Job Title / Internship Role" value={exp.title}
            onChange={e => updateArrayField("experience", i, "title", e.target.value)} />
          <input placeholder="Company" value={exp.company}
            onChange={e => updateArrayField("experience", i, "company", e.target.value)} />
          <input placeholder="Duration (e.g. 2021-2023)" value={exp.duration}
            onChange={e => updateArrayField("experience", i, "duration", e.target.value)} />
          <textarea placeholder="Description" value={exp.description}
            onChange={e => updateArrayField("experience", i, "description", e.target.value)} />
          <button type="button" className="fix-btn"
            onClick={() => fixGrammarArrayField("experience", i, "description")}
            disabled={fixingField === `experience-${i}-description` || !exp.description}>
            {fixingField === `experience-${i}-description` ? "Fixing..." : "✨ Fix Grammar"}
          </button>
          {formData.experience.length > 1 && (
            <button type="button" className="remove-btn" onClick={() => removeEntry("experience", i)}>Remove</button>
          )}
        </div>
      ))}
      <button type="button" className="add-btn"
        onClick={() => addEntry("experience", { title: "", company: "", duration: "", description: "" })}>
        + Add Another Experience
      </button>

      <h2>Education</h2>
      {formData.education.map((edu, i) => (
        <div key={i} className="entry-block">
          <input placeholder="Degree" value={edu.degree}
            onChange={e => updateArrayField("education", i, "degree", e.target.value)} />
          <input placeholder="Institution" value={edu.institution}
            onChange={e => updateArrayField("education", i, "institution", e.target.value)} />
          <input placeholder="Year" value={edu.year}
            onChange={e => updateArrayField("education", i, "year", e.target.value)} />
          {formData.education.length > 1 && (
            <button type="button" className="remove-btn" onClick={() => removeEntry("education", i)}>Remove</button>
          )}
        </div>
      ))}
      <button type="button" className="add-btn"
        onClick={() => addEntry("education", { degree: "", institution: "", year: "" })}>
        + Add Another Education
      </button>

      <h2>Certifications</h2>
      {formData.certifications.map((cert, i) => (
        <div key={i} className="entry-block">
          <input placeholder="Certificate Name (e.g. AWS Certified Developer)" value={cert.name}
            onChange={e => updateArrayField("certifications", i, "name", e.target.value)} />
          <input placeholder="Issued By (e.g. Amazon Web Services)" value={cert.issuer}
            onChange={e => updateArrayField("certifications", i, "issuer", e.target.value)} />
          {formData.certifications.length > 1 && (
            <button type="button" className="remove-btn" onClick={() => removeEntry("certifications", i)}>Remove</button>
          )}
        </div>
      ))}
      <button type="button" className="add-btn"
        onClick={() => addEntry("certifications", { name: "", issuer: "" })}>
        + Add Another Certificate
      </button>

      <h2>Job Description</h2>
      <textarea rows={8} placeholder="Paste the job description here" value={jobDescription}
        onChange={e => setJobDescription(e.target.value)} />

      <button type="submit">Analyze & Generate Resume</button>
    </form>
  );
}

export default ResumeForm;
