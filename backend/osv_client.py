import requests

def query_osv(package_name, version):
    """Queries the OSV API for known vulnerabilities for a specific package version."""
    url = "https://api.osv.dev/v1/query"
    payload = {
        "version": version,
        "package": {
            "name": package_name,
            "ecosystem": "PyPI"
        }
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        vulns = data.get("vulns", [])
        results = []
        
        for vuln in vulns:
            # Extract basic details
            vuln_id = vuln.get("id")
            summary = vuln.get("summary") or vuln.get("details", "No details provided.")
            
            # Severity might be nested in database_specific or severity array
            severity = "UNKNOWN"
            if "database_specific" in vuln and "severity" in vuln["database_specific"]:
                 severity = vuln["database_specific"]["severity"]
            elif "severity" in vuln:
                 for s in vuln["severity"]:
                     if s["type"] == "CVSS_V3":
                          try:
                              raw = s.get("score", "0")
                              score = float(raw.split(":")[-1].split("/")[0][-3:])
                          except (ValueError, IndexError, AttributeError):
                              score = 0.0
                          severity = s["score"]
                          
            # Fallback text search if severity is not structured well
            if severity == "UNKNOWN":
                summary_lower = summary.lower()
                if "critical" in summary_lower: severity = "CRITICAL"
                elif "high" in summary_lower: severity = "HIGH"
                elif "medium" in summary_lower: severity = "MEDIUM"
                elif "low" in summary_lower: severity = "LOW"
                
            # Clean up the parsed severity (we want just the word)
            severity = severity.upper()
            if "CRITICAL" in severity: severity = "CRITICAL"
            elif "HIGH" in severity: severity = "HIGH"
            elif "MEDIUM" in severity: severity = "MEDIUM"
            elif "LOW" in severity: severity = "LOW"
            else: severity = "MEDIUM" # Default if present but unspecified
            
            # Extract affected ranges
            affected_versions = []
            fixed_in = None
            if "affected" in vuln:
                for affected in vuln["affected"]:
                    if "ranges" in affected:
                        for r in affected["ranges"]:
                            events = r.get("events", [])
                            range_str = []
                            for event in events:
                                if "introduced" in event: range_str.append(f">= {event['introduced']}")
                                if "fixed" in event:
                                     range_str.append(f"< {event['fixed']}")
                                     if fixed_in is None or event['fixed'] > fixed_in:
                                         fixed_in = event['fixed']
                            if range_str:
                                affected_versions.append(" ".join(range_str))
                                
            results.append({
                "id": vuln_id,
                "summary": summary[:200] + "..." if len(summary) > 200 else summary,
                "severity": severity,
                "affected_versions": affected_versions,
                "fixed_in": fixed_in,
                "published_date": vuln.get("published"),
                "references": [ref.get("url") for ref in vuln.get("references", [])]
            })
            
        return results
        
    except requests.RequestException as e:
        print(f"OSV query failed for {package_name} v{version}: {e}")
        return []

def get_severity_score(osv_results):
    """Returns the highest severity found."""
    if not osv_results:
        return "NONE"
        
    severities = [v.get("severity", "LOW") for v in osv_results]
    
    if "CRITICAL" in severities: return "CRITICAL"
    if "HIGH" in severities: return "HIGH"
    if "MEDIUM" in severities: return "MEDIUM"
    if "LOW" in severities: return "LOW"
    
    return "UNKNOWN"

def format_vuln_summary(osv_results):
    """Returns human readable string for AI prompt."""
    if not osv_results:
        return "No known vulnerabilities found."
        
    summary = f"{len(osv_results)} known vulnerabilities:\n"
    for v in osv_results:
        summary += f"- {v.get('id')} ({v.get('severity')}) - {v.get('summary')}\n"
        
    return summary
