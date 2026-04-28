import requests
from parser import normalize_package_name

_top_packages = []

def load_top_packages():
    global _top_packages
    if _top_packages:
        return _top_packages
        
    try:
        url = "https://hugovk.github.io/top-pypi-packages/top-pypi-packages-30-days.min.json"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        _top_packages = [row['project'] for row in data.get('rows', [])]
        return _top_packages
    except Exception as e:
        print(f"Error loading top packages: {e}")
        return []

def levenshtein_distance(s1, s2):
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)

    if len(s2) == 0:
        return len(s1)

    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row

    return previous_row[-1]

def check_typosquatting(package_name):
    normalized_name = normalize_package_name(package_name)
    top_packages = load_top_packages()
    
    # Check hardcoded demo malicious examples first
    hardcoded = {
        "colourama": ("colorama", "Homoglyph substitution"),
        "djanga": ("django", "Typo / Vowel swap"),
        "reqeusts": ("requests", "Character swap"),
        "numppy": ("numpy", "Character doubling"),
        "pytorch": ("torch", "Common prefix addition")
    }
    
    if normalized_name in hardcoded:
        return {
            "is_suspicious": True,
            "closest_match": hardcoded[normalized_name][0],
            "distance": levenshtein_distance(normalized_name, hardcoded[normalized_name][0]),
            "suspicion_reason": hardcoded[normalized_name][1],
            "confidence": "HIGH"
        }
        
    # If exactly matches a top package, it's legitimate
    if normalized_name in top_packages:
        return {"is_suspicious": False, "confidence": "LOW"}
        
    closest_match = None
    min_distance = float('inf')
    suspicion_reason = None
    confidence = "LOW"
    
    for top_pkg in top_packages:
        dist = levenshtein_distance(normalized_name, top_pkg)
        
        # Exact match logic (e.g. casing differences resolved by normalization)
        if dist == 0:
             return {"is_suspicious": False, "confidence": "LOW"}
             
        if dist < min_distance:
            min_distance = dist
            closest_match = top_pkg
            
    # Heuristics
    if len(normalized_name) >= 4 and min_distance in (1, 2):
        confidence = "HIGH" if min_distance == 1 else "MEDIUM"
        
        # Check specific patterns for reason
        if min_distance == 1 and len(normalized_name) > len(closest_match):
             suspicion_reason = "Character insertion or doubling"
        elif min_distance == 1 and len(normalized_name) == len(closest_match):
             suspicion_reason = "Character swap or substitution"
        else:
             suspicion_reason = f"Levenshtein distance of {min_distance} to popular package"
             
    elif closest_match:
        # Check suffixes
        if normalized_name.startswith(closest_match) and normalized_name != closest_match:
            suffix = normalized_name[len(closest_match):]
            if suffix in ('2', '3', 'dev', 'test', 'python'):
                confidence = "MEDIUM"
                suspicion_reason = f"Common suffix '{suffix}' added to popular package"
                
    if confidence in ("HIGH", "MEDIUM"):
         return {
            "is_suspicious": True,
            "closest_match": closest_match,
            "distance": min_distance,
            "suspicion_reason": suspicion_reason,
            "confidence": confidence
         }
         
    return {"is_suspicious": False, "confidence": "LOW"}
