from utils.grammar_corrector import correct_text


def generate_ats_summary(resume_data, job_description):
    skills = resume_data.get("skills", [])
    top_skills = ", ".join(skills[:5]) if skills else "relevant technical and professional skills"

    experience = resume_data.get("experience", [])
    role_titles = [e.get("title") for e in experience if e.get("title")]
    role_text = role_titles[0] if role_titles else None

    objective = resume_data.get("objective", "").strip()
    if objective:
        objective = correct_text(objective)

    # Build the summary as clean, connected sentences instead of
    # concatenating raw fragments together.
    sentence_one = f"Results-driven professional with hands-on experience in {top_skills}."

    if role_text:
        sentence_two = (
            f"Proven track record as a {role_text}, with strong alignment to the "
            f"requirements outlined in this job description."
        )
    else:
        sentence_two = (
            "Strong alignment with the requirements outlined in this job description."
        )

    summary_parts = [sentence_one, sentence_two]

    if objective:
        # Make sure the objective reads as its own clean sentence, not a fragment
        if not objective.endswith((".", "!", "?")):
            objective += "."
        summary_parts.append(objective)
    else:
        summary_parts.append(
            "Adept at applying technical and analytical skills to drive measurable business outcomes."
        )

    return " ".join(summary_parts)
