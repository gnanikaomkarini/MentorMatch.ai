from flask import request, jsonify, make_response
from services.auth_service import AuthService
from utils.jwt_utils import JWTUtils
from utils.custom_error import CustomError
from datetime import datetime, timedelta

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
            user = AuthService.register(name, username, email, password, role, profile_data)

            # Generate JWT token
            token = JWTUtils.generate_token(user)

            # Create response
            response_data = {
                'message': 'User registered successfully',
                'user': {
                    'id': str(user['_id']),
                    'name': user['name'],
                    'email': user['email'],
                    'username': user['username'],
                    'role': user['role'],
                    'profile': user['profile']
                }
            }

            if user['role'] == 'mentor':
                response_data['user']['mentees'] = user.get('mentees', [])
            else:
                response_data['user']['mentors'] = user.get('mentors', [])

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
            user = AuthService.login(email, password, role)

            # Generate JWT token
            token = JWTUtils.generate_token(user)

            # Create response
            response_data = {
                'message': 'Login successful',
                'user': {
                    'id': str(user['_id']),
                    'name': user['name'],
                    'email': user['email'],
                    'username': user['username'],
                    'role': user['role'],
                    'profile': user['profile']
                }
            }

            if user['role'] == 'mentor':
                response_data['user']['mentees'] = user.get('mentees', [])
            else:
                response_data['user']['mentors'] = user.get('mentors', [])

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
            from flask import g
            user = g.current_user

            response_data = {
                'user': {
                    'id': str(user['_id']),
                    'name': user['name'],
                    'email': user['email'],
                    'username': user['username'],
                    'role': user['role'],
                    'profile': user['profile'],
                    'created_at': user['created_at'].isoformat() if user.get('created_at') else None
                }
            }

            if user['role'] == 'mentor':
                response_data['user']['mentees'] = user.get('mentees', [])
            else:
                response_data['user']['mentors'] = user.get('mentors', [])

            return jsonify(response_data), 200

        except Exception as e:
            return jsonify({'error': 'Failed to get profile', 'details': str(e)}), 500
