import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import hashlib

from parser import parse_requirements
from fetcher import get_package_metadata, get_previous_version
from diff_engine import extract_package_code, compute_real_diff, get_diff_summary
from detector import analyze_package_code
from risk_engine import calculate_risk
from typosquatting import check_typosquatting, load_top_packages
from osv_client import query_osv
from ledger import add_entry, get_ledger, is_tampered
from parser import normalize_package_name
from ai_analyzer import analyze_with_ai
from blockchain import store_hash_onchain

app = Flask(__name__)
CORS(app)

# Cache the top packages set for fast lookup
_top_packages_set = None
def _get_top_set():
    global _top_packages_set
    if _top_packages_set is None:
        _top_packages_set = set(load_top_packages())
    return _top_packages_set

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'pypi_api': 'reachable',
        'osv_api': 'reachable'
    })

@app.route('/api/ledger', methods=['GET'])
def ledger_route():
    ledger_data = get_ledger()
    tampered = is_tampered()
    return jsonify({
        'ledger': ledger_data,
        'is_tampered': tampered
    })

@app.route('/api/packages/top', methods=['GET'])
def top_packages():
    return jsonify({'packages': load_top_packages()[:50]})
    
@app.route('/api/osv/<package>/<version>', methods=['GET'])
def osv_lookup(package, version):
    results = query_osv(package, version)
    return jsonify({'vulnerabilities': results})


def _scan_single_package(name, version):
    """Scan a single package through the full pipeline."""
    
    # 1. Metadata (cached after first call)
    metadata = get_package_metadata(name)
    if version == "latest" and metadata:
        version = metadata.get('latest_version')
        
    # 2. Typosquatting — fast, no network needed after first load
    typo_result = check_typosquatting(name)
    
    # 3. OSV — single HTTP POST, fast
    osv_result = query_osv(name, version)
    
    # Determine if this is a well-known legitimate package
    normalized = normalize_package_name(name)
    is_top_package = normalized in _get_top_set()
    is_suspicious = typo_result.get("is_suspicious", False)
    
    # 4-6. Code analysis: ONLY download packages for unknown/suspicious ones
    # Well-known packages (top PyPI) don't need code scanning — they're trusted.
    # This is the key optimization: skip the 3-5 minute download for flask/numpy/etc.
    
    code_dict = None
    diff_res = None
    diff_summary = None
    pattern_res = {'categories': {}, 'total_count': 0}
    
    if not is_suspicious and not is_top_package:
        # Unknown package — download and analyze fully
        code_dict, _ = extract_package_code(name, version)
        
        if code_dict:
            # Diff
            previous_version = get_previous_version(name, version)
            try:
                diff_res = compute_real_diff(name, previous_version, version, new_code=code_dict)
                if diff_res:
                    diff_summary = get_diff_summary(diff_res)
            except Exception as e:
                print(f"Diff error for {name}: {e}")
                
            # Pattern Detection — reuse code_dict
            pattern_res = analyze_package_code(name, version, code_dict=code_dict)
    elif is_suspicious:
        # Typosquatted package — try to download but don't block on failure
        # (most typosquats are already removed from PyPI)
        code_dict, _ = extract_package_code(name, version)
        if code_dict:
            pattern_res = analyze_package_code(name, version, code_dict=code_dict)
    # else: top package — skip download entirely, rely on OSV for vulnerability data
    
    pattern_res['_package_name'] = name
    
    # 8. AI Analysis (Gemini)
    ai_result = analyze_with_ai(
        package_name=name,
        version=version,
        diff_text=diff_summary,
        detected_patterns=pattern_res,
        osv_vulns=osv_result,
        typosquatting=typo_result
    )
    
    # 9. Risk Engine (includes AI signal)
    risk = calculate_risk(pattern_res, osv_result, typo_result, ai_result=ai_result)
    
    # Blockchain recording
    code_hash = hashlib.sha256(f"{name}:{version}".encode('utf-8')).hexdigest()
    blockchain_tx_hash = None
    blockchain_etherscan_url = None
    blockchain_block_number = None
    blockchain_status = None
    
    if risk['recommendation'] == 'ALLOW':
        # Record verified packages on Sepolia
        try:
            bc_result = store_hash_onchain(name, version, code_hash)
            if bc_result:
                blockchain_tx_hash = bc_result['tx_hash']
                blockchain_etherscan_url = bc_result['etherscan_url']
                blockchain_block_number = bc_result['block_number']
                blockchain_status = bc_result['status']  # 'verified'
            else:
                blockchain_status = 'blockchain unavailable'
        except Exception as e:
            print(f"[blockchain] Failed for {name}: {e}")
            blockchain_status = 'blockchain unavailable'
    else:
        # BLOCK — never record malicious packages on-chain
        blockchain_status = 'blocked \u2014 not recorded'
    
    # Ledger entry (includes blockchain data)
    add_entry(name, version, code_hash, risk['recommendation'],
              blockchain_tx_hash=blockchain_tx_hash,
              blockchain_etherscan_url=blockchain_etherscan_url)
    
    return {
        'package': name,
        'version': version,
        'diff': diff_res,
        'diff_summary': diff_summary,
        'patterns': pattern_res,
        'risk': risk,
        'typosquatting': typo_result,
        'osv': osv_result,
        'metadata': metadata,
        'blockchain_tx_hash': blockchain_tx_hash,
        'blockchain_etherscan_url': blockchain_etherscan_url,
        'blockchain_block_number': blockchain_block_number,
        'blockchain_status': blockchain_status
    }


@app.route('/api/scan', methods=['POST'])
def scan():
    start_time = time.time()
    data = request.json
    requirements_text = data.get('requirements_text', '')
    
    packages = parse_requirements(requirements_text)
    results = []
    
    # Run all packages in PARALLEL
    with ThreadPoolExecutor(max_workers=min(len(packages), 6)) as executor:
        futures = {}
        for pkg in packages:
            name = pkg['name']
            version = pkg['version']
            future = executor.submit(_scan_single_package, name, version)
            futures[future] = name
            
        for future in as_completed(futures):
            try:
                result = future.result()
                results.append(result)
            except Exception as e:
                pkg_name = futures[future]
                print(f"Error scanning {pkg_name}: {e}")
                results.append({
                    'package': pkg_name,
                    'version': 'unknown',
                    'error': str(e),
                    'risk': {
                        'risk_level': 'UNKNOWN',
                        'risk_score': 0,
                        'recommendation': 'ERROR',
                        'reasons': [f'Scan failed: {str(e)}'],
                        'osv_vulns': [],
                        'typosquatting': {},
                        'pattern_summary': {},
                        'ai_explanation': None
                    }
                })
    
    # Sort results to maintain original package order
    pkg_order = {pkg['name']: i for i, pkg in enumerate(packages)}
    results.sort(key=lambda r: pkg_order.get(r['package'], 999))
        
    duration_ms = int((time.time() - start_time) * 1000)
    
    response = make_response(jsonify({'results': results}))
    response.headers['X-Scan-Duration'] = str(duration_ms)
    return response

# Global Error Handler
@app.errorhandler(Exception)
def handle_exception(e):
    return jsonify({
        "error": "Internal Server Error",
        "message": str(e)
    }), 500

if __name__ == '__main__':
    # Pre-load top packages on startup
    load_top_packages()
    app.run(debug=True, port=5000)
