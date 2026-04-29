import google.generativeai as genai
import os
from dotenv import load_dotenv
load_dotenv()
key = os.getenv('GEMINI_API_KEY')
print('Key found:', key[:10] if key else 'NOT FOUND')
genai.configure(api_key=key)
model = genai.GenerativeModel('gemini-1.5-flash')
response = model.generate_content('Say hello')
print('Response:', response.text)
