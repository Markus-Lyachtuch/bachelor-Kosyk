from flask import Blueprint, jsonify
import platform
import os

cpu_info_bp = Blueprint('cpu_info', __name__, url_prefix='/api')

@cpu_info_bp.route('/debug/cpu', methods=['GET'])
def cpu_info():
    info = {}

    info['arch'] = platform.machine()

    try:
        with open('/proc/cpuinfo', 'r') as f:
            cpuinfo = f.read()
        for line in cpuinfo.splitlines():
            if 'model name' in line:
                info['model'] = line.split(':')[1].strip()
                break
    except Exception as e:
        info['cpuinfo_error'] = str(e)

    info['cpu_count'] = os.cpu_count()

    info['memory_mb'] = os.environ.get('AWS_LAMBDA_FUNCTION_MEMORY_SIZE', 'unknown')

    return jsonify(info)
