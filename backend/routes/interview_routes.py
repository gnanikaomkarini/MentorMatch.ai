from flask import Blueprint, request, jsonify
import datetime
from bson.objectid import ObjectId

from database.db import interview_questions, roadmaps, users, notifications
from middleware.auth_middleware import token_required
from services.ai_service import generate_interview_questions
from services.youtube_service import get_video_transcript

interview_bp = Blueprint('interviews', __name__)

@interview_bp.route('/questions/generate', methods=['POST'])
@token_required
def generate_questions(current_user):
    data = request.get_json()
    
    skill = data.get('skill')
    level = data.get('level', 'beginner')
    video_url = data.get('video_url')
    
    if not skill:
        return jsonify({'message': 'Skill is required'}), 400
    
    try:
        # Get transcript if video URL is provided
        transcript = None
        if video_url:
            transcript = get_video_transcript(video_url)
        
        # Generate questions using AI
        questions = generate_interview_questions(skill, level, transcript)
        
        # Save questions to database
        new_question_set = {
            'skill': skill,
            'level': level,
            'questions': questions,
            'created_by': str(current_user['_id']),
            'created_at': datetime.datetime.utcnow(),
            'video_url': video_url
        }
        
        result = interview_questions.insert_one(new_question_set)
        
        return jsonify({
            'message': 'Questions generated successfully',
            'question_set_id': str(result.inserted_id),
            'questions': questions
        }), 201
    except Exception as e:
        return jsonify({'message': f'Error generating questions: {str(e)}'}), 500

@interview_bp.route('/questions/<question_set_id>', methods=['GET'])
@token_required
def get_question_set(current_user, question_set_id):
    try:
        # Get question set
        question_set = interview_questions.find_one({'_id': ObjectId(question_set_id)})
        
        if not question_set:
            return jsonify({'message': 'Question set not found'}), 404
        
        question_set['_id'] = str(question_set['_id'])
        
        return jsonify(question_set), 200
    except:
        return jsonify({'message': 'Invalid question set ID'}), 400

@interview_bp.route('/roadmap/<roadmap_id>/module/<module_index>/interview', methods=['POST'])
@token_required
def create_module_interview(current_user, roadmap_id, module_index):
    try:
        module_index = int(module_index)
        
        # Get roadmap
        roadmap = roadmaps.find_one({'_id': ObjectId(roadmap_id)})
        
        if not roadmap:
            return jsonify({'message': 'Roadmap not found'}), 404
        
        # Check if user is authorized
        user_id = str(current_user['_id'])
        if roadmap['mentor_id'] != user_id and roadmap['mentee_id'] != user_id:
            return jsonify({'message': 'Unauthorized'}), 403
        
        # Check if module exists
        if module_index >= len(roadmap['modules']):
            return jsonify({'message': 'Module not found'}), 404
        
        module = roadmap['modules'][module_index]
        
        # Generate interview questions for this module
        questions = generate_interview_questions(
            roadmap['skill'],
            roadmap.get('level', 'beginner'),
            None,
            module['title']
        )
        
        # Save questions to database
        new_question_set = {
            'skill': roadmap['skill'],
            'level': roadmap.get('level', 'beginner'),
            'module': module['title'],
            'roadmap_id': roadmap_id,
            'module_index': module_index,
            'questions': questions,
            'created_by': user_id,
            'created_at': datetime.datetime.utcnow()
        }
        
        result = interview_questions.insert_one(new_question_set)
        
        # Update roadmap module with interview ID
        roadmaps.update_one(
            {'_id': ObjectId(roadmap_id)},
            {'$set': {
                f'modules.{module_index}.interview_id': str(result.inserted_id)
            }}
        )
        
        # Create notification for the other user
        other_user_id = roadmap['mentee_id'] if user_id == roadmap['mentor_id'] else roadmap['mentor_id']
        
        notification = {
            'type': 'interview_created',
            'from_user_id': user_id,
            'to_user_id': other_user_id,
            'from_username': current_user['username'],
            'roadmap_id': roadmap_id,
            'module_title': module['title'],
            'interview_id': str(result.inserted_id),
            'created_at': datetime.datetime.utcnow(),
            'read': False
        }
        
        notifications.insert_one(notification)
        
        return jsonify({
            'message': 'Interview created successfully',
            'interview_id': str(result.inserted_id),
            'questions': questions
        }), 201
    except ValueError:
        return jsonify({'message': 'Invalid module index'}), 400
    except Exception as e:
        return jsonify({'message': f'Error creating interview: {str(e)}'}), 500

@interview_bp.route('/session/<question_set_id>', methods=['POST'])
@token_required
def start_interview_session(current_user, question_set_id):
    try:
        # Get question set
        question_set = interview_questions.find_one({'_id': ObjectId(question_set_id)})
        
        if not question_set:
            return jsonify({'message': 'Question set not found'}), 404
        
        # Create interview session
        session = {
            'id': str(ObjectId()),
            'start_time': datetime.datetime.utcnow(),
            'status': 'in_progress',
            'user_id': str(current_user['_id']),
            'answers': []
        }
        
        # Add session to question set
        interview_questions.update_one(
            {'_id': ObjectId(question_set_id)},
            {'$push': {'sessions': session}}
        )
        
        return jsonify({
            'message': 'Interview session started',
            'session_id': session['id']
        }), 201
    except:
        return jsonify({'message': 'Invalid question set ID'}), 400

@interview_bp.route('/session/<question_set_id>/<session_id>/answer', methods=['POST'])
@token_required
def submit_answer(current_user, question_set_id, session_id):
    data = request.get_json()
    
    question_index = data.get('question_index')
    answer = data.get('answer')
    
    if question_index is None or answer is None:
        return jsonify({'message': 'Question index and answer are required'}), 400
    
    try:
        # Get question set
        question_set = interview_questions.find_one({
            '_id': ObjectId(question_set_id),
            'sessions.id': session_id
        })
        
        if not question_set:
            return jsonify({'message': 'Question set or session not found'}), 404
        
        # Check if user is authorized
        user_id = str(current_user['_id'])
        session = next((s for s in question_set.get('sessions', []) if s['id'] == session_id), None)
        
        if not session or session['user_id'] != user_id:
            return jsonify({'message': 'Unauthorized'}), 403
        
        # Add answer to session
        answer_data = {
            'question_index': question_index,
            'answer': answer,
            'timestamp': datetime.datetime.utcnow()
        }
        
        interview_questions.update_one(
            {'_id': ObjectId(question_set_id), 'sessions.id': session_id},
            {'$push': {'sessions.$.answers': answer_data}}
        )
        
        return jsonify({'message': 'Answer submitted successfully'}), 200
    except:
        return jsonify({'message': 'Invalid question set or session ID'}), 400

@interview_bp.route('/session/<question_set_id>/<session_id>/complete', methods=['POST'])
@token_required
def complete_interview_session(current_user, question_set_id, session_id):
    try:
        # Get question set
        question_set = interview_questions.find_one({
            '_id': ObjectId(question_set_id),
            'sessions.id': session_id
        })
        
        if not question_set:
            return jsonify({'message': 'Question set or session not found'}), 404
        
        # Check if user is authorized
        user_id = str(current_user['_id'])
        session = next((s for s in question_set.get('sessions', []) if s['id'] == session_id), None)
        
        if not session or session['user_id'] != user_id:
            return jsonify({'message': 'Unauthorized'}), 403
        
        # Update session status
        interview_questions.update_one(
            {'_id': ObjectId(question_set_id), 'sessions.id': session_id},
            {'$set': {
                'sessions.$.status': 'completed',
                'sessions.$.end_time': datetime.datetime.utcnow()
            }}
        )
        
        # If this is a roadmap module interview, update the module
        if 'roadmap_id' in question_set and 'module_index' in question_set:
            roadmaps.update_one(
                {'_id': ObjectId(question_set['roadmap_id'])},
                {'$set': {
                    f'modules.{question_set["module_index"]}.interview_completed': True,
                    f'modules.{question_set["module_index"]}.interview_completed_at': datetime.datetime.utcnow()
                }}
            )
            
            # Create notification for mentor
            roadmap = roadmaps.find_one({'_id': ObjectId(question_set['roadmap_id'])})
            
            if roadmap and roadmap['mentor_id'] != user_id:
                notification = {
                    'type': 'interview_completed',
                    'from_user_id': user_id,
                    'to_user_id': roadmap['mentor_id'],
                    'from_username': current_user['username'],
                    'roadmap_id': question_set['roadmap_id'],
                    'module_title': question_set['module'],
                    'interview_id': question_set_id,
                    'created_at': datetime.datetime.utcnow(),
                    'read': False
                }
                
                notifications.insert_one(notification)
        
        return jsonify({'message': 'Interview session completed'}), 200
    except:
        return jsonify({'message': 'Invalid question set or session ID'}), 400
