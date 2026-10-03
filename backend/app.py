import os
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

from models import db
from auth import auth_bp, bcrypt
from resumes import resumes_bp
from utils.matcher import calculate_match_score
from utils.ai_generator import generate_ats_summary
from utils.pdf_generator import generate_resume_pdf
from utils.grammar_corrector import correct_text

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///resume_builder.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-secret-change-this")

db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)

app.register_blueprint(auth_bp)
app.register_blueprint(resumes_bp)

with app.app_context():
    db.create_all()

@app.route("/")
def home():
    return {"message": "AI Resume Builder Backend Running"}

@app.route("/api/analyze", methods=["POST"])
def analyze():
    data = request.json
    resume_data = data.get("resume_data")
    job_description = data.get("job_description")

    cert_text = " ".join([
        f'{c.get("name","")} {c.get("issuer","")}' for c in resume_data.get("certifications", [])
    ])
    project_text = " ".join([
        f'{p.get("title","")} {p.get("tech_stack","")} {p.get("description","")}'
        for p in resume_data.get("projects", [])
    ])

    resume_text = " ".join([
        resume_data.get("objective", ""),
        " ".join(resume_data.get("skills", [])),
        " ".join([e.get("description", "") for e in resume_data.get("experience", [])]),
        project_text,
        cert_text
    ])

    match_result = calculate_match_score(resume_text, job_description)
    ai_summary = generate_ats_summary(resume_data, job_description)

    return jsonify({
        "ai_summary": ai_summary,
        "match_score": match_result["match_score"],
        "missing_keywords": match_result["missing_keywords"]
    })

@app.route("/api/generate-pdf", methods=["POST"])
def generate_pdf():
    data = request.json
    resume_data = data.get("resume_data")
    summary = data.get("summary")

    corrected_data = dict(resume_data)

    if corrected_data.get("objective"):
        corrected_data["objective"] = correct_text(corrected_data["objective"])

    corrected_experience = []
    for exp in corrected_data.get("experience", []):
        exp_copy = dict(exp)
        if exp_copy.get("description"):
            exp_copy["description"] = correct_text(exp_copy["description"])
        corrected_experience.append(exp_copy)
    corrected_data["experience"] = corrected_experience

    corrected_projects = []
    for proj in corrected_data.get("projects", []):
        proj_copy = dict(proj)
        if proj_copy.get("description"):
            proj_copy["description"] = correct_text(proj_copy["description"])
        corrected_projects.append(proj_copy)
    corrected_data["projects"] = corrected_projects

    pdf_buffer = generate_resume_pdf(corrected_data, summary)
    return send_file(pdf_buffer, mimetype="application/pdf", as_attachment=True, download_name="resume.pdf")

@app.route("/api/correct-grammar", methods=["POST"])
def correct_grammar():
    data = request.json
    text = data.get("text", "")
    corrected = correct_text(text)
    return jsonify({"corrected": corrected})

if __name__ == "__main__":
    app.run(debug=True)
