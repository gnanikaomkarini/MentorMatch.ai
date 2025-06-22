from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId

from database.db import users, notifications
from middleware.auth_middleware import token_required

user_bp = Blueprint('users', __name__)

@user_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    data = request.get_json()
    
    # Update profile fields
    update_data = {}
    
    if 'name' in data:
        update_data['profile.name'] = data['name']
    if 'bio' in data:
        update_data['profile.bio'] = data['bio']
    if 'profile_picture' in data:
        update_data['profile.profile_picture'] = data['profile_picture']
    if 'languages' in data:
        update_data['profile.languages'] = data['languages']
    if 'skills' in data:
        update_data['profile.skills'] = data['skills']
    if 'experience_level' in data:
        update_data['profile.experience_level'] = data['experience_level']
    
    if update_data:
        users.update_one(
            {'_id': current_user['_id']},
            {'$set': update_data}
        )
    
    return jsonify({'message': 'Profile updated successfully'}), 200

@user_bp.route('/mentors', methods=['GET'])
@token_required
def get_mentors(current_user):
    # Get all mentors
    mentor_list = list(users.find({'role': 'mentor'}, {
        'password': 0,
        'email': 0
    }))
    
    # Convert ObjectId to string
    for mentor in mentor_list:
        mentor['_id'] = str(mentor['_id'])
    
    return jsonify(mentor_list), 200

@user_bp.route('/mentees', methods=['GET'])
@token_required
def get_mentees(current_user):
    if current_user['role'] != 'mentor':
        return jsonify({'message': 'Only mentors can view their mentees'}), 403

    mentee_ids = current_user.get('mentees', [])
    mentees = []
    for mentee_id in mentee_ids:
        mentee = users.find_one({'_id': ObjectId(mentee_id)})
        if mentee:
            mentees.append({
                'id': str(mentee['_id']),
                'name': mentee.get('name', '')
            })
    return jsonify(mentees), 200

@user_bp.route('/mentors/<mentor_id>', methods=['GET'])
@token_required
def get_mentor(current_user, mentor_id):
    try:
        mentor = users.find_one({'_id': ObjectId(mentor_id), 'role': 'mentor'}, {
            'password': 0,
            'email': 0
        })
        
        if not mentor:
            return jsonify({'message': 'Mentor not found'}), 404
        
        mentor['_id'] = str(mentor['_id'])
        return jsonify(mentor), 200
    except:
        return jsonify({'message': 'Invalid mentor ID'}), 400

@user_bp.route('/mentees/<mentee_id>', methods=['GET'])
@token_required
def get_mentee(current_user, mentee_id):
    try:
        mentee = users.find_one({'_id': ObjectId(mentee_id), 'role': 'mentee'}, {
            'password': 0,
            'email': 0
        })
        
        if not mentee:
            return jsonify({'message': 'Mentee not found'}), 404
        
        mentee['_id'] = str(mentee['_id'])
        return jsonify(mentee), 200
    except:
        return jsonify({'message': 'Invalid mentee ID'}), 400

@user_bp.route('/connect/request', methods=['POST'])
@token_required
def request_connection(current_user):
    data = request.get_json()
    target_id = data.get('target_id')
    
    if not target_id:
        return jsonify({'message': 'Target ID is required'}), 400
    
    try:
        target_user = users.find_one({'_id': ObjectId(target_id)})
        
        if not target_user:
            return jsonify({'message': 'Target user not found'}), 404
        
        # Create notification for connection request
        notification = {
            'type': 'connection_request',
            'from_user_id': str(current_user['_id']),
            'to_user_id': target_id,
            'from_username': current_user['username'],
            'from_role': current_user['role'],
            'status': 'pending',
            'created_at': datetime.datetime.utcnow(),
            'read': False
        }
        
        notifications.insert_one(notification)
        
        return jsonify({'message': 'Connection request sent'}), 200
    except:
        return jsonify({'message': 'Invalid target ID'}), 400

@user_bp.route('/connect/accept', methods=['POST'])
@token_required
def accept_connection(current_user):
    data = request.get_json()
    notification_id = data.get('notification_id')
    
    if not notification_id:
        return jsonify({'message': 'Notification ID is required'}), 400
    
    try:
        # Find the notification
        notification = notifications.find_one({'_id': ObjectId(notification_id)})
        
        if not notification:
            return jsonify({'message': 'Notification not found'}), 404
        
        if notification['to_user_id'] != str(current_user['_id']):
            return jsonify({'message': 'Unauthorized'}), 403
        
        # Update notification status
        notifications.update_one(
            {'_id': ObjectId(notification_id)},
            {'$set': {'status': 'accepted', 'read': True}}
        )
        
        # Get the requesting user
        from_user = users.find_one({'_id': ObjectId(notification['from_user_id'])})
        
        # Update connections for both users
        if from_user['role'] == 'mentor' and current_user['role'] == 'mentee':
            # Mentor requested to connect with mentee
            users.update_one(
                {'_id': current_user['_id']},
                {'$addToSet': {'connections.mentors': notification['from_user_id']}}
            )
            users.update_one(
                {'_id': ObjectId(notification['from_user_id'])},
                {'$addToSet': {'connections.mentees': str(current_user['_id'])}}
            )
        elif from_user['role'] == 'mentee' and current_user['role'] == 'mentor':
            # Mentee requested to connect with mentor
            users.update_one(
                {'_id': current_user['_id']},
                {'$addToSet': {'connections.mentees': notification['from_user_id']}}
            )
            users.update_one(
                {'_id': ObjectId(notification['from_user_id'])},
                {'$addToSet': {'connections.mentors': str(current_user['_id'])}}
            )
        
        # Create notification for acceptance
        acceptance_notification = {
            'type': 'connection_accepted',
            'from_user_id': str(current_user['_id']),
            'to_user_id': notification['from_user_id'],
            'from_username': current_user['username'],
            'from_role': current_user['role'],
            'created_at': datetime.datetime.utcnow(),
            'read': False
        }
        
        notifications.insert_one(acceptance_notification)
        
        return jsonify({'message': 'Connection accepted'}), 200
    except:
        return jsonify({'message': 'Invalid notification ID'}), 400

@user_bp.route('/connect/reject', methods=['POST'])
@token_required
def reject_connection(current_user):
    data = request.get_json()
    notification_id = data.get('notification_id')
    
    if not notification_id:
        return jsonify({'message': 'Notification ID is required'}), 400
    
    try:
        # Find the notification
        notification = notifications.find_one({'_id': ObjectId(notification_id)})
        
        if not notification:
            return jsonify({'message': 'Notification not found'}), 404
        
        if notification['to_user_id'] != str(current_user['_id']):
            return jsonify({'message': 'Unauthorized'}), 403
        
        # Update notification status
        notifications.update_one(
            {'_id': ObjectId(notification_id)},
            {'$set': {'status': 'rejected', 'read': True}}
        )
        
        return jsonify({'message': 'Connection rejected'}), 200
    except:
        return jsonify({'message': 'Invalid notification ID'}), 400

@user_bp.route('/connections', methods=['GET'])
@token_required
def get_connections(current_user):
    user_id = str(current_user['_id'])
    role = current_user['role']
    
    connections = []
    
    if role == 'mentor':
        # Get all mentees connected to this mentor
        mentee_ids = current_user['connections']['mentees'] or []
        for mentee_id in mentee_ids:
            mentee = users.find_one({'_id': ObjectId(mentee_id)}, {
                'password': 0,
                'email': 0
            })
            if mentee:
                mentee['_id'] = str(mentee['_id'])
                connections.append(mentee)
    else:
        # Get all mentors connected to this mentee
        mentor_ids = current_user['connections']['mentors'] or []
        for mentor_id in mentor_ids:
            mentor = users.find_one({'_id': ObjectId(mentor_id)}, {
                'password': 0,
                'email': 0
            })
            if mentor:
                mentor['_id'] = str(mentor['_id'])
                connections.append(mentor)
    
    return jsonify(connections), 200
