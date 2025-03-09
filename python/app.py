from flask import Flask, request, jsonify, render_template
import requests
import random
import string
import os
from supabase import create_client, Client

app = Flask(__name__)

# Configuration
TOGETHER_API_KEY = "your_together_api_key"
TOGETHER_MODEL = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"
SUPABASE_URL = "SUPABASE_URL"
SUPABASE_KEY = "SUPABASE_API"

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def generate_convid():
    return ''.join(random.choices(string.digits, k=8))

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/start_conversation", methods=["POST"])
def start_conversation():
    convid = generate_convid()
    return jsonify({"convid": convid})

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    convid = data.get("convid")
    user_message = data.get("message")

    if not convid or not user_message:
        return jsonify({"error": "Missing convid or message"}), 400

    # Fetch previous conversation
    response = supabase.table("conversations").select("messages").eq("convid", convid).execute()
    past_messages = response.data[0]["messages"] if response.data else []
    
    # Create API request
    messages = past_messages + [{"role": "user", "content": user_message}]
    payload = {
        "model": TOGETHER_MODEL,
        "messages": messages,
        "temperature": 0.7,
        "top_p": 0.7,
        "top_k": 50,
        "repetition_penalty": 1,
        "stream": False
    }
    headers = {
        "Authorization": f"Bearer {TOGETHER_API_KEY}",
        "Content-Type": "application/json"
    }
    
    response = requests.post("https://api.together.ai/v1/chat/completions", json=payload, headers=headers)
    ai_response = response.json().get("choices", [{}])[0].get("message", {}).get("content", "Error")
    
    # Store conversation
    messages.append({"role": "assistant", "content": ai_response})
    supabase.table("conversations").upsert({"convid": convid, "messages": messages}).execute()
    
    return jsonify({"convid": convid, "response": ai_response})

if __name__ == "__main__":
    app.run(debug=True)
