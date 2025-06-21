from database.db import roadmaps
from bson.objectid import ObjectId

def get_assessment(roadmap_id, module_index):
    roadmap = roadmaps.find_one({'_id': ObjectId(roadmap_id)})
    if not roadmap or int(module_index) >= len(roadmap.get('modules', [])):
        return None
    module = roadmap['modules'][int(module_index)]
    evaluation = module.get('evaluation', {})
    questions = []
    for key in sorted(evaluation.keys()):
        q = evaluation[key]
        questions.append({
            "question": q.get("question"),
            "options": {k: v for k, v in q.items() if k.startswith("option ")},
            "correct_option": q.get("correct option")
        })
    return questions

def submit_score(roadmap_id, module_index, user_id, score):
    roadmap = roadmaps.find_one({'_id': ObjectId(roadmap_id)})
    if not roadmap or int(module_index) >= len(roadmap.get('modules', [])):
        return None
    module_path = f"modules.{int(module_index)}.assessment_scores"
    # Fetch current best score
    current_scores = roadmap['modules'][int(module_index)].get('assessment_scores', {})
    best_score = max(current_scores.get(str(user_id), 0), score)
    # Update best score for this user
    roadmaps.update_one(
        {'_id': ObjectId(roadmap_id)},
        {'$set': {f"{module_path}.{user_id}": best_score}}
    )
    return best_score