from flask import Blueprint, request, jsonify, g
from middleware.auth_middleware import token_required
from services.chat_service import send_message, get_chats, get_chat_history

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/send', methods=['POST'])
@token_required
def send_chat_message(current_user):
    data = request.get_json()
    receiver_id = data.get('receiver_id')
    content = data.get('content')
    sender_id = str(current_user['_id'])
    if not receiver_id or not content:
        return jsonify({'message': 'receiver_id and content are required'}), 400
    msg = send_message(sender_id, receiver_id, content)
    return jsonify({'message': 'Message sent', 'data': msg}), 201

@chat_bp.route('/get/<other_id>/<int:page>', methods=['GET'])
@token_required
def get_chat_messages(current_user, other_id, page):
    user_id = str(current_user['_id'])
    data = get_chats(user_id, other_id, page)
    return jsonify(data), 200

@chat_bp.route('/history/<mentee_id>', methods=['GET'])
@token_required
def get_chat_history_api(current_user, mentee_id):
    if current_user['role'] != 'mentor':
        return jsonify({'message': 'Only mentors can access chat history'}), 403
    
    mentor_id = str(current_user['_id'])
    history = get_chat_history(mentor_id, mentee_id)
    return jsonify(history), 200
