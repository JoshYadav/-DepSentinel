import json
import hashlib
import os
from datetime import datetime

LEDGER_FILE = os.path.join(os.path.dirname(__file__), 'ledger.json')

def get_ledger():
    if not os.path.exists(LEDGER_FILE):
        return []
    with open(LEDGER_FILE, 'r') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def save_ledger(ledger):
    with open(LEDGER_FILE, 'w') as f:
        json.dump(ledger, f, indent=4)

def calculate_hash(entry):
    entry_string = f"{entry['package']}{entry['version']}{entry['code_hash']}{entry['previous_hash']}{entry['timestamp']}"
    return hashlib.sha256(entry_string.encode('utf-8')).hexdigest()

def add_entry(package, version, code_hash, status, blockchain_tx_hash=None, blockchain_etherscan_url=None):
    ledger = get_ledger()
    
    previous_hash = '0000000000000000000000000000000000000000000000000000000000000000'
    if ledger:
        previous_hash = ledger[-1]['hash']
        
    new_entry = {
        'package': package,
        'version': version,
        'code_hash': code_hash,
        'previous_hash': previous_hash,
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'status': status,
        'blockchain_tx_hash': blockchain_tx_hash,
        'blockchain_etherscan_url': blockchain_etherscan_url
    }
    
    new_entry['hash'] = calculate_hash(new_entry)
    ledger.append(new_entry)
    save_ledger(ledger)
    return new_entry

def verify_entry(package, version, code_hash):
    ledger = get_ledger()
    for entry in reversed(ledger):
        if entry['package'] == package and entry['version'] == version:
            return entry['code_hash'] == code_hash
    return False

def is_tampered():
    ledger = get_ledger()
    if not ledger:
        return False
        
    for i in range(1, len(ledger)):
        current_entry = ledger[i]
        previous_entry = ledger[i-1]
        
        # Check if previous_hash matches actual previous entry's hash
        if current_entry['previous_hash'] != previous_entry['hash']:
            return True
            
        # Re-verify hash of the current entry itself
        recalculated_hash = calculate_hash(current_entry)
        if current_entry['hash'] != recalculated_hash:
            return True
            
    return False
