import os
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set OpenAI API key
openai.api_key = os.environ.get('OPENAI_API_KEY')

def match_mentor_mentee(mentee_skills, mentee_languages, mentee_experience):
    """
    Match mentors with mentees using AI.
    
    Args:
        mentee_skills (list): Skills the mentee wants to learn
        mentee_languages (list): Languages the mentee is comfortable with
        mentee_experience (str): Experience level of the mentee
        
    Returns:
        list: List of mentor matches with scores
    """
    # In a real implementation, this would query the database for mentors
    # and use AI to rank them based on compatibility
    
    # For now, we'll simulate the matching process
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are an AI mentor matching system. Your task is to analyze the mentee's skills, languages, and experience level and provide a matching score for potential mentors."},
            {"role": "user", "content": f"Mentee wants to learn: {', '.join(mentee_skills)}. Languages: {', '.join(mentee_languages)}. Experience level: {mentee_experience}. Generate a JSON array of 5 potential mentor matches with their skills, languages, and a matching score from 0-100."}
        ]
    )
    
    # Parse the response and return the matches
    # In a real implementation, this would be more robust
    try:
        import json
        content = response.choices[0].message.content
        # Extract JSON from the response
        start_idx = content.find('[')
        end_idx = content.rfind(']') + 1
        json_str = content[start_idx:end_idx]
        matches = json.loads(json_str)
        return matches
    except:
        # Fallback to a simple response if parsing fails
        return [
            {
                "mentor_id": "sample_id_1",
                "name": "John Doe",
                "skills": mentee_skills,
                "languages": mentee_languages,
                "match_score": 95
            },
            {
                "mentor_id": "sample_id_2",
                "name": "Jane Smith",
                "skills": mentee_skills,
                "languages": mentee_languages,
                "match_score": 85
            }
        ]

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
