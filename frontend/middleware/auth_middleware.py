from functools import wraps
from flask import request, jsonify, g
from utils.jwt_utils import JWTUtils
from utils.custom_error import CustomError
from models.user import UserModel

def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None

        # Check for token in cookies first
        if 'auth_token' in request.cookies:
            token = request.cookies.get('auth_token')
        # Fallback to Authorization header
        elif 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]

        if not token:
            return jsonify({'error': 'Token is missing'}), 401

        try:
            # Verify token
            payload = JWTUtils.verify_token(token)

            # Get current user
            current_user = UserModel.get_user_by_id(payload['user_id'])
            if not current_user:
                return jsonify({'error': 'User not found'}), 401

            # Store user in g for access in route handlers
            g.current_user = current_user

        except CustomError as e:
            return jsonify({'error': e.message}), e.status_code
        except Exception as e:
            return jsonify({'error': 'Token verification failed'}), 401

        return f(*args, **kwargs)

    return decorated_function

def mentor_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not hasattr(g, 'current_user') or g.current_user['role'] != 'mentor':
            return jsonify({'error': 'Mentor access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

def mentee_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not hasattr(g, 'current_user') or g.current_user['role'] != 'mentee':
            return jsonify({'error': 'Mentee access required'}), 403
        return f(*args, **kwargs)
    return decorated_function
