from flask import Blueprint, request, jsonify, send_file
import os
import json
import requests
from datetime import datetime
from typing import Any

from .utils import generate_keywords_from_form, DOCUMENT_TYPES

bp = Blueprint('api', __name__)


@bp.route('/api/document_types')
def document_types() -> Any:
    return jsonify({'success': True, 'document_types': DOCUMENT_TYPES})


@bp.route('/api/proxy/wilayah/<path:subpath>')
def proxy_wilayah(subpath: str) -> Any:
    """
    Proxy requests to wilayah.id to avoid CORS issues in the browser.
    Example: /api/proxy/wilayah/regencies/63.json -> https://wilayah.id/api/regencies/63.json
    """
    target_url = f"https://wilayah.id/api/{subpath}"
    try:
        # Forward the request to the external API
        response = requests.get(target_url, timeout=10)
        
        # Check if the request was successful
        if response.status_code != 200:
            return jsonify({'error': f'Upstream API error: {response.status_code}'}), response.status_code
            
        # Return the JSON response
        return jsonify(response.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/api/sirup/detail/<kode_rup>')
def get_sirup_detail(kode_rup: str) -> Any:
    """
    Proxy to SIRUP API to fetch package details.
    Handles cookies automatically as requested.
    """
    try:
        session = requests.Session()
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
        }
        
        # 1. Visit a main page to get cookies (e.g., a rekap page)
        init_url = 'https://sirup.inaproc.id/sirup/rekap/penyedia/K73'
        # We perform a HEAD or GET request to initialize session cookies
        session.get(init_url, headers=headers, timeout=10)
        
        # 2. Request the detail
        detail_url = f'https://sirup.inaproc.id/sirup/home/detailPaketPenyediaPublic2017/{kode_rup}'
        
        # Add headers similar to the user's curl request
        headers['Referer'] = init_url
        headers['X-Requested-With'] = 'XMLHttpRequest'
        headers['Sec-Fetch-Dest'] = 'empty'
        headers['Sec-Fetch-Mode'] = 'cors'
        headers['Sec-Fetch-Site'] = 'same-origin'
        
        response = session.get(detail_url, headers=headers, timeout=15)
        
        if response.status_code != 200:
             return jsonify({'success': False, 'message': f'Error fetching SIRUP: {response.status_code}'}), 400
             
        # Return the HTML content for client-side parsing
        return jsonify({'success': True, 'html': response.text})
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500



@bp.route('/api/save_defaults', methods=['POST'])
def save_defaults() -> Any:
    data = request.get_json() or {}
    # TODO: implement saving defaults (migrate from legacy baapp)
    return jsonify({'success': True, 'message': 'Not implemented yet'})


@bp.route('/api/load_defaults/<filename>')
def load_defaults(filename: str) -> Any:
    # TODO: implement loading defaults
    return jsonify({'success': False, 'message': 'Not implemented yet'})


@bp.route('/api/list_saved_defaults')
def list_saved_defaults() -> Any:
    return jsonify({'success': True, 'files': []})


@bp.route('/api/list_folder_files', methods=['POST'])
def list_folder_files() -> Any:
    data = request.get_json() or {}
    folder_path = data.get('folder_path', '')
    if not folder_path or not os.path.exists(folder_path) or not os.path.isdir(folder_path):
        return jsonify({'success': False, 'message': 'Path folder tidak valid'})
    available_files = []
    import re
    try:
        for file in os.listdir(folder_path):
            if file.lower().endswith('.docx') and not file.startswith('~'):
                match = re.match(r'^(\d{2})(?:[-\.]|$)', file)
                code = None
                format_id = None
                if match:
                    code = match.group(1)
                    suffix_match = re.match(r'^\d{2}[-\.]([A-Za-z0-9]+)', file)
                    if suffix_match:
                        suffix = suffix_match.group(1).lower()
                        code = f"{code}_{suffix}"
                    format_id = f"format_{code}"
                if code and format_id:
                    available_files.append({'code': code, 'format_id': format_id, 'filename': file, 'exists': True})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error membaca folder: {str(e)}'})
    return jsonify({'success': True, 'folder_path': folder_path, 'files': available_files, 'total_files': len(available_files)})


@bp.route('/api/list_folder_files_timlak', methods=['POST'])
def list_folder_files_timlak() -> Any:
    data = request.get_json() or {}
    folder_path = data.get('folder_path', '')
    if not folder_path or not os.path.exists(folder_path) or not os.path.isdir(folder_path):
        return jsonify({'success': False, 'message': 'Path folder tidak valid'})
    available_files = []
    import re
    try:
        for file in os.listdir(folder_path):
            if file.lower().endswith('.docx') and not file.startswith('~'):
                code = None
                format_id = None
                if file.startswith('!Daftar Hadir'):
                    code = 'DH'
                    format_id = 'format_DH'
                else:
                    match = re.match(r'^(\d{2})', file)
                    if match:
                        code = match.group(1)
                        format_id = f'format_{code}'
                if code and format_id:
                    available_files.append({'code': code, 'format_id': format_id, 'filename': file, 'exists': True})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error membaca folder: {str(e)}'})
    return jsonify({'success': True, 'folder_path': folder_path, 'files': available_files, 'total_files': len(available_files)})


@bp.route('/api/validate_master_pokja_konsultan', methods=['POST'])
def validate_master_pokja_konsultan() -> Any:
    data = request.get_json() or {}
    folder_path = data.get('folder_path', '')
    if not folder_path or not os.path.exists(folder_path):
        return jsonify({'success': False, 'message': 'Folder tidak ditemukan'})
    expected_documents = [
        {'id': 'format_00', 'name': '00-Format-Cover.docx', 'type': 'Cover'},
        {'id': 'format_06', 'name': '06-Format-BA Pemberian Penjelasan Kualifikasi.docx', 'type': 'BA Pemberian Penjelasan Kualifikasi'},
        {'id': 'format_10', 'name': '10-Format-BA Hasil Evaluasi Kualifikasi.docx', 'type': 'BA Hasil Evaluasi Kualifikasi'},
        {'id': 'format_11', 'name': '11-Format-BA Penetapan Daftar Pendek.docx', 'type': 'BA Penetapan Daftar Pendek'},
        {'id': 'format_12', 'name': '12-Format-Pengumuman Daftar Pendek.docx', 'type': 'Pengumuman Daftar Pendek'},
        {'id': 'format_13', 'name': '13-Format-BA Jawab Sanggah PQ.docx', 'type': 'BA Jawab Sanggah PQ'},
        {'id': 'format_14', 'name': '14-Format-BA Pemberian Penjelasan Seleksi.docx', 'type': 'BA Pemberian Penjelasan Seleksi'},
        {'id': 'format_17', 'name': '17-Format-BA Admin Teknis File I.docx', 'type': 'BA Admin Teknis File I'},
        {'id': 'format_19', 'name': '19-Format-BA Evaluasi Biaya.docx', 'type': 'BA Evaluasi Biaya'},
        {'id': 'format_20', 'name': '20-Format-BA Kombinasi Teknis dan Biaya.docx', 'type': 'BA Kombinasi Teknis dan Biaya'},
        {'id': 'format_21', 'name': '21-Format-Surat Klarifikasi Personel.docx', 'type': 'Surat Klarifikasi Personel'},
        {'id': 'format_22', 'name': '22-Format-BA KLARIFIKASI PENETAPAN PEMENANG.docx', 'type': 'BA Klarifikasi Penetapan Pemenang'},
        {'id': 'format_22_lhp', 'name': '22-Format----------LHP.docx', 'type': 'LHP'},
        {'id': 'format_24', 'name': '24-Format-BA Penetapan Pemenang.docx', 'type': 'BA Penetapan Pemenang'},
        {'id': 'format_25', 'name': '25-Format-BA Pengumuman Pemenang.docx', 'type': 'BA Pengumuman Pemenang'},
        {'id': 'format_26', 'name': '26-Format-BA Jawab Sanggah Seleksi.docx', 'type': 'BA Jawab Sanggah Seleksi'},
        {'id': 'format_27_1', 'name': '27-1-Format-BA Klarifikasi Negosiasi.docx', 'type': 'BA Klarifikasi Negosiasi'},
        {'id': 'format_27_2', 'name': '27-2-Format-Daftar Hadir Klarneg.docx', 'type': 'Daftar Hadir Klarneg'},
        {'id': 'format_28', 'name': '28-Format-BAHP.docx', 'type': 'BAHP'},
        {'id': 'format_29', 'name': '29-Format-Surat Penyampaian BAHP.docx', 'type': 'Surat Penyampaian BAHP'},
        {'id': 'format_96', 'name': '96-Format-Surat pernyataan Klarifikasi personil dan paket 1 dan 2.docx', 'type': 'Surat Pernyataan Klarifikasi'},
        {'id': 'format_97', 'name': '97-Format-BA Seleksi Ulang.docx', 'type': 'BA Seleksi Ulang'},
        {'id': 'format_99', 'name': '99-Format-TTD Pokja.docx', 'type': 'TTD Pokja'}
    ]
    available_files = []
    if os.path.isdir(folder_path):
        for file in os.listdir(folder_path):
            if file.lower().endswith('.docx') and not file.startswith('~'):
                available_files.append(file)
    validated_documents = []
    for doc in expected_documents:
        is_available = doc['name'] in available_files
        validated_documents.append({'id': doc['id'], 'name': doc['name'], 'type': doc['type'], 'available': is_available, 'path': os.path.join(folder_path, doc['name']) if is_available else None})
    return jsonify({'success': True, 'folder_path': folder_path, 'documents': validated_documents, 'total_expected': len(expected_documents), 'total_available': sum(1 for d in validated_documents if d['available'])})


@bp.route('/api/get_folder_documents', methods=['POST'])
def get_folder_documents() -> Any:
    data = request.get_json() or {}
    folder_path = data.get('folder_path', '')
    if not folder_path or not os.path.exists(folder_path):
        return jsonify({'success': False, 'message': 'Folder tidak ditemukan'})
    documents = []
    if os.path.isdir(folder_path):
        for file in os.listdir(folder_path):
            if file.lower().endswith('.docx') and not file.startswith('~'):
                file_path = os.path.join(folder_path, file)
                documents.append({'name': file, 'path': file_path, 'size': os.path.getsize(file_path)})
    return jsonify({'success': True, 'documents': documents, 'count': len(documents)})


@bp.route('/api/validate_master_timlak_konsultan', methods=['POST'])
def validate_master_timlak_konsultan() -> Any:
    data = request.get_json() or {}
    folder_path = data.get('folder_path', '')
    if not folder_path or not os.path.exists(folder_path):
        return jsonify({'success': False, 'message': 'Folder tidak ditemukan'})
    
    # Load expected timlak documents from JSON file
    json_file_path = os.path.join(os.path.dirname(__file__), '..', 'static', 'timlak_konsultan.json')
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            expected_timlak_documents = json.load(f)
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error memuat file konfigurasi: {str(e)}'})
    available_files = {}
    if os.path.isdir(folder_path):
        for file in os.listdir(folder_path):
            if file.lower().endswith('.docx') and not file.startswith('~'):
                available_files[file] = True
    validated_documents = []
    for doc in expected_timlak_documents:
        is_available = doc['name'] in available_files
        validated_documents.append({'id': doc['id'], 'name': doc['name'], 'type': doc['type'], 'doc_num': doc['doc_num'], 'available': is_available, 'path': os.path.join(folder_path, doc['name']) if is_available else None})
    return jsonify({'success': True, 'folder_path': folder_path, 'documents': validated_documents, 'total_expected': len(expected_timlak_documents), 'total_available': sum(1 for d in validated_documents if d['available'])})


@bp.route('/api/load_pokja_members')
def load_pokja_members() -> Any:
    csv_path = os.path.join(os.getcwd(), 'pokja_members.csv')
    if not os.path.exists(csv_path):
        return jsonify({'success': False, 'error': 'File pokja_members.csv tidak ditemukan'}), 404
    group_filter = request.args.get('group', 'konsultan')
    members = []
    import csv
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if 'group' in row and row['group'].strip() != group_filter:
                    continue
                members.append({'nama': row.get('nama','').strip(), 'nip': row.get('nip','').strip(), 'email': row.get('email','').strip()})
    except Exception as e:
        return jsonify({'success': False, 'error': f'Error membaca CSV: {str(e)}'}), 500
    return jsonify({'success': True, 'members': members, 'group': group_filter})
