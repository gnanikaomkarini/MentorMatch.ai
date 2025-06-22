import ast
import os
import re
import json
import requests
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage
from utils.gemini import GeminiLLM 

load_dotenv()
SERPER_API_KEY = os.getenv("SERPER_API_KEY")

def get_modules_with_subtopics(topic: str, llm) -> list:
    prompt = f"""
From the below conversation between a mentee and a mentor, identify the main topics that
the mentee wishes to learn.

Conversation: {topic}

Break down the topics the mentee wants to learn into 6–8 modules. Each module should contain:
- "title": Title of the module
- "objective": A short objective
- "subtopics": A list of 3–5 fine-grained subtopics (e.g., concepts or tasks)

Respond ONLY with a valid JSON list:
[
  {{
    "title": "<module title>",
    "objective": "<brief objective>",
    "subtopics": ["<subtopic1>", "<subtopic2>", ...]
  }}
]
"""
    response = llm.invoke([{"role": "user", "content": prompt}])
    content = response.content.strip()

    match = re.search(r"```(?:json)?\s*(\[.*?\])\s*```", content, re.DOTALL)
    json_str = match.group(1).strip() if match else content.strip()

    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        try:
            print(json_str)
            return ast.literal_eval(json_str)
        except Exception as e:
            print("\nFailed to parse LLM output:", json_str)
            raise e

def search_resources(query: str) -> list:
    headers = {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json"
    }
    res = requests.post("https://google.serper.dev/search", headers=headers, json={"q": query})

    if res.status_code != 200:
        return [{"type": "other", "title": "Search failed", "url": str(res.status_code), "completed": False}]

    organic = res.json().get("organic", [])[:3]
    resources = []
    for r in organic:
        url = r["link"]
        r_type = "youtube" if "youtube.com" in url else "coursera" if "coursera.org" in url else "other"
        resources.append({
            "type": r_type,
            "title": r["title"],
            "url": url,
            "completed": False
        })
    return resources[:2]


def create_roadmap(topic) -> dict:
    llm = GeminiLLM(api_key=os.getenv("GEMINI_API_KEY"))
    modules = get_modules_with_subtopics(topic, llm)
    enriched_modules = []

    for mod in modules:
        enriched_subtopics = []
        for sub in mod["subtopics"]:
            resources = search_resources(f"{sub} {topic} site:youtube.com OR site:coursera.org OR free learning")
            # if resources and resources[0]["title"] == "Search failed":
            #     continue
            enriched_subtopics.append({
                "title": sub,
                "resources": resources
            })

        subtopic_list = ", ".join(mod["subtopics"])
        question_prompt = f"""
You're an educational AI assistant. Create 5 multiple-choice questions to evaluate understanding of the following subtopics: {subtopic_list}. Ensure that you have both medium and hard questions.
Format your response as valid JSON:

{{
  "question1": {{
    "question": "...",
    "option A": "...",
    "option B": "...",
    "option C": "...",
    "option D": "...",
    "correct option": "A/B/C/D"
  }},
  "question2": {{ ... }},
  "question3": {{ ... }},
  "question4": {{ ... }},
  "question5": {{ ... }}
}}
"""

        eval_response = llm.invoke([{"role": "user", "content": question_prompt}])
        content = eval_response.content.strip()

        match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", content, re.DOTALL)
        json_str = match.group(1).strip() if match else content.strip()

        try:
            evaluation_questions = json.loads(json_str)
        except Exception as e:
            print("Failed to parse evaluation questions:\n", content)
            raise e

        enriched_modules.append({
            "title": mod["title"],
            "objective": mod["objective"],
            "subtopics": enriched_subtopics,
            "evaluation": evaluation_questions
        })

    return enriched_modules

def edit_roadmap(roadmap, instructions):
    llm = GeminiLLM(api_key=os.getenv("GEMINI_API_KEY"))

    prompt = f'''
    You are an educational AI assistant. Follow the instructions given and modify the roadmap given below accordingly.
    Respond ONLY with a valid JSON object of the roadmap in the exact same format as it was given.

    Instructions: {instructions}
    Roadmap: {roadmap}
    '''

    response = llm.invoke([{"role": "user", "content": prompt}])
    content = response.content.strip()

    # Try to extract a JSON object from the response
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", content, re.DOTALL)
    json_str = match.group(1).strip() if match else content

    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        try:
            cleaned = re.sub(r"```(?:json)?|```", "", json_str).strip()
            print("Cleaned content before ast.literal_eval:\n", cleaned)
            return ast.literal_eval(cleaned)
        except Exception as e:
            print("\nFailed to parse LLM output:", content)
            raise e
