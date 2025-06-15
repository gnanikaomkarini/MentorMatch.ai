from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import os
from bson.objectid import ObjectId

from database.db import users
from middleware.auth_middleware import token_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    
    # Check if user already exists
    if users.find_one({'email': data['email']}):
        return jsonify({'message': 'User already exists'}), 409
    
    # Hash the password
    hashed_password = generate_password_hash(data['password'])
    
    # Create new user
    new_user = {
        'email': data['email'],
        'password': hashed_password,
        'username': data['username'],
        'role': data['role'],  # 'mentor' or 'mentee'
        'created_at': datetime.datetime.utcnow(),
        'profile': {
            'name': data.get('name', ''),
            'bio': data.get('bio', ''),
            'profile_picture': data.get('profile_picture', ''),
            'languages': data.get('languages', []),
            'skills': data.get('skills', []),  # Skills they know (mentor) or want to learn (mentee)
            'experience_level': data.get('experience_level', 'beginner')
        },
        'connections': {
            'mentors': [] if data['role'] == 'mentee' else None,
            'mentees': [] if data['role'] == 'mentor' else None
        }
    }
    
    # Insert user into database
    result = users.insert_one(new_user)
    
    # Generate JWT token
    token = jwt.encode({
        'user_id': str(result.inserted_id),
        'email': data['email'],
        'role': data['role'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30)
    }, os.environ.get('JWT_SECRET_KEY'), algorithm='HS256')
    
    return jsonify({
        'message': 'User created successfully',
        'token': token,
        'user_id': str(result.inserted_id),
        'role': data['role']
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Find user by email
    user = users.find_one({'email': data['email']})
    
    if not user:
        return jsonify({'message': 'Invalid credentials'}), 401
    
    # Check password
    if check_password_hash(user['password'], data['password']):
        # Generate JWT token
        token = jwt.encode({
            'user_id': str(user['_id']),
            'email': user['email'],
            'role': user['role'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30)
        }, os.environ.get('JWT_SECRET_KEY'), algorithm='HS256')
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user_id': str(user['_id']),
            'role': user['role']
        }), 200
    
    return jsonify({'message': 'Invalid credentials'}), 401

@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    # Remove sensitive information
    user_data = {
        'id': str(current_user['_id']),
        'email': current_user['email'],
        'username': current_user['username'],
        'role': current_user['role'],
        'profile': current_user['profile'],
        'connections': current_user['connections']
    }
    
    return jsonify(user_data), 200
