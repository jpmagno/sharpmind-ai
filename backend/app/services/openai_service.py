import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def summarize_article_content(content: str) -> dict:
    prompt = f"""
    Summarize this article and generate 5 flashcards and a quiz.
    ---
    {content}
    ---
    Format:
    {{
        "summary": "...",
        "flashcards": [{{"question": "...", "answer": "..."}}],
        "quiz": [{{"question": "...", "options": [...], "answer": "..."}}]
    }}
    """

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
    )

    try:
        return json.loads(response.choices[0].message.content.strip())
    except json.JSONDecodeError as e:
        print("⚠️ Error parsing OpenAI response:", e)
        print("📦 Raw response content:", response.choices[0].message.content)
        return {"error": "Failed to parse OpenAI response"}

