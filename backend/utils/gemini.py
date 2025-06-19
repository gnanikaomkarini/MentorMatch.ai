import google.generativeai as genai

class GeminiLLM:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-2.5-flash")

    def invoke(self, messages):
        prompt = "\n".join([m['content'] for m in messages])
        response = self.model.generate_content(prompt)
        return type("LLMResponse", (), {"content": response.text})
