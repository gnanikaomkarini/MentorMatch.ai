from bson.objectid import ObjectId
from datetime import datetime
from database.db import roadmaps

class RoadmapModel:
    @staticmethod
    def create_roadmap(mentee_id, mentor_id, topic, duration_weeks, modules,
                       interview_type="progress_based", trigger_point="50%") -> dict:
        roadmap_doc = {
            "menteeId": ObjectId(mentee_id),
            "goal": topic,
            "status": "in-progress",
            "durationWeeks": duration_weeks,
            "approvalStatus": {
                "mentorId": ObjectId(mentor_id),
                "status": "pending",
                "comments": ""
            },
            "interviewTrigger": {
                "type": interview_type,
                "triggerPoint": trigger_point
            },
            "modules": modules,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        result = roadmaps.insert_one(roadmap_doc)
        return roadmaps.find_one({"_id": result.inserted_id}) 

    @staticmethod
    def get_roadmaps_by_mentee(mentee_id):
        return list(roadmaps.find({"menteeId": ObjectId(mentee_id)}))

    @staticmethod
    def update_roadmap_status(roadmap_id, new_status):
        return roadmaps.update_one(
            {"_id": ObjectId(roadmap_id)},
            {"$set": {"status": new_status, "updated_at": datetime.utcnow()}}
        )
    
    @staticmethod
    def set_interview_theme_1(roadmap_id, theme_value):
        return roadmaps.update_one(
            {"_id": ObjectId(roadmap_id)},
            {
                "$set": {
                    "interview_theme_1": theme_value,
                    "updated_at": datetime.utcnow()
                }
            }
        )
    
    @staticmethod
    def set_interview_theme_2(roadmap_id, theme_value):
        return roadmaps.update_one(
            {"_id": ObjectId(roadmap_id)},
            {
                "$set": {
                    "interview_theme_2": theme_value,
                    "updated_at": datetime.utcnow()
                }
            }
        )
    
    @staticmethod
    def get_interview_1(roadmap_id):
        result = roadmaps.find_one(
            {"_id": ObjectId(roadmap_id)},
            {"_id": 0, "interview_theme_1": 1, "goal": 1}
        )
        return result


    @staticmethod
    def get_interview_2(roadmap_id):
        result = roadmaps.find_one(
            {"_id": ObjectId(roadmap_id)},
            {"_id": 0, "interview_theme_2": 1, "goal": 1}
        )
        return result