from flask import Blueprint
from controllers.auth_controller import AuthController
from middleware.auth_middleware import token_required

auth_bp = Blueprint('auth', __name__)

# Authentication routes
auth_bp.route('/register', methods=['POST'])(AuthController.register)
auth_bp.route('/login', methods=['POST'])(AuthController.login)
auth_bp.route('/logout', methods=['POST'])(AuthController.logout)

@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    return AuthController.get_profile(current_user)

@auth_bp.route('/profile/update', methods=['POST'])
@token_required
def update_profile(current_user):
    return AuthController.update_profile(current_user)

@auth_bp.route('/health', methods=['GET'])
def health_check():
    return {'status': 'Authentication service is running'}, 200
