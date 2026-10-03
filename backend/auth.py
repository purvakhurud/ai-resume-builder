from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token
from models import db, User
import re

auth_bp = Blueprint("auth", __name__)
bcrypt = Bcrypt()

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

@auth_bp.route("/api/signup", methods=["POST"])
def signup():
    data = request.json
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400

    if not EMAIL_REGEX.match(email):
        return jsonify({"error": "Invalid email format"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with this email already exists"}), 409

    password_hash = bcrypt.generate_password_hash(password).decode("utf-8")
    user = User(name=name, email=email, password_hash=password_hash)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({
        "token": token,
        "user": {"id": user.id, "name": user.name, "email": user.email}
    }), 201

@auth_bp.route("/api/login", methods=["POST"])
def login():
    data = request.json
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({
        "token": token,
        "user": {"id": user.id, "name": user.name, "email": user.email}
    }), 200
