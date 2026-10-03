from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
import io

ACCENT_HEX = "#4361ee"

def generate_resume_pdf(resume_data, summary):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        topMargin=0.7*inch, bottomMargin=0.7*inch,
        leftMargin=0.75*inch, rightMargin=0.75*inch
    )

    primary = colors.HexColor("#1a1a2e")
    accent = colors.HexColor(ACCENT_HEX)
    gray = colors.HexColor("#555555")

    # NOTE: leading (line height) is explicitly set on every style below.
    # Without it, ReportLab defaults to a value too small for larger fonts,
    # which causes paragraphs to visually overlap each other.
    name_style = ParagraphStyle('Name', fontName='Helvetica-Bold', fontSize=24, leading=28,
                                 textColor=primary, spaceAfter=6, alignment=TA_LEFT)
    contact_style = ParagraphStyle('Contact', fontName='Helvetica', fontSize=9.5, leading=14,
                                    textColor=gray, spaceAfter=10)
    section_style = ParagraphStyle('Section', fontName='Helvetica-Bold', fontSize=12, leading=15,
                                    textColor=accent, spaceBefore=16, spaceAfter=6)
    body_style = ParagraphStyle('Body', fontName='Helvetica', fontSize=10.2, leading=15,
                                 textColor=colors.HexColor("#2a2a2a"), spaceAfter=4)
    job_title_style = ParagraphStyle('JobTitle', fontName='Helvetica-Bold', fontSize=10.5, leading=13,
                                      textColor=primary, spaceBefore=8, spaceAfter=1)
    job_meta_style = ParagraphStyle('JobMeta', fontName='Helvetica-Oblique', fontSize=9.5, leading=12,
                                     textColor=gray, spaceAfter=4)

    elements = []

    elements.append(Paragraph(resume_data.get("name", "").upper(), name_style))

    contact_parts = []
    email = resume_data.get("email", "").strip()
    if email:
        contact_parts.append(f'<link href="mailto:{email}" color="{ACCENT_HEX}">{email}</link>')
    phone = resume_data.get("phone", "").strip()
    if phone:
        contact_parts.append(phone)
    linkedin = resume_data.get("linkedin", "").strip()
    if linkedin:
        url = linkedin if linkedin.startswith("http") else f"https://{linkedin}"
        contact_parts.append(f'<link href="{url}" color="{ACCENT_HEX}"><u>LinkedIn</u></link>')
    github = resume_data.get("github", "").strip()
    if github:
        url = github if github.startswith("http") else f"https://{github}"
        contact_parts.append(f'<link href="{url}" color="{ACCENT_HEX}"><u>GitHub</u></link>')

    elements.append(Paragraph("  |  ".join(contact_parts), contact_style))
    elements.append(Spacer(1, 4))
    elements.append(HRFlowable(width="100%", thickness=1.2, color=accent, spaceAfter=8))

    elements.append(Paragraph("PROFESSIONAL SUMMARY", section_style))
    elements.append(Paragraph(summary, body_style))

    if resume_data.get("objective"):
        elements.append(Paragraph("CAREER OBJECTIVE", section_style))
        elements.append(Paragraph(resume_data.get("objective"), body_style))

    if resume_data.get("skills"):
        elements.append(Paragraph("SKILLS", section_style))
        elements.append(Paragraph(" &nbsp;\u2022&nbsp; ".join(resume_data.get("skills", [])), body_style))

    projects = [p for p in resume_data.get("projects", []) if p.get("title")]
    if projects:
        elements.append(Paragraph("PROJECTS", section_style))
        for proj in projects:
            title_line = proj.get("title", "")
            if proj.get("link"):
                url = proj["link"] if proj["link"].startswith("http") else f"https://{proj['link']}"
                title_line += f'  <link href="{url}" color="{ACCENT_HEX}"><u>(View Project)</u></link>'
            elements.append(Paragraph(title_line, job_title_style))
            if proj.get("tech_stack"):
                elements.append(Paragraph(proj.get("tech_stack", ""), job_meta_style))
            if proj.get("description"):
                elements.append(Paragraph(proj.get("description", ""), body_style))
            elements.append(Spacer(1, 6))

    experience = [e for e in resume_data.get("experience", []) if e.get("title") or e.get("company")]
    if experience:
        elements.append(Paragraph("EXPERIENCE", section_style))
        for exp in experience:
            elements.append(Paragraph(f"{exp.get('title','')} \u2014 {exp.get('company','')}", job_title_style))
            if exp.get("duration"):
                elements.append(Paragraph(exp.get("duration", ""), job_meta_style))
            if exp.get("description"):
                elements.append(Paragraph(exp.get("description", ""), body_style))
            elements.append(Spacer(1, 6))

    education = [e for e in resume_data.get("education", []) if e.get("degree") or e.get("institution")]
    if education:
        elements.append(Paragraph("EDUCATION", section_style))
        for edu in education:
            elements.append(Paragraph(f"{edu.get('degree','')} \u2014 {edu.get('institution','')}", job_title_style))
            if edu.get("year"):
                elements.append(Paragraph(edu.get("year", ""), job_meta_style))

    certifications = [c for c in resume_data.get("certifications", []) if c.get("name") or c.get("issuer")]
    if certifications:
        elements.append(Paragraph("CERTIFICATIONS", section_style))
        for cert in certifications:
            name = cert.get("name", "")
            issuer = cert.get("issuer", "")
            line = f"{name} \u2014 {issuer}" if issuer else name
            elements.append(Paragraph(line, body_style))

    doc.build(elements)
    buffer.seek(0)
    return buffer
