from flask import Flask, request, jsonify
import google.generativeai as genai
import os
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)

genai.configure(api_key=os.getenv("AIzaSyACdmx8Hq92AgGPAk6YZ0XJLSG6hB2pxXY"))

def list_models():
    models = genai.list_models()
    return [model.name for model in models]

@app.route('/models', methods=['GET']) #Add this new route.
def get_models():
    return jsonify({'models': list_models()})

model = genai.GenerativeModel('models/gemini-1.5-pro-latest')

@app.route('/generate', methods=['POST'])
def generate_content():
    try:
        data = request.get_json()
        prompt = data['prompt']
        response = model.generate_content(prompt)
        return jsonify({'result': response.text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)