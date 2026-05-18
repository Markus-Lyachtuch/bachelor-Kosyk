from datetime import datetime
from flask import Blueprint, jsonify


health_check_bp = Blueprint('health_check', __name__, url_prefix='/api')
time = datetime.now()
@health_check_bp.route('/health_check', methods=['GET'])
def health_check():
    return jsonify({ 'status': 'OK', 'time': time }), 200