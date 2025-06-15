from flask import Blueprint, request, jsonify
import datetime
from bson.objectid import ObjectId
import uuid

from database.db import meetings, users, notifications
from middleware.auth_middleware import token_required
from services.google_meet_service import create_google_meet

meeting_bp = Blueprint('meetings', __name__)

@meeting_bp.route('/', methods=['POST'])
@token_required
def schedule_meeting(current_user):
    data = request.get_json()
    
    mentor_id = data.get('mentor_id')
    mentee_id = data.get('mentee_id')
    title = data.get('title')
    description = data.get('description', '')
    start_time = data.get('start_time')
    end_time = data.get('end_time')
    
    if not mentor_id or not mentee_id or not title or not start_time or not end_time:
        return jsonify({'message': 'Missing required fields'}), 400
    
    try:
        # Check if mentor and mentee exist
        mentor = users.find_one({'_id': ObjectId(mentor_id), 'role': 'mentor'})
        mentee = users.find_one({'_id': ObjectId(mentee_id), 'role': 'mentee'})
        
        if not mentor or not mentee:
            return jsonify({'message': 'Mentor or mentee not found'}), 404
        
        # Check if current user is either the mentor or mentee
        user_id = str(current_user['_id'])
        if user_id != mentor_id and user_id != mentee_id:
            return jsonify({'message': 'Unauthorized'}), 403
        
        # Convert string times to datetime objects
        start_datetime = datetime.datetime.fromisoformat(start_time)
        end_datetime = datetime.datetime.fromisoformat(end_time)
        
        # Create Google Meet link
        meeting_link = create_google_meet(title, description, start_datetime, end_datetime, [mentor['email'], mentee['email']])
        
        # Create meeting
        new_meeting = {
            'mentor_id': mentor_id,
            'mentee_id': mentee_id,
            'title': title,
            'description': description,
            'start_time': start_datetime,
            'end_time': end_datetime,
            'meeting_link': meeting_link,
            'meeting_id': str(uuid.uuid4()),
            'status': 'scheduled',
            'created_at': datetime.datetime.utcnow(),
            'created_by': user_id
        }
        
        result = meetings.insert_one(new_meeting)
        
        # Create notification for the other user
        other_user_id = mentee_id if user_id == mentor_id else mentor_id
        
        notification = {
            'type': 'meeting_scheduled',
            'from_user_id': user_id,
            'to_user_id': other_user_id,
            'from_username': current_user['username'],
            'meeting_id': str(result.inserted_id),
            'meeting_title': title,
            'meeting_time': start_time,
            'created_at': datetime.datetime.utcnow(),
            'read': False
        }
        
        notifications.insert_one(notification)
        
        return jsonify({
            'message': 'Meeting scheduled successfully',
            'meeting_id': str(result.inserted_id)
        }), 201
    except ValueError:
        return jsonify({'message': 'Invalid date format'}), 400
    except Exception as e:
        return jsonify({'message': f'Error scheduling meeting: {str(e)}'}), 500

@meeting_bp.route('/', methods=['GET'])
@token_required
def get_meetings(current_user):
    user_id = str(current_user['_id'])
    
    # Get all meetings where user is a participant
    meeting_list = list(meetings.find({
        '$or': [
            {'mentor_id': user_id},
            {'mentee_id': user_id}
        ]
    }).sort('start_time', 1))
    
    # Convert ObjectId to string and format dates
    for meeting in meeting_list:
        meeting['_id'] = str(meeting['_id'])
        meeting['start_time'] = meeting['start_time'].isoformat()
        meeting['end_time'] = meeting['end_time'].isoformat()
        meeting['created_at'] = meeting['created_at'].isoformat()
    
    return jsonify(meeting_list), 200

@meeting_bp.route('/<meeting_id>', methods=['GET'])
@token_required
def get_meeting(current_user, meeting_id):
    user_id = str(current_user['_id'])
    
    try:
        # Get meeting
        meeting = meetings.find_one({'_id': ObjectId(meeting_id)})
        
        if not meeting:
            return jsonify({'message': 'Meeting not found'}), 404
        
        # Check if user is a participant
        if meeting['mentor_id'] != user_id and meeting['mentee_id'] != user_id:
            return jsonify({'message': 'Unauthorized'}), 403
        
        # Convert ObjectId to string and format dates
        meeting['_id'] = str(meeting['_id'])
        meeting['start_time'] = meeting['start_time'].isoformat()
        meeting['end_time'] = meeting['end_time'].isoformat()
        meeting['created_at'] = meeting['created_at'].isoformat()
        
        return jsonify(meeting), 200
    except:
        return jsonify({'message': 'Invalid meeting ID'}), 400

@meeting_bp.route('/<meeting_id>', methods=['PUT'])
@token_required
def update_meeting(current_user, meeting_id):
    user_id = str(current_user['_id'])
    data = request.get_json()
    
    try:
        # Get meeting
        meeting = meetings.find_one({'_id': ObjectId(meeting_id)})
        
        if not meeting:
            return jsonify({'message': 'Meeting not found'}), 404
        
        # Check if user is a participant
        if meeting['mentor_id'] != user_id and meeting['mentee_id'] != user_id:
            return jsonify({'message': 'Unauthorized'}), 403
        
        # Update meeting fields
        update_data = {}
        
        if 'title' in data:
            update_data['title'] = data['title']
        if 'description' in data:
            update_data['description'] = data['description']
        if 'start_time' in data:
            update_data['start_time'] = datetime.datetime.fromisoformat(data['start_time'])
        if 'end_time' in data:
            update_data['end_time'] = datetime.datetime.fromisoformat(data['end_time'])
        if 'status' in data:
            update_data['status'] = data['status']
        
        if update_data:
            meetings.update_one(
                {'_id': ObjectId(meeting_id)},
                {'$set': update_data}
            )
        
        # Create notification for the other user
        other_user_id = meeting['mentee_id'] if user_id == meeting['mentor_id'] else meeting['mentor_id']
        
        notification = {
            'type': 'meeting_updated',
            'from_user_id': user_id,
            'to_user_id': other_user_id,
            'from_username': current_user['username'],
            'meeting_id': meeting_id,
            'meeting_title': meeting['title'],
            'created_at': datetime.datetime.utcnow(),
            'read': False
        }
        
        notifications.insert_one(notification)
        
        return jsonify({'message': 'Meeting updated successfully'}), 200
    except ValueError:
        return jsonify({'message': 'Invalid date format'}), 400
    except:
        return jsonify({'message': 'Invalid meeting ID'}), 400

@meeting_bp.route('/<meeting_id>', methods=['DELETE'])
@token_required
def cancel_meeting(current_user, meeting_id):
    user_id = str(current_user['_id'])
    
    try:
        # Get meeting
        meeting = meetings.find_one({'_id': ObjectId(meeting_id)})
        
        if not meeting:
            return jsonify({'message': 'Meeting not found'}), 404
        
        # Check if user is a participant
        if meeting['mentor_id'] != user_id and meeting['mentee_id'] != user_id:
            return jsonify({'message': 'Unauthorized'}), 403
        
        # Update meeting status to cancelled
        meetings.update_one(
            {'_id': ObjectId(meeting_id)},
            {'$set': {'status': 'cancelled'}}
        )
        
        # Create notification for the other user
        other_user_id = meeting['mentee_id'] if user_id == meeting['mentor_id'] else meeting['mentor_id']
        
        notification = {
            'type': 'meeting_cancelled',
            'from_user_id': user_id,
            'to_user_id': other_user_id,
            'from_username': current_user['username'],
            'meeting_title': meeting['title'],
            'created_at': datetime.datetime.utcnow(),
            'read': False
        }
        
        notifications.insert_one(notification)
        
        return jsonify({'message': 'Meeting cancelled successfully'}), 200
    except:
        return jsonify({'message': 'Invalid meeting ID'}), 400
