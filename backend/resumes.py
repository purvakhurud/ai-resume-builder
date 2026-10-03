from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Resume

resumes_bp = Blueprint("resumes", __name__)

@resumes_bp.route("/api/resumes", methods=["POST"])
@jwt_required()
def save_resume():
    user_id = get_jwt_identity()
    data = request.json

    resume = Resume(
        user_id=user_id,
        title=data.get("title") or "Untitled Resume",
        resume_data=data.get("resume_data"),
        job_description=data.get("job_description"),
        ai_summary=data.get("ai_summary"),
        match_score=data.get("match_score")
    )
    db.session.add(resume)
    db.session.commit()

    return jsonify({"id": resume.id, "message": "Resume saved successfully"}), 201

@resumes_bp.route("/api/resumes", methods=["GET"])
@jwt_required()
def list_resumes():
    user_id = get_jwt_identity()
    resumes = Resume.query.filter_by(user_id=user_id).order_by(Resume.updated_at.desc()).all()

    return jsonify([{
        "id": r.id,
        "title": r.title,
        "match_score": r.match_score,
        "created_at": r.created_at.isoformat(),
        "updated_at": r.updated_at.isoformat()
    } for r in resumes]), 200

@resumes_bp.route("/api/resumes/<int:resume_id>", methods=["GET"])
@jwt_required()
def get_resume(resume_id):
    user_id = get_jwt_identity()
    resume = Resume.query.filter_by(id=resume_id, user_id=user_id).first()

    if not resume:
        return jsonify({"error": "Resume not found"}), 404

    return jsonify({
        "id": resume.id,
        "title": resume.title,
        "resume_data": resume.resume_data,
        "job_description": resume.job_description,
        "ai_summary": resume.ai_summary,
        "match_score": resume.match_score
    }), 200

@resumes_bp.route("/api/resumes/<int:resume_id>", methods=["DELETE"])
@jwt_required()
def delete_resume(resume_id):
    user_id = get_jwt_identity()
    resume = Resume.query.filter_by(id=resume_id, user_id=user_id).first()

    if not resume:
        return jsonify({"error": "Resume not found"}), 404

    db.session.delete(resume)
    db.session.commit()
    return jsonify({"message": "Resume deleted"}), 200
