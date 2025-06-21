
from utils.gemini import GeminiLLM
from dotenv import load_dotenv
import os

load_dotenv()

def generate_next_question(instructions, history, goal):
    messages = []
    llm = GeminiLLM(api_key=os.getenv("GEMINI_API_KEY"))

    system_prompt = f"""
You are a professional AI interviewer.
Instructions: {instructions}

Your job is to ask questions, one at a time, and guide the conversation naturally.
You must:
- Ask follow-up questions based on user's last answer if possible.
- If nothing to follow up on, cover the next topic from the list.
- End the interview politely after about 4-5 questions.

Goal of the mentee giving the interviw is to learn: {goal}.
"""
    messages.append({"role": "system", "content": system_prompt.strip()})

    if not history:
        intro = "Hello! I'm your AI interviewer. Could you introduce yourself?"
        return intro

    messages.append({"role": "user", "content": "Here's the conversation so far:"})

    messages.append({"role": "user", "content": history})
    questions = history.count('"question":')
    if questions >= 5:
        return "Thank you for taking this interview. You will receive feeback from your mentor soon."
    messages.append({"role": "user", "content": "What would be your next question?"})

    response = llm.invoke(messages)
    return response.content


# theme = "AI in Healthcare"
# instructions = "Keep it formal and technical."
# additional_topics = ["ethical concerns", "AI diagnostics", "patient data privacy"]

# history = '''
#     {"question": "What motivated you to work in healthcare AI?", "answer": "I saw how AI can help doctors make faster decisions."},
#     {"question": "Can you give an example of such a decision?", "answer": "Like predicting the risk of stroke from imaging data."}
# '''

# next_q = generate_next_question(theme, instructions, history, additional_topics)
# print(next_q)
