from pymongo import MongoClient
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
import os
from datetime import datetime

# MongoDB connection
client = MongoClient(os.environ.get('MONGO_URI', 'mongodb://localhost:27017'))
db = client[os.environ.get('DB_NAME', 'mentor_match')]
users_collection = db.users

class UserModel:
    @staticmethod
    def create_user(user_data):
        """Create a new user in the database"""
        user_data['created_at'] = datetime.utcnow()
        user_data['updated_at'] = datetime.utcnow()

        # Set default values based on role
        if user_data['role'] == 'mentor':
            user_data.setdefault('mentees', [])
            user_data.setdefault('profile', {
                'skills': [],
                'experience': '',
                'mentoring_style': '',
                'availability': [],
                'languages': [],
                'bio': '',
                'profile_picture': ''
            })
        else:  # mentee
            user_data.setdefault('mentors', [])
            user_data.setdefault('profile', {
                'goals': [],
                'learning_style': '',
                'availability': [],
                'languages': [],
                'bio': '',
                'profile_picture': '',
                'experience_level': 'beginner'
            })

        result = users_collection.insert_one(user_data)
        return users_collection.find_one({'_id': result.inserted_id})

    @staticmethod
    def get_user_by_email(email):
        """Get user by email"""
        return users_collection.find_one({'email': email})

    @staticmethod
    def get_user_by_email_with_auth(email):
        """Get user by email including password hash"""
        return users_collection.find_one({'email': email})

    @staticmethod
    def get_user_by_id(user_id):
        """Get user by ID"""
        try:
            return users_collection.find_one({'_id': ObjectId(user_id)})
        except:
            return None

    @staticmethod
    def update_user(user_id, update_data):
        """Update user data"""
        update_data['updated_at'] = datetime.utcnow()
        return users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': update_data}
        )

    @staticmethod
    def delete_user(user_id):
        """Delete user"""
        return users_collection.delete_one({'_id': ObjectId(user_id)})
    
    @staticmethod
    def get_all_mentors():
        """Get all users with role 'mentor'"""
        return list(users_collection.find({'role': 'mentor'}))


# Create indexes for better performance
users_collection.create_index('email', unique=True)
users_collection.create_index('username', unique=True)
