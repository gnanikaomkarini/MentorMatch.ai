from bson import ObjectId

def fix_object_ids(doc):
    if isinstance(doc, list):
        return [fix_object_ids(d) if isinstance(d, (dict, list)) else str(d) if isinstance(d, ObjectId) else d for d in doc]
    if isinstance(doc, dict):
        return {k: str(v) if isinstance(v, ObjectId) else fix_object_ids(v) for k, v in doc.items()}
    return doc