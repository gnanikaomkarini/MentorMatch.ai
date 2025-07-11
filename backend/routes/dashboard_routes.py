from flask import Blueprint, jsonify
from middleware.auth_middleware import token_required
from database.db import users, roadmaps, meetings, messages
from bson.objectid import ObjectId
import datetime

dashboard_bp = Blueprint('dashboard', __name__)

def get_roadmap_and_progress(mentee_id):
    # Handle both field naming conventions
    roadmap = roadmaps.find_one({
        '$or': [
            {'menteeId': ObjectId(mentee_id)},
            {'menteeId': mentee_id},
            {'mentee_id': mentee_id}
        ]
    })
    
    progress = 0
    roadmap_id = None
    roadmap_title = None
    
    if roadmap:
        roadmap_id = str(roadmap['_id'])
        roadmap_title = roadmap.get('goal') or roadmap.get('title') or "Learning Roadmap"
        
        # Calculate progress: count completed resources vs total resources
        total_resources = 0
        completed_resources = 0
        for module in roadmap.get('modules', []):
            for subtopic in module.get('subtopics', []):
                for resource in subtopic.get('resources', []):
                    total_resources += 1
                    if resource.get('completed'):
                        completed_resources += 1
        progress = int((completed_resources / total_resources) * 100) if total_resources > 0 else 0
    
    return roadmap_id, roadmap_title, progress

@dashboard_bp.route('/mentee', methods=['GET'])
@token_required
def mentee_dashboard(current_user):
    if current_user['role'] != 'mentee':
        return jsonify({'message': 'Only mentees can access this endpoint'}), 403

    user_id = str(current_user['_id'])
    mentee = users.find_one({'_id': ObjectId(user_id)})

    # Get mentor info (first mentor) - handle both ObjectId and string formats
    mentor = None
    mentor_id = None
    if mentee.get('mentors'):
        mentor_id_raw = mentee['mentors'][0]
        mentor_id = str(mentor_id_raw) if isinstance(mentor_id_raw, ObjectId) else mentor_id_raw
        mentor_doc = users.find_one({'_id': ObjectId(mentor_id)})
        if mentor_doc:
            mentor = {
                'id': str(mentor_doc['_id']),
                'name': mentor_doc.get('name')
            }

    # Get roadmap details and progress
    roadmap_id, roadmap_title, progress = get_roadmap_and_progress(user_id)

    # Get next upcoming meeting with this mentor
    upcoming_meeting = None
    if mentor_id:
        now = datetime.datetime.utcnow()
        meeting = meetings.find_one(
            {
                'mentor_id': mentor_id,
                'mentee_id': user_id,
                'start_time': {'$gte': now},
                'status': 'scheduled'
            },
            sort=[('start_time', 1)]
        )
        if meeting:
            upcoming_meeting = {
                'id': str(meeting['_id']),
                'title': meeting.get('title'),
                'date': meeting['start_time'].strftime('%B %d, %Y'),
                'time': f"{meeting['start_time'].strftime('%I:%M %p')} - {meeting['end_time'].strftime('%I:%M %p')}"
            }

    # Get last message between mentee and mentor
    last_msg = None
    if mentor_id:
        msg = messages.find_one(
            {
                '$or': [
                    {'sender_id': user_id, 'receiver_id': mentor_id},
                    {'sender_id': mentor_id, 'receiver_id': user_id}
                ]
            },
            sort=[('timestamp', -1)]
        )
        if msg:
            last_msg = {
                'id': str(msg['_id']),
                'sender_id': msg['sender_id'],
                'content': msg.get('content', ''),
                'time': msg['timestamp'].isoformat() if msg.get('timestamp') else ''
            }

    return jsonify({
        'mentor': mentor,
        'progress': progress,
        'roadmap_id': roadmap_id,  # This can be None if no roadmap exists
        'roadmap_title': roadmap_title,
        'upcoming_meeting': upcoming_meeting,
        'last_message': last_msg,
        'user': {
            'name': mentee.get('name'),
            'email': mentee.get('email')
        }
    }), 200

@dashboard_bp.route('/mentor', methods=['GET'])
@token_required
def mentor_dashboard(current_user):
    if current_user['role'] != 'mentor':
        return jsonify({'message': 'Only mentors can access this endpoint'}), 403

    user_id = str(current_user['_id'])
    mentor = users.find_one({'_id': ObjectId(user_id)})
    mentee_ids = mentor.get('mentees', [])

    mentees_data = []
    for mentee_id in mentee_ids:
        # Handle both ObjectId and string formats
        mentee_id_str = str(mentee_id) if isinstance(mentee_id, ObjectId) else mentee_id
        mentee = users.find_one({'_id': ObjectId(mentee_id_str)})
        if not mentee:
            continue
        
        roadmap_id, roadmap_title, progress = get_roadmap_and_progress(mentee_id_str)

        # Get last message (if sent by mentee)
        last_msg = messages.find_one(
            {
                '$or': [
                    {'sender_id': mentee_id_str, 'receiver_id': user_id},
                    {'sender_id': user_id, 'receiver_id': mentee_id_str}
                ]
            },
            sort=[('timestamp', -1)]
        )
        last_message = None
        if last_msg and last_msg.get('sender_id') == mentee_id_str:
            last_message = {
                'id': str(last_msg['_id']),
                'content': last_msg.get('content', ''),
                'time': last_msg['timestamp'].isoformat() if last_msg.get('timestamp') else ''
            }

        # Get next upcoming meeting
        now = datetime.datetime.utcnow()
        meeting = meetings.find_one(
            {
                'mentor_id': user_id,
                'mentee_id': mentee_id_str,
                'start_time': {'$gte': now},
                'status': 'scheduled'
            },
            sort=[('start_time', 1)]
        )
        upcoming_meeting = None
        if meeting:
            upcoming_meeting = {
                'id': str(meeting['_id']),
                'title': meeting.get('title'),
                'date': meeting['start_time'].strftime('%B %d, %Y'),
                'time': f"{meeting['start_time'].strftime('%I:%M %p')} - {meeting['end_time'].strftime('%I:%M %p')}"
            }

        mentees_data.append({
            'id': mentee_id_str,
            'name': mentee.get('name'),
            'progress': progress,
            'roadmap_id': roadmap_id,  # This can be None if no roadmap exists
            'roadmap_title': roadmap_title,
            'last_message': last_message,
            'upcoming_meeting': upcoming_meeting
        })

    return jsonify({
        'mentees': mentees_data,
        'user': {
            'name': mentor.get('name'),
            'email': mentor.get('email')
        }
    }), 200

