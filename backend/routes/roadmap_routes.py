from flask import Blueprint, request, jsonify, g
import datetime
from bson.objectid import ObjectId

from database.db import roadmaps, users, notifications
from middleware.auth_middleware import token_required
from services.ai_service import generate_roadmap
from services.assessment_service import get_assessment, submit_score
from models.roadmap import RoadmapModel

roadmap_bp = Blueprint('roadmaps', __name__)

@roadmap_bp.route('/', methods=['POST'])
@token_required
def create_roadmap(current_user):
    data = request.get_json()
    
    mentor_id = data.get('mentor_id')
    mentee_id = data.get('mentee_id')
    title = data.get('title', 'Learning Roadmap')
    description = data.get('description', '')
    skill = data.get('skill', '')
    
    if not mentor_id or not mentee_id or not skill:
        return jsonify({'message': 'Mentor ID, mentee ID, and skill are required'}), 400
    
    try:
        # Check if mentor and mentee exist
        mentor = users.find_one({'_id': ObjectId(mentor_id), 'role': 'mentor'})
        mentee = users.find_one({'_id': ObjectId(mentee_id), 'role': 'mentee'})
        
        if not mentor or not mentee:
            return jsonify({'message': 'Mentor or mentee not found'}), 404
        
        # Check if current user is either the mentor or mentee
        if str(current_user['_id']) != mentor_id and str(current_user['_id']) != mentee_id:
            return jsonify({'message': 'Unauthorized'}), 403
        
        # Generate roadmap using AI
        roadmap_content = generate_roadmap(skill, mentee['profile'].get('experience_level', 'beginner'))
        
        # Create roadmap
        new_roadmap = {
            'mentor_id': mentor_id,
            'mentee_id': mentee_id,
            'title': title,
            'description': description,
            'skill': skill,
            'modules': roadmap_content['modules'],
            'created_at': datetime.datetime.utcnow(),
            'updated_at': datetime.datetime.utcnow(),
            'status': 'active'
        }
        
        result = roadmaps.insert_one(new_roadmap)
        
        # Create notification for the other user
        notification_to = mentor_id if str(current_user['_id']) == mentee_id else mentee_id
        
        notification = {
            'type': 'roadmap_created',
            'from_user_id': str(current_user['_id']),
            'to_user_id': notification_to,
            'from_username': current_user['username'],
            'roadmap_id': str(result.inserted_id),
            'roadmap_title': title,
            'created_at': datetime.datetime.utcnow(),
            'read': False
        }
        
        notifications.insert_one(notification)
        
        return jsonify({
            'message': 'Roadmap created successfully',
            'roadmap_id': str(result.inserted_id)
        }), 201
    except Exception as e:
        return jsonify({'message': f'Error creating roadmap: {str(e)}'}), 500

@roadmap_bp.route('/', methods=['GET'])
@token_required
def get_roadmaps(current_user):
    user_id = str(current_user['_id'])
    role = current_user['role']
    
    # Get roadmaps based on role
    if role == 'mentor':
        roadmap_list = list(roadmaps.find({'mentor_id': user_id}))
    else:
        roadmap_list = list(roadmaps.find({'mentee_id': user_id}))
    
    # Convert ObjectId to string
    for roadmap in roadmap_list:
        roadmap['_id'] = str(roadmap['_id'])
    
    return jsonify(roadmap_list), 200

@roadmap_bp.route('/<roadmap_id>', methods=['GET'])
@token_required
def get_roadmap(current_user, roadmap_id):
    try:
        roadmap = roadmaps.find_one({'_id': ObjectId(roadmap_id)})
        
        if not roadmap:
            return jsonify({'message': 'Roadmap not found'}), 404
        
        # Check if user is authorized to access this roadmap
        user_id = str(current_user['_id'])
        if roadmap['mentor_id'] != user_id and roadmap['mentee_id'] != user_id:
            return jsonify({'message': 'Unauthorized'}), 403
        
        roadmap['_id'] = str(roadmap['_id'])
        return jsonify(roadmap), 200
    except:
        return jsonify({'message': 'Invalid roadmap ID'}), 400

@roadmap_bp.route('/interview/add', methods=['POST'])
@token_required
def add_interview(current_user):
    data = request.get_json()

    roadmap_id = data.get("roadmap_id")
    interview_num = int(data.get("interview_num"))
    context = data.get("context")

    if not roadmap_id or interview_num is None or context is None:
        return jsonify({"message": "roadmap_id, interview_num, and context are required"}), 400

    try:
        if interview_num == 1:
            RoadmapModel.set_interview_theme_1(roadmap_id, context)
        else:
            RoadmapModel.set_interview_theme_2(roadmap_id, context)
        return jsonify({"message": "Interview theme added successfully"}), 201
    except Exception as e:
        return jsonify({"message": f"Failed to add interview theme: {str(e)}"}), 500

@roadmap_bp.route('/<roadmap_id>', methods=['PUT'])
@token_required
def update_roadmap(current_user, roadmap_id):
    data = request.get_json()
    
    try:
        roadmap = roadmaps.find_one({'_id': ObjectId(roadmap_id)})
        
        if not roadmap:
            return jsonify({'message': 'Roadmap not found'}), 404
        
        # Check if user is authorized to update this roadmap
        user_id = str(current_user['_id'])
        if roadmap['mentor_id'] != user_id:
            return jsonify({'message': 'Only mentors can update roadmaps'}), 403
        
        # Update roadmap fields
        update_data = {}
        
        if 'title' in data:
            update_data['title'] = data['title']
        if 'description' in data:
            update_data['description'] = data['description']
        if 'modules' in data:
            update_data['modules'] = data['modules']
        if 'status' in data:
            update_data['status'] = data['status']
        
        update_data['updated_at'] = datetime.datetime.utcnow()
        
        if update_data:
            roadmaps.update_one(
                {'_id': ObjectId(roadmap_id)},
                {'$set': update_data}
            )
        
        # Create notification for mentee
        notification = {
            'type': 'roadmap_updated',
            'from_user_id': user_id,
            'to_user_id': roadmap['mentee_id'],
            'from_username': current_user['username'],
            'roadmap_id': roadmap_id,
            'roadmap_title': roadmap['title'],
            'created_at': datetime.datetime.utcnow(),
            'read': False
        }
        
        notifications.insert_one(notification)
        
        return jsonify({'message': 'Roadmap updated successfully'}), 200
    except:
        return jsonify({'message': 'Invalid roadmap ID'}), 400

@roadmap_bp.route('/<roadmap_id>/modules/<module_index>/complete', methods=['POST'])
@token_required
def complete_module(current_user, roadmap_id, module_index):
    try:
        module_index = int(module_index)
        roadmap = roadmaps.find_one({'_id': ObjectId(roadmap_id)})
        
        if not roadmap:
            return jsonify({'message': 'Roadmap not found'}), 404
        
        # Check if user is authorized to update this roadmap
        user_id = str(current_user['_id'])
        if roadmap['mentee_id'] != user_id:
            return jsonify({'message': 'Only mentees can mark modules as complete'}), 403
        
        # Check if module exists
        if module_index >= len(roadmap['modules']):
            return jsonify({'message': 'Module not found'}), 404
        
        # Mark module as complete
        roadmap['modules'][module_index]['completed'] = True
        roadmap['modules'][module_index]['completed_at'] = datetime.datetime.utcnow()
        
        roadmaps.update_one(
            {'_id': ObjectId(roadmap_id)},
            {'$set': {
                f'modules.{module_index}.completed': True,
                f'modules.{module_index}.completed_at': datetime.datetime.utcnow(),
                'updated_at': datetime.datetime.utcnow()
            }}
        )
        
        # Create notification for mentor
        notification = {
            'type': 'module_completed',
            'from_user_id': user_id,
            'to_user_id': roadmap['mentor_id'],
            'from_username': current_user['username'],
            'roadmap_id': roadmap_id,
            'roadmap_title': roadmap['title'],
            'module_title': roadmap['modules'][module_index]['title'],
            'created_at': datetime.datetime.utcnow(),
            'read': False
        }
        
        notifications.insert_one(notification)
        
        return jsonify({'message': 'Module marked as complete'}), 200
    except ValueError:
        return jsonify({'message': 'Invalid module index'}), 400
    except:
        return jsonify({'message': 'Invalid roadmap ID'}), 400

@roadmap_bp.route('/request', methods=['POST'])
@token_required
def request_roadmap(current_user):
    data = request.get_json()
    
    mentor_id = data.get('mentor_id')
    skill = data.get('skill')
    
    if not mentor_id or not skill:
        return jsonify({'message': 'Mentor ID and skill are required'}), 400
    
    # Check if current user is a mentee
    if current_user['role'] != 'mentee':
        return jsonify({'message': 'Only mentees can request roadmaps'}), 403
    
    try:
        # Check if mentor exists
        mentor = users.find_one({'_id': ObjectId(mentor_id), 'role': 'mentor'})
        
        if not mentor:
            return jsonify({'message': 'Mentor not found'}), 404
        
        # Create notification for roadmap request
        notification = {
            'type': 'roadmap_request',
            'from_user_id': str(current_user['_id']),
            'to_user_id': mentor_id,
            'from_username': current_user['username'],
            'skill': skill,
            'created_at': datetime.datetime.utcnow(),
            'read': False
        }
        
        notifications.insert_one(notification)
        
        return jsonify({'message': 'Roadmap request sent'}), 200
    except:
        return jsonify({'message': 'Invalid mentor ID'}), 400

@roadmap_bp.route('/<roadmap_id>/<int:module_index>/assessment/get', methods=['GET'])
@token_required
def get_mcq_assessment(roadmap_id, module_index, current_user):
    questions = get_assessment(roadmap_id, module_index)
    if questions is None:
        return jsonify({"message": "Not found"}), 404
    return jsonify({"questions": questions})

@roadmap_bp.route('/<roadmap_id>/<int:module_index>/assessment/submit', methods=['POST'])
@token_required
def submit_mcq_score(roadmap_id, module_index, current_user):
    data = request.get_json()
    score = data.get("score")
    user_id = str(current_user['_id'])
    if score is None:
        return jsonify({"message": "Score required"}), 400
    best_score = submit_score(roadmap_id, module_index, user_id, score)
    if best_score is None:
        return jsonify({"message": "Not found"}), 404
    return jsonify({"message": "Score submitted", "best_score": best_score})

@roadmap_bp.route('/<roadmap_id>/<int:module_index>/subtopics/complete', methods=['POST'])
@token_required
def complete_subtopics(roadmap_id, module_index, current_user):
    data = request.get_json()
    completed_subtopics = data.get("completed_subtopics", [])
    if not isinstance(completed_subtopics, list) or not completed_subtopics:
        return jsonify({"message": "completed_subtopics must be a non-empty list"}), 400

    roadmap = roadmaps.find_one({'_id': ObjectId(roadmap_id)})
    if not roadmap or int(module_index) >= len(roadmap.get('modules', [])):
        return jsonify({"message": "Roadmap or module not found"}), 404

    module = roadmap['modules'][int(module_index)]
    updated = False

    for subtopic in module.get('subtopics', []):
        if subtopic['title'] in completed_subtopics:
            # Mark all resources in this subtopic as completed
            for resource in subtopic.get('resources', []):
                if not resource.get('completed', False):
                    resource['completed'] = True
                    updated = True

    if updated:
        # Update the module in the DB
        roadmaps.update_one(
            {'_id': ObjectId(roadmap_id)},
            {'$set': {f'modules.{module_index}': module}}
        )
        return jsonify({"message": "Selected subtopics marked as completed"}), 200
    else:
        return jsonify({"message": "No subtopics were updated"}), 200

@roadmap_bp.route('/<roadmap_id>/<int:module_index>/resources/complete', methods=['POST'])
@token_required
def complete_resources(roadmap_id, module_index, current_user):
    data = request.get_json()
    completed_resources = data.get("completed_resources", [])
    if not isinstance(completed_resources, list) or not completed_resources:
        return jsonify({"message": "completed_resources must be a non-empty list"}), 400

    roadmap = roadmaps.find_one({'_id': ObjectId(roadmap_id)})
    if not roadmap or int(module_index) >= len(roadmap.get('modules', [])):
        return jsonify({"message": "Roadmap or module not found"}), 404

    module = roadmap['modules'][int(module_index)]
    updated = False

    for subtopic in module.get('subtopics', []):
        for resource in subtopic.get('resources', []):
            if resource['title'] in completed_resources and not resource.get('completed', False):
                resource['completed'] = True
                updated = True

    if updated:
        # Update the module in the DB
        roadmaps.update_one(
            {'_id': ObjectId(roadmap_id)},
            {'$set': {f'modules.{module_index}': module}}
        )
        return jsonify({"message": "Selected resources marked as completed"}), 200
    else:
        return jsonify({"message": "No resources were updated"}), 200
