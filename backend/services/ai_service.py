import os
from dotenv import load_dotenv
from typing import List, Optional
from models.user import UserModel
import json
import re
from utils.gemini import GeminiLLM
from utils.roadmap_utils import create_roadmap
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

def generate_interview_questions(skill, level, transcript=None, module=None):
    """
    Generate interview questions using AI.
    
    Args:
        skill (str): Skill to test
        level (str): Experience level
        transcript (str, optional): Video transcript to use as context
        module (str, optional): Specific module to focus on
        
    Returns:
        list: List of interview questions
    """
    context = f"Skill: {skill}, Level: {level}"
    if module:
        context += f", Module: {module}"
    
    if transcript:
        prompt = f"Based on the following transcript and {context}, generate 5 interview questions to test the knowledge. Include both theoretical and practical questions.\n\nTranscript: {transcript[:2000]}..."
    else:
        prompt = f"Generate 5 interview questions to test knowledge of {context}. Include both theoretical and practical questions."
    
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are an AI interview question generator. Your task is to create relevant and challenging questions to test a person's knowledge on a specific skill."},
            {"role": "user", "content": prompt}
        ]
    )
    
    # Parse the response and return the questions
    try:
        content = response.choices[0].message.content
        
        # Extract questions from the response
        import re
        questions = []
        
        # Try to parse numbered questions (1. Question)
        numbered_questions = re.findall(r'\d+\.\s+(.*?)(?=\n\d+\.|\Z)', content, re.DOTALL)
        
        if numbered_questions:
            for q in numbered_questions:
                q = q.strip()
                if q:
                    questions.append({
                        "question": q,
                        "type": "open_ended"
                    })
        else:
            # Fallback to splitting by newlines
            lines = content.split('\n')
            for line in lines:
                line = line.strip()
                if line and not line.startswith('Question') and len(line) > 10:
                    questions.append({
                        "question": line,
                        "type": "open_ended"
                    })
        
        return questions[:5]  # Limit to 5 questions
    except:
        # Fallback to a simple response if parsing fails
        return [
            {
                "question": f"What are the key concepts of {skill}?",
                "type": "open_ended"
            },
            {
                "question": f"Explain how you would implement {skill} in a real-world scenario.",
                "type": "open_ended"
            },
            {
                "question": f"What are the best practices when working with {skill}?",
                "type": "open_ended"
            },
            {
                "question": f"Describe a challenge you faced when using {skill} and how you overcame it.",
                "type": "open_ended"
            },
            {
                "question": f"How would you explain {skill} to someone with no technical background?",
                "type": "open_ended"
            }
        ]
