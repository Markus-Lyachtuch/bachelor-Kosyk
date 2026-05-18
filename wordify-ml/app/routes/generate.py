from app.models.llama import generate_story, generate_similar_words
from app.models.image_generation import generate_image_base64
from flask import Blueprint, request, jsonify

generate_bp = Blueprint('generate', __name__, url_prefix='/api/v3/generate')

@generate_bp.route('/story', methods=['POST'])
def generate_story_route():
    json_data = request.get_json(silent=True) or {}
    if 'words' not in json_data:
        return jsonify({"error": "No words to process"}), 400
        
    story = generate_story(json_data['words'])
    return jsonify({"story": story}), 200

@generate_bp.route('/words', methods=['POST', 'GET'])
def generate_words():
    json_data = request.get_json(silent=True) or {}
    if 'words' not in json_data:
        return jsonify({"error": "No words to process"}), 400
        
    words = generate_similar_words(json_data['words'])
    return jsonify({"words": words}), 200

@generate_bp.route('/image', methods=['POST'])
def generate_image_route():
    json_data = request.get_json(silent=True) or {}
    term = json_data.get('term')
    additional = json_data.get('additional')
    
    if not term:
        return jsonify({"error": "Missing 'term' in request body"}), 400
        
    definition = json_data.get('definition')
    
    try:
        image_base64 = generate_image_base64(term, definition)
        if additional == 'trigger':
            image_base64 = generate_image_base64(additional)
            return jsonify({"message": "generated"}), 200    
        return jsonify({"image": image_base64}), 200
    except Exception as e:
        print(f"Error generating image: {e}")
        return jsonify({"error": str(e)}), 500

