import requests

LANGUAGETOOL_URL = "https://api.languagetool.org/v2/check"

def correct_text(text):
    if not text or not text.strip():
        return text

    try:
        response = requests.post(
            LANGUAGETOOL_URL,
            data={"text": text, "language": "en-US"},
            timeout=10
        )
        response.raise_for_status()
        result = response.json()

        matches = result.get("matches", [])
        # Apply corrections from the end of the string backwards
        # so earlier offsets don't shift as we replace text
        matches.sort(key=lambda m: m["offset"], reverse=True)

        corrected = text
        for match in matches:
            replacements = match.get("replacements", [])
            if replacements:
                best = replacements[0]["value"]
                start = match["offset"]
                end = start + match["length"]
                corrected = corrected[:start] + best + corrected[end:]

        return corrected

    except requests.exceptions.RequestException:
        # If the grammar service is unreachable, just return original text
        return text
