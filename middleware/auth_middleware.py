from flask import request, jsonify
from functools import wraps
import jwt
import os
from bson.objectid import ObjectId

from database.db import users

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check if token is in headers
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            # Decode token
            data = jwt.decode(token, os.environ.get('JWT_SECRET_KEY'), algorithms=['HS256'])
            current_user = users.find_one({'_id': ObjectId(data['user_id'])})
            
            if not current_user:
                return jsonify({'message': 'User not found'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

def mentor_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user['role'] != 'mentor':
            return jsonify({'message': 'Mentor access required'}), 403
        return f(current_user, *args, **kwargs)
    return decorated

def mentee_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user['role'] != 'mentee':
            return jsonify({'message': 'Mentee access required'}), 403
        return f(current_user, *args, **kwargs)
    return decorated
