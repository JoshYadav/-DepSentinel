import re
import os
from diff_engine import extract_package_code

def analyze_package_code(package_name, version, code_dict=None):
    """
    Runs pattern detection across all .py files.
    If code_dict is provided, uses it directly (avoids re-downloading).
    """
    if code_dict is None:
        code_dict, _ = extract_package_code(package_name, version)
    if not code_dict:
        return {"error": "Failed to extract package code.", "categories": {}}
        
    all_results = {}
    aggregated_categories = {
        'Code Execution': [],
        'Obfuscation': [],
        'Network Exfiltration': [],
        'Persistence': [],
        'Sensitive Data Access': [],
        'Crypto Mining': []
    }
    
    total_count = 0
    
    for filename, code_text in code_dict.items():
        file_results = detect_patterns(code_text, filename)
        
        if file_results['total_count'] > 0:
            all_results[filename] = file_results
            total_count += file_results['total_count']
            
            for cat, items in file_results['categories'].items():
                aggregated_categories[cat].extend(items)
                
    return {
        'files': all_results,
        'categories': aggregated_categories,
        'total_count': total_count
    }

def detect_patterns(code_text, filename=""):
    """Scans code text for malicious patterns."""
    
    patterns = {
        'Code Execution': [
            (r'eval\s*\(', "MEDIUM"),
            (r'exec\s*\(', "HIGH"),
            (r'os\.system\s*\(', "HIGH"),
            (r'subprocess\.(call|run|Popen|check_output)', "MEDIUM"),
            (r'__import__\s*\(', "MEDIUM"),
            (r'compile\s*\(.*exec', "HIGH")
        ],
        'Obfuscation': [
            (r'base64\.(b64decode|decodebytes)', "MEDIUM"),
            (r'zlib\.decompress', "LOW"),
            (r'marshal\.loads', "HIGH"),
            (r'pickletools', "MEDIUM"),
            (r'\\x[0-9a-fA-F]{2}', "LOW"), # We'll filter this below if count > 5
            (r'chr\(\d+\)', "LOW")
        ],
        'Network Exfiltration': [
            (r'socket\.(socket|connect|send)', "MEDIUM"),
            (r'urllib\.(request|urlopen)', "LOW"),
            (r'requests\.(get|post|put)\s*\(\s*[\'"][^\'"]*(?:\d{1,3}\.){3}\d{1,3}', "HIGH"), # IP address
            (r'ftplib', "MEDIUM"),
            (r'smtplib', "MEDIUM")
        ],
        'Persistence': [
            (r'\.bashrc|\.bash_profile|\.zshrc', "HIGH"),
            (r'crontab', "HIGH"),
            (r'/etc/init', "HIGH"),
            (r'startup.*registry', "HIGH"),
            (r'schtasks', "HIGH")
        ],
        'Sensitive Data Access': [
            (r'/etc/passwd', "HIGH"),
            (r'/etc/shadow', "HIGH"),
            (r'\.ssh/', "HIGH"),
            (r'os\.environ', "LOW"),
            (r'keyring', "MEDIUM"),
            (r'getpass', "LOW")
        ],
        'Crypto Mining': [
            (r'stratum\+tcp', "HIGH"),
            (r'mining.*pool', "HIGH"),
            (r'xmrig', "HIGH"),
            (r'monero', "HIGH")
        ]
    }
    
    results = {cat: [] for cat in patterns}
    total_suspicion_count = 0
    
    lines = code_text.splitlines()
    
    for line_num, line in enumerate(lines, 1):
        for category, regex_list in patterns.items():
            for regex, severity in regex_list:
                
                # Special handling for hex obfuscation (need > 5 occurrences)
                if regex == r'\\x[0-9a-fA-F]{2}':
                    matches = list(re.finditer(regex, line))
                    if len(matches) > 5:
                        results[category].append({
                            'match': f"Multiple hex encodes ({len(matches)})",
                            'line': line.strip()[:100],
                            'line_number': line_num,
                            'severity': "HIGH"
                        })
                        total_suspicion_count += 1
                    continue
                    
                match = re.search(regex, line)
                if match:
                    results[category].append({
                        'match': match.group(0),
                        'line': line.strip()[:100], # Trucate long lines
                        'line_number': line_num,
                        'severity': severity
                    })
                    total_suspicion_count += 1
                    
    return {
        'categories': results,
        'total_count': total_suspicion_count
    }
