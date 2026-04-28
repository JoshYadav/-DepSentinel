import requests
import json
print('Running scan...')
resp = requests.post('http://127.0.0.1:5000/api/scan', json={'requirements_text': 'requests==2.28.0'})
print('Done! Status:', resp.status_code)
for result in resp.json().get('results', []):
    print(f"{result.get('package')} {result.get('version')} -> Risk: {result.get('risk', {}).get('risk_level')} Rec: {result.get('risk', {}).get('recommendation')}")
