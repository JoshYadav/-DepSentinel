#!/usr/bin/env python3
"""
DepSentinel CI/CD Scanner
Scans requirements.txt and fails the build if any HIGH risk packages found.
Usage: python scan_ci.py requirements.txt
"""
import sys
import json
import os
from parser import parse_requirements
from fetcher import get_package_metadata
from detector import detect_patterns
from osv_client import query_osv
from typosquatting import check_typosquatting
from risk_engine import calculate_risk

def scan_for_ci(requirements_file):
    print(f"\n🛡️  DepSentinel Security Scanner")
    print(f"📄 Scanning: {requirements_file}")
    print("=" * 50)
    
    with open(requirements_file, 'r') as f:
        requirements_text = f.read()
    
    packages = parse_requirements(requirements_text)
    results = []
    has_critical = False
    
    for pkg in packages:
        name = pkg['name']
        version = pkg['version']
        
        print(f"\n🔍 Scanning {name}=={version}...")
        
        osv_result = query_osv(name, version)
        typo_result = check_typosquatting(name)
        pattern_result = {'categories': {}, 'total_count': 0}
        
        risk = calculate_risk(pattern_result, osv_result, typo_result)
        
        status_icon = "✅" if risk['recommendation'] == 'ALLOW' else "🚨"
        print(f"{status_icon} {name}=={version}: {risk['risk_level']} — {risk['recommendation']}")
        
        if risk['reasons']:
            for reason in risk['reasons']:
                print(f"   ⚠️  {reason}")
        
        results.append({
            'package': name,
            'version': version,
            'risk_level': risk['risk_level'],
            'recommendation': risk['recommendation'],
            'reasons': risk['reasons']
        })
        
        if risk['recommendation'] == 'BLOCK':
            has_critical = True
    
    # Save report
    report = {
        'total_packages': len(packages),
        'blocked': sum(1 for r in results if r['recommendation'] == 'BLOCK'),
        'allowed': sum(1 for r in results if r['recommendation'] == 'ALLOW'),
        'results': results
    }
    
    with open('scan_report.json', 'w') as f:
        json.dump(report, f, indent=2)
    
    print("\n" + "=" * 50)
    print(f"📊 SCAN COMPLETE")
    print(f"✅ Allowed: {report['allowed']}")
    print(f"🚨 Blocked: {report['blocked']}")
    print(f"📄 Report saved: scan_report.json")
    
    if has_critical:
        print("\n🚨 BUILD FAILED — Malicious or high-risk dependencies detected!")
        print("Review scan_report.json for details.")
        sys.exit(1)
    else:
        print("\n✅ BUILD PASSED — All dependencies are safe.")
        sys.exit(0)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scan_ci.py requirements.txt")
        sys.exit(1)
    scan_for_ci(sys.argv[1])
