from flask import Blueprint, request, jsonify, g
import datetime
from bson.objectid import ObjectId
import json
import tempfile
from database.db import ai_learning_data
from middleware.auth_middleware import token_required
from services.ai_service import match_mentor_mentee, generate_roadmap, generate_interview_questions
from models.user import UserModel
from models.roadmap import RoadmapModel

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/match', methods=['POST'])
@token_required
def match_mentors(current_user):
    if not current_user:
        return jsonify({'error': 'Authenticated user not found'}), 401
    profile = current_user.get('profile', {})
    mentee_skills = profile.get('goals', []) 
    mentee_experience = profile.get('experience_level', '')
    if not mentee_skills:
        return jsonify({'message': 'User profile goals are required for matching'}), 400
    try:
        match_result = match_mentor_mentee(mentee_skills, mentee_experience)
        if not match_result:
            return jsonify({'message': 'No mentor match found'}), 404
        mentor_id = match_result['mentor']
        mentor = UserModel.get_user_by_id(mentor_id)
        if not mentor:
            return jsonify({'message': 'Mentor not found'}), 404
        UserModel.link_mentor_and_mentee(mentor_id, current_user.get('_id'))
        return jsonify({
            'message': 'Mentor matching successful',
            'matches': {
                'mentor': mentor_id,
                'reason': match_result['reason'],
                'name': mentor.get('name', ''),
                'username': mentor.get('username', '')
            }
        }), 200
    except Exception as e:
        return jsonify({'message': f'Error matching mentors: {str(e)}'}), 500

@ai_bp.route('/roadmap', methods=['POST'])
@token_required
def create_roadmap(current_user):
    data = request.get_json()
    goal = data.get('goal')
    mentee_id = data.get('mentee_id')
    if not goal:
        return jsonify({'message': 'Goal is required'}), 400
    if not mentee_id:
        return jsonify({'message': 'Mentee ID is required'}), 400
    try:
        modules_content = generate_roadmap(goal) 
        db_roadmap = RoadmapModel.create_roadmap(
            mentee_id=mentee_id, 
            mentor_id=str(current_user.get('_id')), 
            topic=goal,
            duration_weeks=8, 
            modules=modules_content
        )
        if not db_roadmap:
            return jsonify({'message': 'Failed to create roadmap in database'}), 500
        serialized_roadmap = {
            "id": str(db_roadmap["_id"]), 
            "menteeId": str(db_roadmap["menteeId"]),
            "goal": db_roadmap["goal"],
            "status": db_roadmap["status"],
            "durationWeeks": db_roadmap["durationWeeks"],
            "approvalStatus": {
                "mentorId": str(db_roadmap["approvalStatus"]["mentorId"]),
                "status": db_roadmap["approvalStatus"]["status"],
                "comments": db_roadmap["approvalStatus"]["comments"]
            },
            "interviewTrigger": db_roadmap["interviewTrigger"],
            "modules": db_roadmap["modules"], 
            "created_at": db_roadmap["created_at"].isoformat(),
            "updated_at": db_roadmap["updated_at"].isoformat()
        }
        return jsonify({
            'message': 'Roadmap generated successfully',
            'roadmap': serialized_roadmap 
        }), 200
    except Exception as e:
        return jsonify({'message': f'Error generating roadmap: {str(e)}'}), 500

@ai_bp.route('/interview', methods=['POST'])
@token_required
def interview():
    try:
        audio_file = request.files.get('audio')
        roadmap_id = request.form.get('roadmap_id')
        interview_num = int(request.form.get('interview_num'))
        history_json = request.form.get('history')

        if interview_num == 1:
            interview = RoadmapModel.get_interview_1(roadmap_id)
            goal = interview['goal']
            theme = interview['interview_theme_1']
        else:
            interview = RoadmapModel.get_interview_2(roadmap_id)
            goal = interview['goal']
            theme = interview['interview_theme_2']        

        if not audio_file or not roadmap_id or not history_json or not goal or not theme:
            return jsonify({'message': 'audio, roadmap_id, history, goal and theme are required'}), 400

        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp_audio:
            audio_path = tmp_audio.name
            audio_file.save(audio_path)

        user_answer, next_question = generate_interview_questions(audio_path, history_json, goal, theme)

        response_payload = {
            "transcript": user_answer,
            "next_question": next_question,
            "audio_path": 'ai-speech.mp3'
        }

        return jsonify(response_payload), 200

    except Exception as e:
        return jsonify({'message': f'Error during interview: {str(e)}'}), 500


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
