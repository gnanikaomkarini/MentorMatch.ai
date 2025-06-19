from flask import request, jsonify, make_response, g
from services.auth_service import AuthService
from utils.jwt_utils import JWTUtils
from utils.custom_error import CustomError
from datetime import datetime, timedelta

# Moved flask.g import to the top

class AuthController:
    @staticmethod
    def register():
        """Register new user"""
        try:
            data = request.get_json()

            # Extract required fields
            name = data.get('name')
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            role = data.get('role' , "")
            profile_data = data.get('profile', {})

            # Register user
            # AuthService.register now returns an API-ready dictionary with string IDs and ISO dates
            user_from_service = AuthService.register(name, username, email, password, role, profile_data)

            # Generate JWT token
            token = JWTUtils.generate_token(user_from_service)

            # Create response
            api_user_object = {
                'id': user_from_service['_id'], # _id is already a string
                'name': user_from_service['name'],
                'email': user_from_service['email'],
                'username': user_from_service['username'],
                'role': user_from_service['role'],
                'profile': user_from_service['profile'],
                'created_at': user_from_service.get('created_at') # Already ISO string or None
            }
            if user_from_service['role'] == 'mentor':
                api_user_object['mentees'] = user_from_service.get('mentees', [])
            elif user_from_service['role'] == 'mentee':
                api_user_object['mentors'] = user_from_service.get('mentors', [])

            response_data = {
                'message': 'User registered successfully',
                'user': api_user_object
            }

            # Create response with cookie
            response = make_response(jsonify(response_data), 201)
            response.set_cookie(
                'auth_token',
                token,
                max_age=timedelta(days=1),
                httponly=True,
                secure=True,  # Set to True in production with HTTPS
                samesite='Lax'
            )

            return response

        except CustomError as e:
            return jsonify({'error': e.message}), e.status_code
        except Exception as e:
            return jsonify({'error': 'Registration failed', 'details': str(e)}), 500

    @staticmethod
    def login():
        """Login user"""
        try:
            data = request.get_json()

            email = data.get('email')
            password = data.get('password')
            role = data.get('role')

            # Login user
            # AuthService.login now returns an API-ready dictionary with string IDs and ISO dates
            user_from_service = AuthService.login(email, password, role)

            # Generate JWT token
            token = JWTUtils.generate_token(user_from_service)

            # Create response
            api_user_object = {
                'id': user_from_service['_id'], # _id is already a string
                'name': user_from_service['name'],
                'email': user_from_service['email'],
                'username': user_from_service['username'],
                'role': user_from_service['role'],
                'profile': user_from_service['profile'],
                'created_at': user_from_service.get('created_at') # Already ISO string or None
            }
            if user_from_service['role'] == 'mentor':
                api_user_object['mentees'] = user_from_service.get('mentees', [])
            elif user_from_service['role'] == 'mentee':
                api_user_object['mentors'] = user_from_service.get('mentors', [])

            response_data = {
                'message': 'Login successful',
                'user': api_user_object
            }

            # Create response with cookie
            response = make_response(jsonify(response_data), 200)
            response.set_cookie(
                'auth_token',
                token,
                max_age=timedelta(days=1),
                httponly=True,
                secure=True,  # Set to True in production with HTTPS
                samesite='Lax'
            )

            return response

        except CustomError as e:
            return jsonify({'error': e.message}), e.status_code
        except Exception as e:
            return jsonify({'error': 'Login failed', 'details': str(e)}), 500

    @staticmethod
    def logout():
        """Logout user"""
        try:
            response = make_response(jsonify({'message': 'Logout successful'}), 200)
            response.set_cookie(
                'auth_token',
                '',
                expires=0,
                httponly=True,
                secure=True,  # Set to True in production with HTTPS
                samesite='Lax'
            )
            return response

        except Exception as e:
            return jsonify({'error': 'Logout failed', 'details': str(e)}), 500

    @staticmethod
    def get_profile():
        """Get current user profile"""
        try:
            # g.current_user is set by the token_required decorator
            # This is the raw user object from the database
            user_db_object = g.current_user

            # Serialize the user object for the response
            api_user_object = {
                'id': str(user_db_object['_id']),
                'name': user_db_object['name'],
                'email': user_db_object['email'],
                'username': user_db_object['username'],
                'role': user_db_object['role'],
                'profile': user_db_object.get('profile', {}),
                'created_at': user_db_object['created_at'].isoformat() if user_db_object.get('created_at') else None
            }

            if user_db_object['role'] == 'mentor':
                mentees_ids = user_db_object.get('mentees', [])
                api_user_object['mentees'] = [str(m_id) for m_id in mentees_ids]
            elif user_db_object['role'] == 'mentee':
                mentors_ids = user_db_object.get('mentors', [])
                api_user_object['mentors'] = [str(m_id) for m_id in mentors_ids]

            return jsonify({'user': api_user_object}), 200

        except Exception as e:
            return jsonify({'error': 'Failed to get profile', 'details': str(e)}), 500
