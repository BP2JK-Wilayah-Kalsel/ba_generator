from flask import Blueprint, jsonify, current_app
from datetime import datetime

bp = Blueprint('main', __name__)


@bp.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': current_app.config.get('VERSION', 'unknown')
    })

