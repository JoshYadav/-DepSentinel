from google import genai
import os
import json
import re
import time
from dotenv import load_dotenv

load_dotenv()

# Models to try in order — each has its own independent quota pool.
# If one is exhausted, the next one likely still has quota.
MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
]

MAX_RETRIES = 2
RETRY_DELAY_SECONDS = 4  # initial backoff


def _build_prompt(package_name, version, diff_text, detected_patterns, osv_vulns, typosquatting):
    diff_summary = diff_text if diff_text else (
        f"No code diff available. Analyzing package: {package_name} version {version} "
        f"based on metadata and vulnerability history."
    )
    patterns_summary = str(detected_patterns) if detected_patterns else "No suspicious patterns detected by static analysis."
    osv_summary = str(osv_vulns) if osv_vulns else "No known CVEs found in OSV database."
    typo_summary = str(typosquatting) if typosquatting else "No typosquatting detected."

    return f"""You are a senior cybersecurity analyst specializing in software supply chain security.

Package being analyzed: {package_name} version {version}

DIFF SUMMARY:
{diff_summary}

STATIC ANALYSIS PATTERNS:
{patterns_summary}

KNOWN CVEs FROM OSV DATABASE:
{osv_summary}

TYPOSQUATTING CHECK:
{typo_summary}

Respond with ONLY a raw JSON object. No markdown. No backticks. No explanation. Just the JSON:
{{"risk_level": "LOW or MEDIUM or HIGH", "behavioral_intent": "one sentence describing what this package does or what threat it poses", "specific_concerns": ["concern 1", "concern 2"], "attack_type": "Clean or Supply Chain Injection or Typosquatting or Known CVE or Suspicious", "recommendation": "ALLOW or BLOCK", "soc_action": "one clear sentence for a SOC analyst", "confidence": "HIGH or MEDIUM or LOW"}}"""


def _parse_response(raw):
    """Try multiple strategies to extract JSON from the model response."""
    raw = raw.strip()

    # Strip markdown code fences
    raw = re.sub(r'^```json\s*', '', raw)
    raw = re.sub(r'^```\s*', '', raw)
    raw = re.sub(r'\s*```$', '', raw)
    raw = raw.strip()

    # Direct parse
    try:
        return json.loads(raw)
    except Exception:
        pass

    # Extract first JSON object
    match = re.search(r'\{.*\}', raw, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except Exception:
            pass

    raise ValueError(f"Could not parse Gemini response: {raw[:300]}")


def analyze_with_ai(package_name="unknown", version="unknown", diff_text=None,
                    detected_patterns=None, osv_vulns=None, typosquatting=None):
    """Run Gemini AI analysis with multi-model fallback and retry."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("[AI ANALYZER ERROR] GEMINI_API_KEY not found in .env")
        return _fallback("GEMINI_API_KEY not found in .env")

    client = genai.Client(api_key=api_key)
    prompt = _build_prompt(package_name, version, diff_text,
                           detected_patterns, osv_vulns, typosquatting)

    last_error = None

    for model in MODELS:
        for attempt in range(MAX_RETRIES):
            try:
                print(f"[AI ANALYZER] Trying {model} (attempt {attempt + 1}/{MAX_RETRIES})...")
                response = client.models.generate_content(
                    model=model,
                    contents=prompt,
                )
                raw = response.text
                if not raw:
                    raise ValueError("Empty response from Gemini")

                result = _parse_response(raw)
                print(f"[AI ANALYZER] Success with {model}")
                return result

            except Exception as e:
                last_error = e
                err_str = str(e)
                print(f"[AI ANALYZER] {model} attempt {attempt + 1} failed: {err_str[:150]}")

                is_quota = "429" in err_str or "RESOURCE_EXHAUSTED" in err_str or "quota" in err_str.lower()
                is_not_found = "404" in err_str or "not found" in err_str.lower()
                is_key_invalid = "403" in err_str or "PERMISSION_DENIED" in err_str or "leaked" in err_str.lower()

                if is_key_invalid:
                    # API key is invalid/leaked — no model will work
                    print(f"[AI ANALYZER] API key is invalid or leaked. Generate a new key at https://aistudio.google.com/apikey")
                    return _fallback("API key is invalid or leaked — generate a new key at https://aistudio.google.com/apikey")

                if is_not_found:
                    # Model doesn't exist, skip to next model immediately
                    print(f"[AI ANALYZER] Model {model} not available, trying next...")
                    break

                if is_quota:
                    # Quota exhausted for this model — try next model
                    print(f"[AI ANALYZER] Quota exhausted for {model}, trying next model...")
                    break

                # Transient error — retry with backoff
                if attempt < MAX_RETRIES - 1:
                    delay = RETRY_DELAY_SECONDS * (attempt + 1)
                    print(f"[AI ANALYZER] Retrying in {delay}s...")
                    time.sleep(delay)

    # All models exhausted
    print(f"[AI ANALYZER ERROR] All models failed. Last error: {last_error}")
    return _fallback(str(last_error) if last_error else "All Gemini models failed")


def _fallback(error_msg):
    """Return a safe fallback result when AI analysis is unavailable."""
    return {
        "risk_level": "LOW",
        "behavioral_intent": f"AI analysis failed: {error_msg}",
        "specific_concerns": [],
        "attack_type": "Unknown",
        "recommendation": "ALLOW",
        "soc_action": "Review static analysis results manually",
        "confidence": "LOW"
    }


# TEST - run this file directly to verify API works
if __name__ == "__main__":
    result = analyze_with_ai(
        package_name="requests",
        version="2.28.0"
    )
    print("TEST RESULT:", json.dumps(result, indent=2))
