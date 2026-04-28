from typosquatting import load_top_packages
from parser import normalize_package_name

def _is_known_legitimate(package_name):
    """Check if package is in the top PyPI packages list (i.e. well-known and trusted)."""
    normalized = normalize_package_name(package_name)
    top = load_top_packages()
    return normalized in top

def _count_high_severity(items):
    """Count items with HIGH severity in a pattern category."""
    return sum(1 for item in items if isinstance(item, dict) and item.get("severity") == "HIGH")

def _count_medium_severity(items):
    """Count items with MEDIUM severity in a pattern category."""
    return sum(1 for item in items if isinstance(item, dict) and item.get("severity") == "MEDIUM")


def calculate_risk(pattern_results, osv_results, typosquatting_result, ai_result=None):
    score = 0
    reasons = []
    
    is_typosquat = typosquatting_result.get("is_suspicious", False)
    is_legitimate = not is_typosquat and _is_known_legitimate(typosquatting_result.get("closest_match", "") if is_typosquat else pattern_results.get("_package_name", ""))
    
    # For legitimate packages we check: is this package itself in the top list?
    # We'll pass the package name through via a helper. For now, check by absence of typosquat flag.
    # A package is "trusted" if it's not typosquatted AND it's in the top packages list.
    
    # --- OSV Signals ---
    # OSV vulnerabilities are always relevant regardless of package legitimacy
    osv_crit_count = 0
    osv_high_count = 0
    osv_medium_count = 0
    osv_low_count = 0
    
    for vuln in osv_results:
        severity = vuln.get("severity", "LOW")
        if severity == "CRITICAL":
            score += 40
            osv_crit_count += 1
            reasons.append(f"CRITICAL Vulnerability: {vuln.get('id')}")
        elif severity == "HIGH":
            score += 25
            osv_high_count += 1
            reasons.append(f"HIGH Vulnerability: {vuln.get('id')}")
        elif severity == "MEDIUM":
            score += 8
            osv_medium_count += 1
            reasons.append(f"MEDIUM Vulnerability: {vuln.get('id')}")
        elif severity == "LOW":
            score += 3
            osv_low_count += 1
            reasons.append(f"LOW Vulnerability: {vuln.get('id')}")
            
    # --- Typosquatting Signals ---
    if is_typosquat:
        conf = typosquatting_result.get("confidence", "LOW")
        if conf == "HIGH":
            score += 65
            reasons.append(f"HIGH confidence Typosquatting: resembles '{typosquatting_result.get('closest_match')}' — {typosquatting_result.get('suspicion_reason')}")
        elif conf == "MEDIUM":
            score += 25
            reasons.append(f"MEDIUM confidence Typosquatting: resembles '{typosquatting_result.get('closest_match')}' — {typosquatting_result.get('suspicion_reason')}")
            
    # --- Pattern Detection Signals ---
    # For well-known legitimate packages, pattern detection is heavily discounted
    # because packages like numpy/flask naturally use exec(), subprocess, os.environ etc.
    # Patterns only matter significantly for unknown or typosquatted packages.
    
    categories = pattern_results.get("categories", {})
    
    if is_typosquat:
        # Typosquatted packages: patterns are VERY suspicious — full weight
        if categories.get("Persistence") and _count_high_severity(categories["Persistence"]) > 0:
            score += 50
            reasons.append("CRITICAL: Persistence patterns in typosquatted package")
            
        if categories.get("Sensitive Data Access") and _count_high_severity(categories["Sensitive Data Access"]) > 0:
            score += 50
            reasons.append("CRITICAL: Sensitive data access in typosquatted package")
            
        if categories.get("Crypto Mining"):
            score += 50
            reasons.append("CRITICAL: Crypto mining patterns in typosquatted package")
            
        has_exec = _count_high_severity(categories.get("Code Execution", [])) > 0
        has_obf = _count_high_severity(categories.get("Obfuscation", [])) > 0
        
        if has_exec and has_obf:
            score += 40
            reasons.append("CRITICAL: Code Execution + Obfuscation in typosquatted package")
        elif has_exec:
            score += 20
            reasons.append("HIGH: Code Execution in typosquatted package")
        elif has_obf:
            score += 20
            reasons.append("HIGH: Obfuscation in typosquatted package")
            
        # Network exfil to IPs
        net_high = _count_high_severity(categories.get("Network Exfiltration", []))
        if net_high > 0:
            score += 20
            reasons.append("HIGH: Network exfiltration to IP addresses in typosquatted package")
            
    else:
        # Non-typosquatted packages: only flag HIGH-severity patterns in concentrated form
        # Legitimate packages routinely have os.environ, subprocess, exec etc.
        
        # Crypto mining is ALWAYS suspicious regardless
        if categories.get("Crypto Mining"):
            score += 50
            reasons.append("CRITICAL: Crypto mining patterns detected")
            
        # Network exfil to raw IPs (not domains) is suspicious even in legit packages
        net_high = _count_high_severity(categories.get("Network Exfiltration", []))
        if net_high > 0:
            score += 15
            reasons.append(f"Suspicious: {net_high} network connections to raw IP addresses")
            
        # For known-legitimate packages, skip pattern scoring entirely
        # Their exec/subprocess/os.environ usage is expected build tooling
        # Only flag if something truly unusual (like marshal.loads which is rare)
        if not _is_known_legitimate_by_name(pattern_results):
            # Unknown package (not top PyPI, not typosquatted)
            # Apply moderate pattern scoring
            
            if categories.get("Persistence") and _count_high_severity(categories["Persistence"]) > 0:
                score += 20
                reasons.append("Persistence patterns detected in unknown package")
                
            if categories.get("Sensitive Data Access"):
                high_count = _count_high_severity(categories["Sensitive Data Access"])
                if high_count > 0 and high_count <= 3:
                    # A few HIGH severity (like /etc/passwd) in an unknown package
                    score += 15
                    reasons.append(f"Sensitive data access patterns ({high_count} HIGH) in unknown package")
                    
            has_exec = _count_high_severity(categories.get("Code Execution", [])) > 0
            has_obf = _count_high_severity(categories.get("Obfuscation", [])) > 0
            
            if has_exec and has_obf:
                score += 25
                reasons.append("Code Execution + Obfuscation in unknown package")
            elif has_exec:
                score += 10
                reasons.append("Code execution patterns in unknown package")
    
    # Cap score
    score = min(score, 100)
    
    # Rule: MEDIUM/LOW severity OSV vulnerabilities alone can NEVER trigger a BLOCK verdict
    # Calculate score without MEDIUM/LOW OSV to see if they are the sole cause of a HIGH score
    non_medium_low_score = score - (osv_medium_count * 8 + osv_low_count * 3)
    if score >= 71 and non_medium_low_score == 0:
        score = 70
        reasons.append("Risk score capped at 70 (MEDIUM/LOW OSV vulnerabilities alone cannot trigger BLOCK)")

    # Determine Final Verdict from static analysis
    if score >= 71:
        risk_level = "HIGH"
        recommendation = "BLOCK"
    elif score >= 41:
        risk_level = "MEDIUM"
        recommendation = "ALLOW with warning"
    else:
        risk_level = "LOW"
        recommendation = "ALLOW"
        if not reasons:
            reasons.append("No significant risks detected")
    
    # --- AI Signal Integration ---
    ai_explanation = None
    if ai_result and isinstance(ai_result, dict):
        ai_explanation = ai_result
        ai_risk = ai_result.get("risk_level", "LOW")
        ai_rec = ai_result.get("recommendation", "ALLOW")
        
        # If either static analysis or AI says HIGH risk, verdict must be BLOCK
        if risk_level == "HIGH" or ai_risk == "HIGH":
            risk_level = "HIGH"
            recommendation = "BLOCK"
            if ai_risk == "HIGH" and risk_level != "HIGH":
                reasons.append(f"AI Analysis detected HIGH risk - overriding to BLOCK")
            elif risk_level == "HIGH" and ai_risk != "HIGH":
                reasons.append(f"Static analysis detected HIGH risk - verdict set to BLOCK")
        else:
            # Take the HIGHER risk level between static and AI for non-HIGH cases
            level_order = {"LOW": 0, "MEDIUM": 1, "HIGH": 2}
            if level_order.get(ai_risk, 0) > level_order.get(risk_level, 0):
                risk_level = ai_risk
                reasons.append(f"AI Analysis elevated risk to {ai_risk}")
            
            # Escalate recommendation if AI says BLOCK but static says ALLOW
            rec_order = {"ALLOW": 0, "ALLOW with warning": 1, "BLOCK": 2}
            if rec_order.get(ai_rec, 0) > rec_order.get(recommendation, 0):
                recommendation = ai_rec
             
    return {
        "risk_level": risk_level,
        "risk_score": score,
        "recommendation": recommendation,
        "reasons": reasons,
        "osv_vulns": osv_results,
        "typosquatting": typosquatting_result,
        "pattern_summary": pattern_results,
        "ai_explanation": ai_explanation
    }


def _is_known_legitimate_by_name(pattern_results):
    """
    Helper to check if the package being analyzed is a known top package.
    We store the package name in pattern_results under '_package_name' from main.py.
    Fallback: return False if not available.
    """
    pkg_name = pattern_results.get("_package_name", "")
    if not pkg_name:
        return False
    return _is_known_legitimate(pkg_name)
