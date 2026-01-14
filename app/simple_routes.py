from flask import Blueprint, render_template, jsonify, current_app
from datetime import datetime

bp = Blueprint('main', __name__)


@bp.route('/')
def index():
    return render_template('home.html')


@bp.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': current_app.config.get('VERSION', 'unknown')
    })
    

@bp.route('/ba-pokja-konsultan')
def ba_pokja_konsultan():
    return render_template('ba_pokja_konsultan.html')


@bp.route('/ba-timlak-konsultan')
def ba_timlak_konsultan():
    return render_template('ba_timlak_konsultan.html')


@bp.route('/persiapan-pembuktian')
def persiapan_pembuktian():
    return render_template('persiapan_pembuktian.html')
