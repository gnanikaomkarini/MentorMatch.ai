from database.db import messages, users
from bson.objectid import ObjectId
import datetime

PAGE_SIZE = 20

def send_message(sender_id, receiver_id, content):
    message = {
        'sender_id': sender_id,
        'receiver_id': receiver_id,
        'content': content,
        'timestamp': datetime.datetime.utcnow()
    }
    result = messages.insert_one(message)
    message['_id'] = str(result.inserted_id)
    return message

def get_chats(user_id, other_id, page=1):
    # Get messages where (sender==user and receiver==other) OR (sender==other and receiver==user)
    query = {
        '$or': [
            {'sender_id': user_id, 'receiver_id': other_id},
            {'sender_id': other_id, 'receiver_id': user_id}
        ]
    }
    skip = (page - 1) * PAGE_SIZE
    cursor = messages.find(query).sort('timestamp', -1).skip(skip).limit(PAGE_SIZE + 1)
    msgs = list(cursor)
    # Get usernames for display
    user_ids = list({msg['sender_id'] for msg in msgs} | {msg['receiver_id'] for msg in msgs})
    user_map = {str(u['_id']): u.get('username', '') for u in users.find({'_id': {'$in': [ObjectId(uid) for uid in user_ids]}})}
    for msg in msgs:
        msg['sender'] = user_map.get(msg['sender_id'], 'Unknown')
        msg['receiver'] = user_map.get(msg['receiver_id'], 'Unknown')
        msg['_id'] = str(msg['_id'])
        msg['timestamp'] = msg['timestamp'].isoformat()
    is_last_page = len(msgs) <= PAGE_SIZE
    # Only reverse the page slice, not the whole result set
    page_msgs = msgs[:PAGE_SIZE][::-1]
    return {
        'messages': page_msgs,  # Oldest first for this page, but latest messages overall
        'isLastPage': is_last_page
    }