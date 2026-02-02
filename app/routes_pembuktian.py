import os
import json
import zipfile
import logging
from datetime import datetime
from flask import Blueprint, request, jsonify
from .excel_processor import fill_excel_pengalaman

logger = logging.getLogger(__name__)
bp = Blueprint('pembuktian', __name__)


@bp.route('/api/validate_master_pembuktian', methods=['POST'])
def validate_master_pembuktian():
    try:
        data = request.json
        folder_path = data.get('folder_path', '')
        if not folder_path:
            return jsonify({'success': False, 'error': 'Folder path tidak boleh kosong'})
            
        from .utils import get_master_folder_path
        folder_path = get_master_folder_path(folder_path)
        
        if not os.path.exists(folder_path):
            return jsonify({'success': False, 'error': 'Folder tidak ditemukan'})
        required_files = [
            {'name': '09.no-1-BA Pembuktian.docx', 'type': 'BA', 'description': 'Template Berita Acara Pembuktian'},
            {'name': '09.no-3-Lamp Kerja Sejenis.xlsx', 'type': 'Excel', 'description': 'Template Lampiran Pengalaman Sejenis'},
            {'name': '09.no-4-Daftar Hadir Pembuktian.docx', 'type': 'Daftar Hadir', 'description': 'Template Daftar Hadir Pembuktian'}
        ]
        validation_results = []
        for file_info in required_files:
            file_path = os.path.join(folder_path, file_info['name'])
            found = os.path.exists(file_path)
            validation_results.append({'name': file_info['name'], 'type': file_info['type'], 'description': file_info['description'], 'found': found, 'path': file_path if found else None})
        all_found = all(f['found'] for f in validation_results)
        return jsonify({'success': True, 'all_valid': all_found, 'files': validation_results, 'folder_path': folder_path})
    except Exception as e:
        logger.exception('validate_master_pembuktian failed')
        return jsonify({'success': False, 'error': str(e)})


@bp.route('/api/generate_pembuktian_folders', methods=['POST'])
def generate_pembuktian_folders():
    try:
        data = request.json
        companies = data.get('companies', [])
        pengalaman = data.get('pengalaman', {})
        master_folder = data.get('master_folder', '')
        
        from .utils import get_master_folder_path
        master_folder = get_master_folder_path(master_folder)
        
        if not companies:
            return jsonify({'success': False, 'error': 'Tidak ada perusahaan yang diproses'}), 400
        if not master_folder or not os.path.exists(master_folder):
            return jsonify({'success': False, 'error': 'Folder master data tidak valid'}), 400
        PROCESSED_FILES_DIR = os.path.join(os.getcwd(), 'processed_results')
        os.makedirs(PROCESSED_FILES_DIR, exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_folder = os.path.join(PROCESSED_FILES_DIR, f'Pembuktian_{timestamp}')
        os.makedirs(output_folder, exist_ok=True)
        master_files = ['09.no-1-BA Pembuktian.docx', '09.no-3-Lamp Kerja Sejenis.xlsx', '09.no-4-Daftar Hadir Pembuktian.docx']
        for company in companies:
            company_no = company.get('no', 0)
            company_name = company.get('name', '')
            kso_list = company.get('kso', [])
            nama_kso = company.get('namaKSO', '')
            formatted_no = str(company_no).zfill(2)
            folder_name = f"{formatted_no}- {company_name}"
            company_folder = os.path.join(output_folder, folder_name)
            os.makedirs(company_folder, exist_ok=True)
            for file_name in master_files:
                src_path = os.path.join(master_folder, file_name)
                new_file_name = file_name.replace('09.no-', f'09.{formatted_no}-')
                dst_path = os.path.join(company_folder, new_file_name)
                if not os.path.exists(src_path):
                    return jsonify({'success': False, 'error': f'File master tidak ditemukan: {file_name}'}), 400
                import shutil
                shutil.copy2(src_path, dst_path)
                if file_name == '09.no-3-Lamp Kerja Sejenis.xlsx':
                    company_info = {
                        'no': company_no,
                        'name': company_name,
                        'nama_kso': nama_kso,
                        'leadfirm': company_name,
                        'kso_anggota2': kso_list[0] if len(kso_list) > 0 else '',
                        'kso_anggota3': kso_list[1] if len(kso_list) > 1 else '',
                        'kso_anggota4': kso_list[2] if len(kso_list) > 2 else '',
                        'kso_anggota5': kso_list[3] if len(kso_list) > 3 else ''
                    }
                    fill_excel_pengalaman(dst_path, company_info, pengalaman, data)
                if file_name.endswith('.docx'):
                    word_keywords = {
                        'no': formatted_no,
                        'nama_kso': nama_kso,
                        'leadfirm': company_name,
                        'kso_anggota2': kso_list[0] if len(kso_list) > 0 else '',
                        'kso_anggota3': kso_list[1] if len(kso_list) > 1 else '',
                        'kso_anggota4': kso_list[2] if len(kso_list) > 2 else '',
                        'kso_anggota5': kso_list[3] if len(kso_list) > 3 else ''
                    }
                    global_keywords = data.get('keywords', {})
                    word_keywords.update(global_keywords)
                    keywords_to_delete_rows = []
                    if not kso_list or len(kso_list) == 0:
                        keywords_to_delete_rows.extend(['kso_anggota2', 'kso_anggota3', 'kso_anggota4', 'kso_anggota5'])
                    else:
                        if len(kso_list) < 1:
                            keywords_to_delete_rows.append('kso_anggota2')
                        if len(kso_list) < 2:
                            keywords_to_delete_rows.append('kso_anggota3')
                        if len(kso_list) < 3:
                            keywords_to_delete_rows.append('kso_anggota4')
                        if len(kso_list) < 4:
                            keywords_to_delete_rows.append('kso_anggota5')
                    from .docx_processor import process_docx_comprehensive
                    process_docx_comprehensive(dst_path, word_keywords, dst_path, keywords_to_delete_rows=keywords_to_delete_rows)
        zip_filename = f'Pembuktian_{timestamp}.zip'
        zip_path = os.path.join(PROCESSED_FILES_DIR, zip_filename)
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(output_folder):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, output_folder)
                    zipf.write(file_path, arcname)
        import shutil
        shutil.rmtree(output_folder)
        keywords = data.get('keywords', {})
        return jsonify({'success': True, 'message': f'✓ {len(companies)} folder berhasil dibuat dengan {len(master_files)} file per folder', 'download_url': f'/download_file/{zip_filename}', 'companies_processed': len(companies), 'pengalaman': pengalaman}), 200
    except Exception as e:
        logger.exception('generate_pembuktian_folders failed')
        return jsonify({'success': False, 'error': f'Terjadi kesalahan: {str(e)}'}), 500
