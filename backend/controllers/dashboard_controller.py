from flask import jsonify
from models import user  # Adjust if named differently

class DashboardController:

    @staticmethod
    def get_dashboard():
        return jsonify({"message": "Dashboard Home"})

    @staticmethod
    def get_user_by_id(user_id):
        user = UserModel.get_user_by_id(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Convert ObjectId to string
        user["_id"] = str(user["_id"])
        return jsonify({"user": user}), 200
