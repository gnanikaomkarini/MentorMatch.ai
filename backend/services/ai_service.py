import os
from dotenv import load_dotenv
from typing import List, Optional
from models.user import UserModel
import json
import re
from utils.gemini import GeminiLLM
from utils.roadmap_utils import create_roadmap, edit_roadmap
from utils.audio_utils import transcribe, tts
from utils.interview_utils import generate_next_question, fetch_feedback

load_dotenv()



def match_mentor_mentee(mentee_skills: List[str], mentee_experience: str) -> Optional[dict]:
    try:
        mentors = UserModel.get_all_mentors()
        if not mentors:
            return None
        mentor_profiles = [
            {
                "id": str(m["_id"]),
                "name": m.get("name"),
                "email": m.get("email"),
                "skills": m.get("profile", {}).get("skills", []),
                "experience": m.get("profile", {}).get("experience", ""),
                "mentoring_style": m.get("profile", {}).get("mentoring_style", ""),
                "languages": m.get("profile", {}).get("languages", []),
                "bio": m.get("profile", {}).get("bio", "")
            }
            for m in mentors
        ]

        messages = [
            {
                "role": "user",
                "content": (
                    f"You are an intelligent mentor-matching assistant.\n\n"
                    f"Given this mentee's skills and experience:\n"
                    f"Skills: {', '.join(mentee_skills)}\n"
                    f"Experience Level: {mentee_experience}\n\n"
                    f"And the following list of mentors:\n"
                    f"{json.dumps(mentor_profiles, indent=2)}\n\n"
                    f"Choose the best match. Respond in this format exactly:\n"
                    f"MENTOR_ID: <mentor_id>\nREASON: <brief reason why they are a good match>"
                )
            }
        ]
        llm = GeminiLLM(api_key=os.getenv("GEMINI_API_KEY"))
        response = llm.invoke(messages)
        match = re.search(r"MENTOR_ID:\s*([a-fA-F0-9]{24})\s*REASON:\s*(.+)", response.content, re.DOTALL)
        if not match:
            print("Failed to parse mentor ID from Gemini response.")
            print(response.content)
            return None

        mentor_id = match.group(1).strip()
        reason = match.group(2).strip()

        mentor = UserModel.get_user_by_id(mentor_id)
        if mentor:
            return {"mentor": mentor_id, "reason": reason}
        else:
            return None
    except Exception as e:
        print(e)
        return None

    
def generate_roadmap(skill):
    return create_roadmap(skill)

def update_roadmap(roadmap, conversation):
    return edit_roadmap(roadmap, conversation)

def generate_interview_questions(audio_path, history_json, goal, theme):
    if audio_path is not None:
        user_answer = transcribe(audio_path)
        history_json = history_json + "Last answer: " + user_answer
    else:
        user_answer = None

    next_question = generate_next_question(theme, history_json, goal)
    tts(next_question)
    return user_answer, next_question

def get_feedback(history_json):
    return fetch_feedback(history_json)