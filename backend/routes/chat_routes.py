from flask import Blueprint, request, jsonify, g
from middleware.auth_middleware import token_required
from services.chat_service import send_message, get_chats

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/send', methods=['POST'])
@token_required
def send_chat_message():
    data = request.get_json()
    receiver_id = data.get('receiver_id')
    content = data.get('content')
    sender_id = str(g.current_user['_id'])
    if not receiver_id or not content:
        return jsonify({'message': 'receiver_id and content are required'}), 400
    msg = send_message(sender_id, receiver_id, content)
    return jsonify({'message': 'Message sent', 'data': msg}), 201

@chat_bp.route('/get/<other_id>/<int:page>', methods=['GET'])
@token_required
def get_chat_messages(other_id, page):
    user_id = str(g.current_user['_id'])
    data = get_chats(user_id, other_id, page)
    return jsonify(data), 200
