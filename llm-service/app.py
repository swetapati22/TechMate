from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import openai

# Load environment variables from .env
load_dotenv()

# Initialize OpenAI
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
print("🔐 OpenAI Key Loaded:", OPENAI_API_KEY[:5] + "..." if OPENAI_API_KEY else "❌ NOT FOUND")
client = openai.OpenAI(api_key=OPENAI_API_KEY)

# Set up Flask
app = Flask(__name__)
CORS(app)

# Smart assistant instruction
instruction = (
    "You are a helpful assistant for elderly users. "
    "If the user's question does not clearly specify the device (e.g., phone, tablet, laptop) or service (e.g., Gmail, WhatsApp, Facebook), "
    "then do not answer immediately. Instead, first ask a gentle, short follow-up question to clarify the missing information. "
    "Once the user provides that, respond with clear, numbered, and simple step-by-step instructions. "
    "Avoid technical jargon and assume the user has minimal tech experience."
)

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
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
        )

        steps_text = response.choices[0].message.content
        print("✅ GPT Response:\n", steps_text)

        steps = [line.strip() for line in steps_text.split("\n") if line.strip()]
        return jsonify({"steps": steps})

    except Exception as e:
        print("❌ Error:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001)
#Connecting Flash
