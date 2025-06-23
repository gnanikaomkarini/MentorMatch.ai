from flask import Blueprint, request, jsonify, g
import datetime
from bson.objectid import ObjectId
import json
import tempfile
from database.db import ai_learning_data
from middleware.auth_middleware import token_required
from services.ai_service import match_mentor_mentee, generate_roadmap, generate_interview_questions, update_roadmap
from services.ai_service import get_feedback
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

# @ai_bp.route('/roadmap', methods=['POST'])
# @token_required
# def create_roadmap(current_user):
#     data = request.get_json()
#     goal = data.get('goal')
#     mentee_id = data.get('mentee_id')
#     if not goal:
#         return jsonify({'message': 'Goal is required'}), 400
#     if not mentee_id:
#         return jsonify({'message': 'Mentee ID is required'}), 400
#     try:
#         modules_content = generate_roadmap(goal) 
#         db_roadmap = RoadmapModel.create_roadmap(
#             mentee_id=mentee_id, 
#             mentor_id=str(current_user.get('_id')), 
#             topic=goal,
#             duration_weeks=8, 
#             modules=modules_content
#         )
#         if not db_roadmap:
#             return jsonify({'message': 'Failed to create roadmap in database'}), 500
#         serialized_roadmap = {
#             "id": str(db_roadmap["_id"]), 
#             "menteeId": str(db_roadmap["menteeId"]),
#             "goal": db_roadmap["goal"],
#             "status": db_roadmap["status"],
#             "durationWeeks": db_roadmap["durationWeeks"],
#             "approvalStatus": {
#                 "mentorId": str(db_roadmap["approvalStatus"]["mentorId"]),
#                 "status": db_roadmap["approvalStatus"]["status"],
#                 "comments": db_roadmap["approvalStatus"]["comments"]
#             },
#             "interviewTrigger": db_roadmap["interviewTrigger"],
#             "modules": db_roadmap["modules"], 
#             "created_at": db_roadmap["created_at"].isoformat(),
#             "updated_at": db_roadmap["updated_at"].isoformat()
#         }
#         return jsonify({
#             'message': 'Roadmap generated successfully',
#             'roadmap': serialized_roadmap 
#         }), 200
#     except Exception as e:
#         return jsonify({'message': f'Error generating roadmap: {str(e)}'}), 500


@ai_bp.route('/roadmap', methods=['POST'])
@token_required
def create_roadmap(current_user):
    data = request.get_json()
    conversation = data.get('conversation')
    mentee_id = data.get('mentee_id')
    if not conversation:
        return jsonify({'message': 'conversation is required'}), 400
    if not mentee_id:
        return jsonify({'message': 'Mentee ID is required'}), 400
    
    roadmap_id = UserModel.get_user_roadmap_id(mentee_id)

    if roadmap_id is None:
        modules_content = generate_roadmap(conversation) 
        db_roadmap = RoadmapModel.create_roadmap(
            mentee_id=mentee_id, 
            mentor_id=str(current_user.get('_id')), 
            duration_weeks=8, 
            modules=modules_content
        )
        UserModel.add_roadmap_id_to_user(mentee_id, db_roadmap['_id'])
        if not db_roadmap:
            return jsonify({'message': 'Failed to create roadmap in database'}), 500
    else:
        roadmap = RoadmapModel.get_roadmap_as_dict_for_update(roadmap_id)
        db_roadmap = update_roadmap(roadmap, conversation)
        RoadmapModel.replace_roadmap_by_id(roadmap_id, db_roadmap)

    serialized_roadmap = {
        "id": str(db_roadmap["_id"]), 
        "menteeId": str(db_roadmap["menteeId"]),
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



@ai_bp.route('/interview', methods=['POST'])
@token_required
def interview(current_user):
    try:
        audio_file = request.files.get('audio')
        roadmap_id = request.form.get('roadmap_id')
        interview_num = int(request.form.get('interview_num'))
        history_json = request.form.get('history')

        # Print the request body
        print("Interview API request body:", {
            "roadmap_id": roadmap_id,
            "interview_num": interview_num,
            "history": history_json,
            "audio_file_present": audio_file is not None
        })

        if interview_num == 1:
            interview = RoadmapModel.get_interview_1(roadmap_id)
            theme = interview['interview_theme_1']
            print(f"Interview theme 1: {theme}")
        else:
            interview = RoadmapModel.get_interview_2(roadmap_id)
            print(f"Interview theme 2: {interview}")
            theme = interview['interview_theme_2']        

        if not roadmap_id:
            error_payload = {'message': 'roadmap_id  required'}
            print("Interview API response:", error_payload)
            return jsonify(error_payload), 400
        if not theme:
            error_payload = {'message': 'theme is required'}
            print("Interview API response:", error_payload)
            return jsonify(error_payload), 400

        if audio_file is not None:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp_audio:
                audio_path = tmp_audio.name
                audio_file.save(audio_path)
        else:
            audio_path = None

        user_answer, next_question = generate_interview_questions(audio_path, history_json, None, theme)

        response_payload = {
            "transcript": user_answer,
            "next_question": next_question,
            "audio_path": 'ai-speech.mp3'
        }

        print("Interview API response:", response_payload)
        return jsonify(response_payload), 200

    except Exception as e:
        error_payload = {'message': f'Error during interview: {str(e)}'}
        print("Interview API response:", error_payload)
        return jsonify(error_payload), 500


@ai_bp.route('/feedback', methods=['POST'])
@token_required
def submit_feedback(current_user):
    try:
        data = request.get_json()
        print("Feedback API request body:", data)  # Print the incoming request body

        roadmap_id = data.get('roadmap_id')
        interview_num = int(data.get('interview_num'))
        history_json = str(data.get('history'))

        feedback = get_feedback(history_json)
        print("Feedback generated:", feedback)  # Print the generated feedback

        if interview_num == 1:
            RoadmapModel.set_feedback_interview_1(roadmap_id, feedback)
        else:
            RoadmapModel.set_feedback_interview_2(roadmap_id, feedback)
        
        response_payload = {
            'message': 'Feedback added successfully',
            'feedback': feedback
        }
        print("Feedback API response:", response_payload)  # Print the response payload
        return jsonify(response_payload)

    except Exception as e:
        error_payload = {'message': f'Error during feedback: {str(e)}'}
        print("Feedback API response:", error_payload)  # Print error response
        return jsonify(error_payload), 500