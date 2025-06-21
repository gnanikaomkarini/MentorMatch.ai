import assemblyai as aai
from dotenv import load_dotenv
import os
from gtts import gTTS

load_dotenv()

aai.settings.api_key = os.getenv("ASSEMBLYAI_API_KEY")

def transcribe(audio_file):
    transcript = aai.Transcriber().transcribe(audio_file)

    if transcript.status == "error":
        raise RuntimeError(f"Transcription failed: {transcript.error}")

    return transcript.text

def tts(text):
    tts = gTTS(text)
    tts.save('ai-speech.mp3')
