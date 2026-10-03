from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
 
# Curated list of real technical skills / tools / languages / platforms.
# Only words or phrases found in this list can ever show up as a "missing keyword".
# This avoids generic nouns like "designer", "engineering", "build" being flagged.
SKILLS_DB = [
    # Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "c", "php", "ruby", "go", "golang",
    "rust", "kotlin", "swift", "scala", "r", "matlab", "perl", "dart", "sql", "html", "css",
    # Frontend
    "react", "reactjs", "angular", "vue", "vuejs", "next.js", "nextjs", "redux", "tailwind",
    "bootstrap", "jquery", "webpack", "sass", "figma",
    # Backend / Frameworks
    "flask", "django", "fastapi", "node.js", "nodejs", "express", "spring", "spring boot",
    "asp.net", ".net", "laravel", "rails",
    # Databases
    "mysql", "postgresql", "postgres", "mongodb", "sqlite", "redis", "oracle", "dynamodb",
    "cassandra", "firebase", "elasticsearch", "nosql",
    # Cloud & DevOps
    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "terraform", "jenkins",
    "ansible", "ci/cd", "cicd", "github actions", "gitlab", "cloudformation", "lambda",
    "ec2", "s3", "devops",
    # Data / ML / AI
    "machine learning", "deep learning", "nlp", "pandas", "numpy", "scikit-learn", "sklearn",
    "tensorflow", "pytorch", "keras", "opencv", "power bi", "tableau", "excel", "spark",
    "hadoop", "data analysis", "data science", "etl", "airflow", "matplotlib", "seaborn",
    # Tools
    "git", "github", "bitbucket", "jira", "confluence", "postman", "swagger", "linux",
    "unix", "bash", "shell scripting", "vscode", "uipath", "automation anywhere", "blue prism",
    "selenium", "cypress", "junit", "pytest",
    # Concepts
    "rest api", "restful", "api", "graphql", "microservices", "agile", "scrum", "oop",
    "object oriented programming", "data structures", "algorithms", "unit testing",
    "system design", "cybersecurity", "blockchain", "iot",
    # Mobile
    "android", "ios", "flutter", "react native", "swiftui",
]
 
# Sort longest first so multi-word skills like "power bi" match before single words
SKILLS_DB_SORTED = sorted(set(SKILLS_DB), key=len, reverse=True)
 
def clean_text(text):
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s\+\#\./]', ' ', text)
    return text
 
def find_skills(text):
    """Return the set of known skills (from SKILLS_DB) that appear in the given text."""
    text_clean = " " + clean_text(text) + " "
    found = set()
    for skill in SKILLS_DB_SORTED:
        skill_clean = skill.lower()
        pattern = r'(?<![a-z0-9])' + re.escape(skill_clean) + r'(?![a-z0-9])'
        if re.search(pattern, text_clean):
            found.add(skill_clean)
    return found
 
def calculate_match_score(resume_text, job_description):
    resume_clean = clean_text(resume_text)
    jd_clean = clean_text(job_description)
 
    if len(resume_clean.split()) < 2 or len(jd_clean.split()) < 2:
        return {"match_score": 0, "missing_keywords": []}
 
    try:
        vectorizer = TfidfVectorizer(stop_words='english')
        vectors = vectorizer.fit_transform([resume_clean, jd_clean])
        score = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
        match_percentage = round(score * 100, 2)
 
        jd_skills = find_skills(job_description)
        resume_skills = find_skills(resume_text)
 
        missing = sorted(jd_skills - resume_skills)
 
        return {"match_score": match_percentage, "missing_keywords": missing[:15]}
    except ValueError:
        return {"match_score": 0, "missing_keywords": []}