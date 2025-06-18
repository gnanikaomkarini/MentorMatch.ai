from flask import Blueprint, request, jsonify
import datetime
from bson.objectid import ObjectId

from database.db import chats, users, notifications
from middleware.auth_middleware import token_required

chat_bp = Blueprint('chats', __name__)

@chat_bp.route('/conversations', methods=['GET'])
@token_required
def get_conversations(current_user):
    user_id = str(current_user['_id'])
    
    # Get all conversations where user is a participant
    conversations = list(chats.find({
        '$or': [
            {'mentor_id': user_id},
            {'mentee_id': user_id}
        ]
    }).sort('last_message_at', -1))
    
    # Enhance conversations with user details
    for conv in conversations:
        conv['_id'] = str(conv['_id'])
        
        # Get other user details
        other_user_id = conv['mentee_id'] if user_id == conv['mentor_id'] else conv['mentor_id']
        other_user = users.find_one({'_id': ObjectId(other_user_id)}, {
            'username': 1,
            'profile.name': 1,
            'profile.profile_picture': 1
        })
        
        if other_user:
            conv['other_user'] = {
                'id': other_user_id,
                'username': other_user['username'],
                'name': other_user['profile'].get('name', ''),
                'profile_picture': other_user['profile'].get('profile_picture', '')
            }
    
    return jsonify(conversations), 200

@chat_bp.route('/conversation/<user_id>', methods=['GET'])
@token_required
def get_or_create_conversation(current_user, user_id):
    current_user_id = str(current_user['_id'])
    
    try:
        # Check if other user exists
        other_user = users.find_one({'_id': ObjectId(user_id)})
        
        if not other_user:
            return jsonify({'message': 'User not found'}), 404
        
        # Determine mentor and mentee IDs
        mentor_id = current_user_id if current_user['role'] == 'mentor' else user_id
        mentee_id = current_user_id if current_user['role'] == 'mentee' else user_id
        
        # Check if conversation already exists
        conversation = chats.find_one({
            'mentor_id': mentor_id,
            'mentee_id': mentee_id
        })
        
        if not conversation:
            # Create new conversation
            new_conversation = {
                'mentor_id': mentor_id,
                'mentee_id': mentee_id,
                'messages': [],
                'created_at': datetime.datetime.utcnow(),
                'last_message_at': datetime.datetime.utcnow()
            }
            
            result = chats.insert_one(new_conversation)
            conversation = chats.find_one({'_id': result.inserted_id})
        
        conversation['_id'] = str(conversation['_id'])
        
        # Get other user details
        conversation['other_user'] = {
            'id': user_id,
            'username': other_user['username'],
            'name': other_user['profile'].get('name', ''),
            'profile_picture': other_user['profile'].get('profile_picture', '')
        }
        
        return jsonify(conversation), 200
    except:
        return jsonify({'message': 'Invalid user ID'}), 400

@chat_bp.route('/conversation/<conversation_id>/messages', methods=['GET'])
@token_required
def get_messages(current_user, conversation_id):
    user_id = str(current_user['_id'])
    
    try:
        # Get conversation
        conversation = chats.find_one({'_id': ObjectId(conversation_id)})
        
        if not conversation:
            return jsonify({'message': 'Conversation not found'}), 404
        
        # Check if user is a participant
        if conversation['mentor_id'] != user_id and conversation['mentee_id'] != user_id:
            return jsonify({'message': 'Unauthorized'}), 403
        
        # Return messages
        return jsonify(conversation['messages']), 200
    except:
        return jsonify({'message': 'Invalid conversation ID'}), 400

@chat_bp.route('/conversation/<conversation_id>/messages', methods=['POST'])
@token_required
def send_message(current_user, conversation_id):
    user_id = str(current_user['_id'])
    data = request.get_json()
    
    content = data.get('content')
    
    if not content:
        return jsonify({'message': 'Message content is required'}), 400
    
    try:
        # Get conversation
        conversation = chats.find_one({'_id': ObjectId(conversation_id)})
        
        if not conversation:
            return jsonify({'message': 'Conversation not found'}), 404
        
        # Check if user is a participant
        if conversation['mentor_id'] != user_id and conversation['mentee_id'] != user_id:
            return jsonify({'message': 'Unauthorized'}), 403
        
        # Create message
        message = {
            'sender_id': user_id,
            'content': content,
            'timestamp': datetime.datetime.utcnow(),
            'read': False
        }
        
        # Add message to conversation
        chats.update_one(
            {'_id': ObjectId(conversation_id)},
            {
                '$push': {'messages': message},
                '$set': {'last_message_at': datetime.datetime.utcnow()}
            }
        )
        
        # Create notification for other user
        other_user_id = conversation['mentee_id'] if user_id == conversation['mentor_id'] else conversation['mentor_id']
        
        notification = {
            'type': 'new_message',
            'from_user_id': user_id,
            'to_user_id': other_user_id,
            'from_username': current_user['username'],
            'conversation_id': conversation_id,
            'message_preview': content[:50] + ('...' if len(content) > 50 else ''),
            'created_at': datetime.datetime.utcnow(),
            'read': False
        }
        
        notifications.insert_one(notification)
        
        return jsonify({
            'message': 'Message sent',
            'message_data': message
        }), 201
    except:
        return jsonify({'message': 'Invalid conversation ID'}), 400

@chat_bp.route('/conversation/<conversation_id>/read', methods=['POST'])
@token_required
def mark_as_read(current_user, conversation_id):
    user_id = str(current_user['_id'])
    
    try:
        # Get conversation
        conversation = chats.find_one({'_id': ObjectId(conversation_id)})
        
        if not conversation:
            return jsonify({'message': 'Conversation not found'}), 404
        
        # Check if user is a participant
        if conversation['mentor_id'] != user_id and conversation['mentee_id'] != user_id:
            return jsonify({'message': 'Unauthorized'}), 403
        
        # Mark all messages from the other user as read
        chats.update_one(
            {'_id': ObjectId(conversation_id)},
            {'$set': {'messages.$[elem].read': True}},
            array_filters=[{'elem.sender_id': {'$ne': user_id}}]
        )
        
        return jsonify({'message': 'Messages marked as read'}), 200
    except:
        return jsonify({'message': 'Invalid conversation ID'}), 400
