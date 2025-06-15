from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get MongoDB connection string from environment variables
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'mentor_match')

# Create MongoDB client
client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# Define collections
users = db.users
roadmaps = db.roadmaps
chats = db.chats
meetings = db.meetings
skills = db.skills
languages = db.languages
interview_questions = db.interview_questions
notifications = db.notifications
ai_learning_data = db.ai_learning_data

# Create indexes for better query performance
users.create_index('email', unique=True)
users.create_index('username', unique=True)
roadmaps.create_index([('mentor_id', 1), ('mentee_id', 1)])
chats.create_index([('mentor_id', 1), ('mentee_id', 1)])
meetings.create_index([('mentor_id', 1), ('mentee_id', 1)])
