from flask import Blueprint
from middleware.auth_middleware import token_required
from controllers.dashboard_controller import DashboardController

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/", methods=["GET"])
@token_required
def dashboard_home():
    return DashboardController.get_dashboard()

@dashboard_bp.route("/user/<string:user_id>", methods=["GET"])
@token_required
def get_user_by_id(current_user, user_id):
    return DashboardController.get_user_by_id(user_id)

