# 🚀 AI Resume Builder

### Build ATS-friendly resumes, tailored to any job, in minutes.

A full-stack web app that takes your resume details and a job description, then generates a tailored summary, scores how well you match the role, highlights missing keywords, and produces a polished, downloadable PDF resume — all for free.

## ✨ Features

🔐 **Authentication** — Sign up & log in with secure, JWT-based sessions
📝 **Smart Resume Form** — Add multiple projects, jobs, degrees, and certifications
🎯 **ATS Match Score** — See exactly how well your resume fits a job description
🔍 **Missing Keywords** — Know which real technical skills to add before applying
✍️ **Auto Grammar Fix** — Typos and awkward phrasing get cleaned up automatically
📄 **PDF Preview & Download** — Review your resume before saving it
💾 **Save & Revisit** — Store multiple resume versions in "My Resumes"
🌙 **Dark, Responsive UI** — Looks great on desktop and mobile

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React (Vite), React Router, Axios |
| **Backend** | Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-Bcrypt |
| **Database** | SQLite |
| **Matching Engine** | scikit-learn (TF-IDF + Cosine Similarity) |
| **PDF Generation** | ReportLab |
| **Grammar Correction** | LanguageTool API |

---

## ⚡ Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/purvakhurud/ai-resume-builder.git
cd ai-resume-builder
```

### 2. Set up the backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux

pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:

```
JWT_SECRET_KEY=your-own-random-secret-string
```

Run the server:

```bash
python app.py
```

✅ Backend live at **http://127.0.0.1:5000**

### 3. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend live at **http://localhost:5173**

---

## 📖 How to Use

1. **Sign up** for an account
2. Fill in your resume — skills, projects, experience, education, certifications
3. Paste a **job description**
4. Hit **Analyze & Generate Resume** → get your match score + AI summary
5. Click **Preview Resume PDF** → review it
6. **Download** it, or **Save** it to revisit later from *My Resumes*

---

## 📁 Project Structure

```
AI-Resume-Builder/
├── backend/
│   ├── app.py              → Main Flask app & routes
│   ├── models.py           → Database models
│   ├── auth.py              → Signup / Login
│   ├── resumes.py          → Save / load resumes
│   └── utils/
│       ├── matcher.py             → Match scoring & keyword detection
│       ├── ai_generator.py        → Resume summary generator
│       ├── pdf_generator.py       → PDF builder
│       └── grammar_corrector.py   → Grammar fixing
│
└── frontend/
    └── src/
        ├── App.jsx           → Main app & routing
        ├── ResumeForm.jsx    → Resume input form
        ├── MyResumes.jsx     → Saved resumes page
        ├── Login.jsx / Signup.jsx
        └── AuthContext.jsx   → Auth state management
```

---


## 🔮 Roadmap

- [ ] Resume file upload with auto-parsing
- [ ] JD upload support (PDF/DOCX)
- [ ] Multiple PDF resume templates
- [ ] Live deployment (Render + Vercel)
- [ ] Automated test suite

---

## 📜 License

MIT — free to use, modify, and build on.

---

<p align="center">Built with ☕ and a lot of debugging</p>