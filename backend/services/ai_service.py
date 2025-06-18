import os
from dotenv import load_dotenv
from typing import List, Optional
from models.user import UserModel
import json
import re
from utils.gemini import GeminiLLM

load_dotenv()



def match_mentor_mentee(mentee_skills: List[str], mentee_experience: str) -> Optional[dict]:
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
        return {"mentor": mentor, "reason": reason}
    else:
        return None

  

def generate_roadmap(skill, experience_level):
    """
    Generate a learning roadmap using AI.
    
    Args:
        skill (str): Skill to learn
        experience_level (str): Experience level of the learner
        
    Returns:
        dict: Roadmap with modules and resources
    """
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are an AI roadmap generator. Your task is to create a comprehensive learning roadmap for a specific skill based on the learner's experience level."},
            {"role": "user", "content": f"Generate a learning roadmap for {skill} at {experience_level} level. Include modules with titles, descriptions, resources, and estimated completion times. Format as JSON."}
        ]
    )
    
    # Parse the response and return the roadmap
    try:
        import json
        import re
        
        content = response.choices[0].message.content
        # Extract JSON from the response
        json_match = re.search(r'```json\n(.*?)\n```', content, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
        else:
            # Try to find JSON without code blocks
            start_idx = content.find('{')
            end_idx = content.rfind('}') + 1
            json_str = content[start_idx:end_idx]
            
        roadmap = json.loads(json_str)
        
        # Ensure each module has a completed flag
        for module in roadmap.get('modules', []):
            module['completed'] = False
            module['completed_at'] = None
            module['interview_id'] = None
            module['interview_completed'] = False
            module['interview_completed_at'] = None
            
        return roadmap
    except:
        # Fallback to a simple response if parsing fails
        return {
            "title": f"Learning {skill} - {experience_level.capitalize()} Level",
            "description": f"A comprehensive roadmap to learn {skill} for {experience_level} level learners.",
            "modules": [
                {
                    "title": "Getting Started with " + skill,
                    "description": "Introduction to the basics of " + skill,
                    "resources": [
                        {"type": "article", "title": "Introduction to " + skill, "url": "#"},
                        {"type": "video", "title": skill + " for Beginners", "url": "#"}
                    ],
                    "estimated_hours": 5,
                    "completed": False,
                    "completed_at": None,
                    "interview_id": None,
                    "interview_completed": False,
                    "interview_completed_at": None
                },
                {
                    "title": "Intermediate " + skill,
                    "description": "Dive deeper into " + skill,
                    "resources": [
                        {"type": "course", "title": "Intermediate " + skill, "url": "#"},
                        {"type": "project", "title": "Build a Simple " + skill + " Project", "url": "#"}
                    ],
                    "estimated_hours": 10,
                    "completed": False,
                    "completed_at": None,
                    "interview_id": None,
                    "interview_completed": False,
                    "interview_completed_at": None
                }
            ]
        }

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
