import google.generativeai as genai
import os
import json
import re
from dotenv import load_dotenv

load_dotenv()

def analyze_with_ai(package_name="unknown", version="unknown", diff_text=None, detected_patterns=None, osv_vulns=None, typosquatting=None):
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in .env")
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        diff_summary = diff_text if diff_text else f"No code diff available. Analyzing package: {package_name} version {version} based on metadata and vulnerability history."
        patterns_summary = str(detected_patterns) if detected_patterns else "No suspicious patterns detected by static analysis."
        osv_summary = str(osv_vulns) if osv_vulns else "No known CVEs found in OSV database."
        typo_summary = str(typosquatting) if typosquatting else "No typosquatting detected."
        
        prompt = f"""You are a senior cybersecurity analyst specializing in software supply chain security.

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

        response = model.generate_content(prompt)
        raw = response.text.strip()
        
        # Clean any markdown wrapping
        raw = re.sub(r'^```json\s*', '', raw)
        raw = re.sub(r'^```\s*', '', raw)
        raw = re.sub(r'\s*```$', '', raw)
        raw = raw.strip()
        
        # Try direct parse
        try:
            return json.loads(raw)
        except:
            pass
        
        # Try extracting JSON object from text
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except:
                pass
        
        raise ValueError(f"Could not parse Gemini response: {raw[:200]}")
        
    except Exception as e:
        print(f"[AI ANALYZER ERROR] {str(e)}")
        return {
            "risk_level": "LOW",
            "behavioral_intent": f"AI analysis failed: {str(e)}",
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
