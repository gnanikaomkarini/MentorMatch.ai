from flask import Blueprint, request, jsonify
import datetime
from bson.objectid import ObjectId

from database.db import ai_learning_data
from middleware.auth_middleware import token_required
from services.ai_service import match_mentor_mentee, generate_roadmap, generate_interview_questions
from models.user import UserModel

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/match', methods=['POST'])
@token_required
def match_mentors(current_user):
    # data = request.get_json()
    user_id = current_user['_id']
    user = UserModel.get_user_by_id(user_id)
    if not user:
        return None

    profile = user.get('profile', {})

    mentee_skills = profile.get('goals', []) 
    mentee_experience = profile.get('experience_level', '')
    

    if not mentee_skills:
        return jsonify({'message': 'Goals are required'}), 400
    
    try:
        # Match mentors using AI
        match = match_mentor_mentee(mentee_skills, mentee_experience)
        
        # # Log the matching data for AI learning
        # learning_data = {
        #     'type': 'mentor_matching',
        #     'mentee_id': str(current_user['_id']),
        #     'mentee_skills': mentee_skills,
        #     'mentee_experience': mentee_experience,
        #     'matches': matches,
        #     'timestamp': datetime.datetime.utcnow()
        # }
        
        # ai_learning_data.insert_one(learning_data)
        
        return jsonify({
            'message': 'Mentor matching successful',
            'matches': match
        }), 200
    except Exception as e:
        return jsonify({'message': f'Error matching mentors: {str(e)}'}), 500

@ai_bp.route('/roadmap', methods=['POST'])
@token_required
def create_roadmap(current_user):
    data = request.get_json()
    
    skill = data.get('skill')
    experience_level = data.get('experience_level', 'beginner')
    
    if not skill:
        return jsonify({'message': 'Skill is required'}), 400
    
    try:
        # Generate roadmap using AI
        roadmap = generate_roadmap(skill, experience_level)
        
        # Log the roadmap data for AI learning
        learning_data = {
            'type': 'roadmap_generation',
            'user_id': str(current_user['_id']),
            'skill': skill,
            'experience_level': experience_level,
            'roadmap': roadmap,
            'timestamp': datetime.datetime.utcnow()
        }
        
        ai_learning_data.insert_one(learning_data)
        
        return jsonify({
            'message': 'Roadmap generated successfully',
            'roadmap': roadmap
        }), 200
    except Exception as e:
        return jsonify({'message': f'Error generating roadmap: {str(e)}'}), 500

@ai_bp.route('/interview', methods=['POST'])
@token_required
def create_interview(current_user):
    data = request.get_json()
    
    skill = data.get('skill')
    level = data.get('level', 'beginner')
    module = data.get('module')
    
    if not skill:
        return jsonify({'message': 'Skill is required'}), 400
    
    try:
        # Generate interview questions using AI
        questions = generate_interview_questions(skill, level, None, module)
        
        # Log the interview data for AI learning
        learning_data = {
            'type': 'interview_generation',
            'user_id': str(current_user['_id']),
            'skill': skill,
            'level': level,
            'module': module,
            'questions': questions,
            'timestamp': datetime.datetime.utcnow()
        }
        
        ai_learning_data.insert_one(learning_data)
        
        return jsonify({
            'message': 'Interview questions generated successfully',
            'questions': questions
        }), 200
    except Exception as e:
        return jsonify({'message': f'Error generating interview questions: {str(e)}'}), 500

@ai_bp.route('/feedback', methods=['POST'])
@token_required
def submit_feedback(current_user):
    data = request.get_json()
    
    ai_type = data.get('type')  # 'matching', 'roadmap', 'interview'
    content_id = data.get('content_id')
    rating = data.get('rating')
    feedback = data.get('feedback')
    
    if not ai_type or not content_id or rating is None:
        return jsonify({'message': 'Type, content ID, and rating are required'}), 400
    
    try:
        # Log the feedback for AI learning
        feedback_data = {
            'type': f'{ai_type}_feedback',
            'user_id': str(current_user['_id']),
            'content_id': content_id,
            'rating': rating,
            'feedback': feedback,
            'timestamp': datetime.datetime.utcnow()
        }
        
        ai_learning_data.insert_one(feedback_data)
        
        return jsonify({'message': 'Feedback submitted successfully'}), 200
    except:
        return jsonify({'message': 'Error submitting feedback'}), 500
