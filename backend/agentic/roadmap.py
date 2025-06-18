import ast
import os
import re
import json
import requests
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage
from utils.gemini import GeminiLLM 

load_dotenv()
llm = GeminiLLM(api_key=os.getenv("GEMINI_API_KEY"))
SERPER_API_KEY = os.getenv("SERPER_API_KEY")

def get_modules_with_subtopics(topic: str, llm) -> list:
    prompt = f"""
Break down the topic '{topic}' into 6–8 modules. Each module should contain:
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
    response = llm.invoke([HumanMessage(content=prompt)])
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

def generate_roadmap(topic: str, llm) -> dict:
    modules = get_modules_with_subtopics(topic, llm)

    enriched_modules = []
    for mod in modules:
        enriched_subtopics = []
        for sub in mod["subtopics"]:
            resources = search_resources(f"{sub} {topic} site:youtube.com OR site:coursera.org OR free learning")
            enriched_subtopics.append({
                "title": sub,
                "resources": resources
            })

        enriched_modules.append({
            "title": mod["title"],
            "objective": mod["objective"],
            "subtopics": enriched_subtopics,
            "evaluation": {
                "type": "questionnaire",
                "status": "pending"
            }
        })

    roadmap = {
        "_id": "r001",
        "menteeId": "u123",
        "goal": topic,
        "status": "in-progress",
        "durationWeeks": 8,
        "approvalStatus": {
            "mentorId": "u456",
            "status": "pending",
            "comments": ""
        },
        "interviewTrigger": {
            "type": "progress_based",
            "triggerPoint": "50%"
        },
        "modules": enriched_modules
    }

    print(json.dumps(roadmap, indent=2))
    return roadmap

if __name__ == "__main__":
    generate_roadmap("Generative AI", llm)