from flask import Blueprint, request, jsonify
from typing import Any

from spse_crawler import crawl_spse_jadwal, crawl_spse_pengumuman, format_jadwal_for_paste

bp = Blueprint('spse', __name__)


@bp.route('/api/crawl_spse_jadwal', methods=['POST'])
def crawl_spse_jadwal_endpoint() -> Any:
    data = request.get_json() or {}
    kode_tender = data.get('kode_tender', '')
    if not kode_tender:
        return jsonify({'success': False, 'error': 'Parameter kode_tender diperlukan'}), 400

    kode_tender = ''.join(filter(str.isdigit, kode_tender))
    if not kode_tender:
        return jsonify({'success': False, 'error': 'Kode tender tidak valid (harus berisi angka)'}), 400

    result = crawl_spse_jadwal(kode_tender)
    if result.get('success') and result.get('jadwal'):
        result['formatted_text'] = format_jadwal_for_paste(result['jadwal'])
    return jsonify(result)


@bp.route('/api/crawl_spse_pengumuman', methods=['POST'])
def crawl_spse_pengumuman_endpoint() -> Any:
    data = request.get_json() or {}
    kode_tender = data.get('kode_tender', '')
    if not kode_tender:
        return jsonify({'success': False, 'error': 'Parameter kode_tender diperlukan'}), 400

    kode_tender = ''.join(filter(str.isdigit, kode_tender))
    if not kode_tender:
        return jsonify({'success': False, 'error': 'Kode tender tidak valid (harus berisi angka)'}), 400

    result = crawl_spse_pengumuman(kode_tender)
    return jsonify(result)
