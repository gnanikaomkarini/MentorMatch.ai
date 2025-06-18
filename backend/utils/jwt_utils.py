import jwt
import os
from datetime import datetime, timedelta
from utils.custom_error import CustomError

class JWTUtils:
    @staticmethod
    def generate_token(user_data):
        """Generate JWT token"""
        payload = {
            'user_id': str(user_data['_id']),
            'email': user_data['email'],
            'username': user_data['username'],
            'role': user_data['role'],
            'exp': datetime.utcnow() + timedelta(days=1),  # 1 day expiration
            'iat': datetime.utcnow()
        }

        token = jwt.encode(
            payload,
            os.environ.get('JWT_SECRET_KEY', 'your-secret-key'),
            algorithm='HS256'
        )

        return token

    @staticmethod
    def verify_token(token):
        """Verify JWT token"""
        try:
            payload = jwt.decode(
                token,
                os.environ.get('JWT_SECRET_KEY', 'your-secret-key'),
                algorithms=['HS256']
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise CustomError("Token has expired", 401)
        except jwt.InvalidTokenError:
            raise CustomError("Invalid token", 401)
