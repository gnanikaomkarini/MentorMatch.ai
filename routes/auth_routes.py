from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import os
from bson.objectid import ObjectId

from database.db import users
from controllers.auth_controller import AuthController
from middleware.auth_middleware import token_required

auth_bp = Blueprint('auth', __name__)

# Authentication routes
auth_bp.route('/register', methods=['POST'])(AuthController.register)
auth_bp.route('/login', methods=['POST'])(AuthController.login)
auth_bp.route('/logout', methods=['POST'])(AuthController.logout)
auth_bp.route('/profile', methods=['GET'])(token_required(AuthController.get_profile))

# Health check route
@auth_bp.route('/health', methods=['GET'])
def health_check():
    return {'status': 'Authentication service is running'}, 200
