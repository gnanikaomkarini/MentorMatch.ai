from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId

from database.db import notifications
from middleware.auth_middleware import token_required

notification_bp = Blueprint('notifications', __name__)

@notification_bp.route('/', methods=['GET'])
@token_required
def get_notifications(current_user):
    user_id = str(current_user['_id'])
    
    # Get all notifications for the user
    notification_list = list(notifications.find({
        'to_user_id': user_id
    }).sort('created_at', -1))
    
    # Convert ObjectId to string
    for notification in notification_list:
        notification['_id'] = str(notification['_id'])
        notification['created_at'] = notification['created_at'].isoformat()
    
    return jsonify(notification_list), 200

@notification_bp.route('/unread', methods=['GET'])
@token_required
def get_unread_notifications(current_user):
    user_id = str(current_user['_id'])
    
    # Get unread notifications for the user
    notification_list = list(notifications.find({
        'to_user_id': user_id,
        'read': False
    }).sort('created_at', -1))
    
    # Convert ObjectId to string
    for notification in notification_list:
        notification['_id'] = str(notification['_id'])
        notification['created_at'] = notification['created_at'].isoformat()
    
    return jsonify(notification_list), 200

@notification_bp.route('/count', methods=['GET'])
@token_required
def get_unread_count(current_user):
    user_id = str(current_user['_id'])
    
    # Count unread notifications
    count = notifications.count_documents({
        'to_user_id': user_id,
        'read': False
    })
    
    return jsonify({'count': count}), 200

@notification_bp.route('/<notification_id>/read', methods=['POST'])
@token_required
def mark_as_read(current_user, notification_id):
    user_id = str(current_user['_id'])
    
    try:
        # Get notification
        notification = notifications.find_one({'_id': ObjectId(notification_id)})
        
        if not notification:
            return jsonify({'message': 'Notification not found'}), 404
        
        # Check if user is the recipient
        if notification['to_user_id'] != user_id:
            return jsonify({'message': 'Unauthorized'}), 403
        
        # Mark as read
        notifications.update_one(
            {'_id': ObjectId(notification_id)},
            {'$set': {'read': True}}
        )
        
        return jsonify({'message': 'Notification marked as read'}), 200
    except:
        return jsonify({'message': 'Invalid notification ID'}), 400

@notification_bp.route('/read-all', methods=['POST'])
@token_required
def mark_all_as_read(current_user):
    user_id = str(current_user['_id'])
    
    # Mark all notifications as read
    notifications.update_many(
        {'to_user_id': user_id, 'read': False},
        {'$set': {'read': True}}
    )
    
    return jsonify({'message': 'All notifications marked as read'}), 200
