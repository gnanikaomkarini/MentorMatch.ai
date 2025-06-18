import os
import re
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

# YouTube API key
YOUTUBE_API_KEY = os.environ.get('YOUTUBE_API_KEY')

def get_video_id(url):
    """
    Extract the video ID from a YouTube URL.
    
    Args:
        url (str): YouTube URL
        
    Returns:
        str: YouTube video ID
    """
    # Regular expression to extract video ID from various YouTube URL formats
    youtube_regex = r'(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})'
    match = re.search(youtube_regex, url)
    
    if match:
        return match.group(1)
    
    return None

def get_video_transcript(url):
    """
    Get the transcript of a YouTube video.
    
    Args:
        url (str): YouTube URL
        
    Returns:
        str: Video transcript
    """
    video_id = get_video_id(url)
    
    if not video_id:
        raise ValueError("Invalid YouTube URL")
    
    # In a real implementation, this would use the YouTube Data API or a third-party service
    # For now, we'll simulate the process
    
    # This is a placeholder. In a real implementation, you would:
    # 1. Use the YouTube Data API to get captions track
    # 2. Download the captions
    # 3. Parse the captions to get the transcript
    
    # Simulate API call to get transcript
    try:
        # This is a simulated API call
        # In a real implementation, you would use the YouTube API
        response = {
            "transcript": f"This is a simulated transcript for video {video_id}. In a real implementation, this would be the actual transcript of the YouTube video."
        }
        
        return response["transcript"]
    except Exception as e:
        raise Exception(f"Error getting transcript: {str(e)}")
