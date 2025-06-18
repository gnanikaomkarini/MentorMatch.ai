from models.user import UserModel
from werkzeug.security import generate_password_hash, check_password_hash
from utils.custom_error import CustomError
import secrets
import hashlib

class AuthService:
    @staticmethod
    def generate_salt():
        """Generate a random salt"""
        return secrets.token_hex(32)

    @staticmethod
    def hash_password(salt, password):
        """Hash password with salt"""
        return hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()

    @staticmethod
    def login(email, password, role):
        """Login user"""
        if not email or not password or not role:
            raise CustomError("Email, password, and role are required", 400)

        # Get user with authentication data
        user = UserModel.get_user_by_email_with_auth(email)

        if not user:
            raise CustomError("Invalid email or password", 401)

        # Check if role matches
        if user['role'] != role:
            raise CustomError("Invalid role for this user", 401)

        # Verify password
        expected_hash = AuthService.hash_password(user['authentication']['salt'], password)

        if user['authentication']['password'] != expected_hash:
            raise CustomError("Invalid email or password", 401)

        # Remove sensitive data before returning
        user_data = {
            '_id': user['_id'],
            'name': user['name'],
            'email': user['email'],
            'username': user['username'],
            'role': user['role'],
            'profile': user['profile'],
            'created_at': user['created_at']
        }

        if user['role'] == 'mentor':
            user_data['mentees'] = user.get('mentees', [])
        else:
            user_data['mentors'] = user.get('mentors', [])

        return user_data

    @staticmethod
    def register(name, username, email, password, role, profile_data=None):
        """Register new user"""
        if not name or not username or not email or not password or not role:
            raise CustomError("All fields are required", 400)

        if role not in ['mentor', 'mentee']:
            raise CustomError("Role must be either 'mentor' or 'mentee'", 400)

        # Check if user already exists
        existing_user = UserModel.get_user_by_email(email)
        if existing_user:
            raise CustomError("User already exists with this email", 409)

        # Generate salt and hash password
        salt = AuthService.generate_salt()
        password_hash = AuthService.hash_password(salt, password)

        # Prepare user data
        user_data = {
            'name': name,
            'username': username,
            'email': email,
            'role': role,
            'authentication': {
                'password': password_hash,
                'salt': salt
            }
        }

        # Add profile data if provided
        if profile_data:
            if role == 'mentor':
                user_data['profile'] = {
                    'skills': profile_data.get('skills', []),
                    'experience': profile_data.get('experience', ''),
                    'mentoring_style': profile_data.get('mentoring_style', ''),
                    'availability': profile_data.get('availability', []),
                    'languages': profile_data.get('languages', []),
                    'bio': profile_data.get('bio', ''),
                    'profile_picture': profile_data.get('profile_picture', '')
                }
            else:  # mentee
                user_data['profile'] = {
                    'goals': profile_data.get('goals', []),
                    'learning_style': profile_data.get('learning_style', ''),
                    'availability': profile_data.get('availability', []),
                    'languages': profile_data.get('languages', []),
                    'bio': profile_data.get('bio', ''),
                    'profile_picture': profile_data.get('profile_picture', ''),
                    'experience_level': profile_data.get('experience_level', 'beginner')
                }

        # Create user
        user = UserModel.create_user(user_data)

        # Remove sensitive data before returning
        user_response = {
            '_id': user['_id'],
            'name': user['name'],
            'email': user['email'],
            'username': user['username'],
            'role': user['role'],
            'profile': user['profile'],
            'created_at': user['created_at']
        }

        if user['role'] == 'mentor':
            user_response['mentees'] = user.get('mentees', [])
        else:
            user_response['mentors'] = user.get('mentors', [])

        return user_response
