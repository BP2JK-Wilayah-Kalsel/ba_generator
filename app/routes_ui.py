from datetime import datetime
from flask import Blueprint, render_template

bp = Blueprint('ui', __name__)


@bp.route('/')
def index():
    return render_template('home.html')


@bp.route('/ba-pokja-konsultan')
def ba_pokja_konsultan():
    return render_template('ba_pokja_konsultan.html')


@bp.route('/ba-timlak-konsultan')
def ba_timlak_konsultan():
    current_year = datetime.now().year
    return render_template('ba_timlak_konsultan.html', current_year=current_year)

@bp.route('/ba-reviu-paket-tender-pk')
def ba_reviu_paket_tender_pk():
    current_year = datetime.now().year
    return render_template('ba_timlak_fisik.html', current_year=current_year)

@bp.route('/persiapan-pembuktian')
def persiapan_pembuktian():
    return render_template('persiapan_pembuktian.html')
