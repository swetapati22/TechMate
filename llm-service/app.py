from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import openai
import json
import ast

# Load environment variables from .env
load_dotenv()

# Initialize OpenAI
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
print("🔐 OpenAI Key Loaded:", OPENAI_API_KEY[:5] + "..." if OPENAI_API_KEY else "❌ NOT FOUND")
client = openai.OpenAI(api_key=OPENAI_API_KEY)

# Set up Flask
app = Flask(__name__)
CORS(app)

# Instruction for assistant
instruction = (
    "You are a helpful assistant for elderly users. "
    "If the user's question does not clearly specify the device (e.g., phone, tablet, laptop) or service (e.g., Gmail, WhatsApp, Facebook), "
    "then do not answer immediately. Instead, first ask a gentle, short follow-up question to clarify the missing information. "
    "Once the user provides that, respond with clear, numbered, and simple step-by-step instructions. "
    "Avoid technical jargon and assume the user has minimal tech experience."
)

# Route 1: Generate assistant response
@app.route('/generate-steps', methods=['POST'])
def generate_steps():
    data = request.get_json()
    print("📩 Received request:", data)

    user_query = data.get("query")
    if not user_query:
        return jsonify({"error": "Missing query"}), 400

    prompt = f"{user_query}. {instruction}"

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
        )

        steps_text = response.choices[0].message.content
        print("✅ GPT Response:\n", steps_text)

        steps = [line.strip() for line in steps_text.split("\n") if line.strip()]
        return jsonify({"steps": steps})

    except Exception as e:
        print("❌ Error:", str(e))
        return jsonify({"error": str(e)}), 500

# Route 2: Generate LLM summary data for Firestore
@app.route('/llm-summary', methods=['POST'])
def llm_summary():
    data = request.get_json()
    print("🧠 Summary request received")

    conversation_text = data.get("conversation", "")
    if not conversation_text:
        return jsonify({"error": "No conversation data provided"}), 400

    prompt = f"""
You are a kind assistant helping an elderly person. Based on the entire conversation (multiple questions if any), do the following:

1. Frame a single clear and complete question that summarizes what the user is asking for, including device and OS context.
2. Give a short summary of the conversation (both user and assistant messages).
3. Mention the app being referred to (if any).
4. If the user is satisfied, summarize the final answer that was helpful.

Return the output in this JSON format:
{{
  "question": "...",
  "summary": "...",
  "appname": "...",
  "answer": "..."
}}

Conversation:
{conversation_text}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6,
        )

        raw_text = response.choices[0].message.content.strip()
        print("📦 LLM Summary Response:", raw_text)

        # Try JSON or safely parse using ast
        try:
            parsed = json.loads(raw_text)
        except json.JSONDecodeError:
            try:
                parsed = ast.literal_eval(raw_text)
            except Exception as e:
                print("⚠️ Parsing failed, returning raw output.")
                parsed = {"summary": raw_text}

        return jsonify(parsed)

    except Exception as e:
        print("❌ Error in /llm-summary:", str(e))
        return jsonify({"error": str(e)}), 500

# Run the server
if __name__ == "__main__":
    app.run(port=5001)
