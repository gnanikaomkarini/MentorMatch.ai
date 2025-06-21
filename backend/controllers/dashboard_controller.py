from flask import jsonify
from bson.objectid import ObjectId
from models.user import UserModel
from database.db import users

def convert_object_ids(obj):
    """Recursively convert all ObjectId instances in a document to strings."""
    if isinstance(obj, dict):
        return {k: convert_object_ids(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_object_ids(item) for item in obj]
    elif isinstance(obj, ObjectId):
        return str(obj)
    else:
        return obj

class DashboardController:
    @staticmethod
    def get_dashboard(current_user):
        user = UserModel.get_user_by_id(current_user["_id"])
        if not user:
            return jsonify({"message": "User not found"}), 404

        user = convert_object_ids(user)  # Safe recursive conversion

        return jsonify({"user": user}), 200