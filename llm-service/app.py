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
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

# ✅ Manual fallback videos (2 per category)
manual_videos = {
    "Laptop - Windows": [
        {"title": "Windows 11 Tips & Tricks You Should Know!", "url": "https://www.youtube.com/watch?v=4s0I6yXaNO0"},
        {"title": "20 Pc Tips And Tricks YOU NEED To Know", "url": "https://www.youtube.com/watch?v=zgntSd_D3Io"}
    ],
    "Laptop - macOS": [
        {"title": "10 Actually useful Mac tips & tricks!", "url": "https://www.youtube.com/watch?v=C2vYqhXY8v8"},
        {"title": "42 ACTUAL Mac Tips & Tricks You Didn't Know Existed! (2025)", "url": "https://www.youtube.com/watch?v=JQTOw28X1MQ"}
    ],
    "Mobile - Android": [
        {"title": "30 Amazing Android SECRETS, TIPS and TRICKS", "url": "https://www.youtube.com/watch?v=RI59KEYW19Q"},
        {"title": "100 Smartphone Tricks in 15 Minutes.", "url": "https://www.youtube.com/watch?v=S7r_ipKQjkA"}
    ],
    "Mobile - iOS": [
        {"title": "25 iPhone Tips & Tricks | YOU WISH YOU KNEW SOONER!!", "url": "https://www.youtube.com/watch?v=RrzZ1bZEHlc"},
        {"title": "iPhone Hidden Features! 2024 Tips & Tricks!", "url": "https://www.youtube.com/watch?v=AWd6S7yrQlY"}
    ],
    "Tablet - Android": [
        {"title": "Galaxy Tab S9 Ultra - First Things To Do ( Beginners Tips & Tricks )", "url": "https://www.youtube.com/watch?v=jO3wvJTJV1Y"},
        {"title": "10 Genius Ways To Use Your Old Phone or Tablet!", "url": "https://www.youtube.com/watch?v=ZxJSLj-eCcE"}
    ],
    "Tablet - iPadOS": [
        {"title": "Secret iPad Tips and Tricks You Should Try in 2024!", "url": "https://www.youtube.com/watch?v=X7szIN1hS70"},
        {"title": "APPLE iPAD Tips, Tricks, and Hidden Features most people don't know", "url": "https://www.youtube.com/watch?v=n47MyCiVe9U"}
    ]
}

# Assistant prompt
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

        try:
            parsed = json.loads(raw_text)
        except json.JSONDecodeError:
            parsed = ast.literal_eval(raw_text)
        return jsonify(parsed)
    except Exception as e:
        print("❌ Error in /llm-summary:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/taptutor-videos', methods=['POST'])
def taptutor_videos():
    try:
        prompt = """You are a helpful assistant for suggesting technical videos. Generate useful YouTube video links that teach them how to use these devices.

        Please categorize videos under these sections:

        1. Laptop - Windows
        2. Laptop - macOS
        3. Mobile - Android
        4. Mobile - iOS
        5. Tablet - Android
        6. Tablet - iPadOS

        For each category, suggest **1** helpful and beginner-friendly YouTube videos for using the devices - any tips or tricks. Return them in the following JSON format:

        {
        "Laptop - Windows": [
            {"title": "...", "url": "..."},
            ...
        ],
        ...
        }

        You can seach "<Category Link> - Common Tips and Tricks" in youtube and then choose a video.
        Make sure all links are valid YouTube URLs and not just titles. Please mandatorily validate the urls to see if you are able to run a youtube video.
        """

        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )

        raw_text = response.choices[0].message.content.strip()
        print("📺 TapTutor GPT Response:\n", raw_text)

        try:
            gpt_data = json.loads(raw_text)
        except json.JSONDecodeError:
            gpt_data = ast.literal_eval(raw_text)

        # ✅ Merge 2 manual + 1 GPT video per category
        combined = {}
        for category, manual_list in manual_videos.items():
            combined[category] = manual_list.copy()
            if category in gpt_data and isinstance(gpt_data[category], list) and gpt_data[category]:
                combined[category].append(gpt_data[category][0])

        return jsonify(combined)

    except Exception as e:
        print("❌ Error in /taptutor-videos:", str(e))
        return jsonify({"error": str(e)}), 500

# Run the server
if __name__ == "__main__":
    app.run(port=5001)
