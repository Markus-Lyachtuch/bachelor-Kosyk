from flask import Blueprint, jsonify, request
from cefrpy import CEFRAnalyzer

word_level_bp = Blueprint('word_level', __name__, url_prefix='/api')

@word_level_bp.route('/word-level', methods=['GET'])
def get_word_level():
    words = request.args.get('words').split(',')
    
    if not words:
        return jsonify({"error": "Missing 'words' parameter. Usage: /api/word-level?words=apple,banana,orange"}), 400

    analyzer = CEFRAnalyzer()

    cefr_levels = {}

    for word in words:
        cefr_level = analyzer.get_average_word_level_CEFR(word)
        cefr_levels[word] = cefr_level.name if cefr_level else None
        
    return jsonify({
        "words": cefr_levels
    })
