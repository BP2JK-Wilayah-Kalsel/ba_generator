import os
import json
import zipfile
from datetime import datetime
import logging
from flask import Blueprint, jsonify, request, send_file, send_from_directory
from config import DefaultConfig
from .utils import DOCUMENT_TYPES

logger = logging.getLogger(__name__)
bp = Blueprint('processing', __name__)

PROCESSED_FILES_DIR = DefaultConfig.PROCESSED_FILES_DIR


@bp.route('/download_results')
def download_results():
    try:
        zip_filename = f"BA_Generated_{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"
        zip_path = os.path.join(PROCESSED_FILES_DIR, zip_filename)
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(PROCESSED_FILES_DIR):
                for file in files:
                    if file.endswith('.docx'):
                        file_path = os.path.join(root, file)
                        arcname = file
                        zipf.write(file_path, arcname)
        return send_file(zip_path, as_attachment=True, download_name=zip_filename)
    except Exception as e:
        logger.exception('Failed to create ZIP')
        return jsonify({'error': str(e)}), 500


@bp.route('/download_file/<path:filename>')
def download_file(filename):
    try:
        return send_from_directory(PROCESSED_FILES_DIR, filename, as_attachment=True)
    except Exception as e:
        logger.exception('Failed to send file')
        return jsonify({'error': str(e)}), 500


@bp.route('/api/document_types')
def get_document_types():
    return jsonify({'document_types': DOCUMENT_TYPES})


@bp.route('/process_comprehensive', methods=['POST'])
def process_comprehensive():
    try:
        # Lazy imports to avoid circular dependencies
        from .utils import clean_old_processed_files, generate_comprehensive_keywords
        from app.docx_processor import process_docx_comprehensive

        clean_old_processed_files()

        form_data = request.form.to_dict()
        master_folder_json = form_data.get('master_folder_data')
        uploaded_files = request.files.getlist('template_files')

        keywords_json = form_data.get('keywords', '{}')
        deleted_docs_json = form_data.get('deleted_documents', '[]')
        keywords_to_delete_rows_json = form_data.get('keywords_to_delete_rows', '[]')
        selected_docs_json = form_data.get('selected_documents', '[]')

        try:
            keywords = json.loads(keywords_json)
            deleted_documents = json.loads(deleted_docs_json)
            keywords_to_delete_rows = json.loads(keywords_to_delete_rows_json)
            selected_documents = json.loads(selected_docs_json)
        except Exception:
            keywords = generate_comprehensive_keywords(form_data)
            deleted_documents = []
            keywords_to_delete_rows = []
            selected_documents = []

        processed_files = []
        failed_files = []

        # Process master folder if provided
        if master_folder_json:
            try:
                master_folder_data = json.loads(master_folder_json)
                available_docs = [doc for doc in master_folder_data.get('documents', []) if doc.get('available')]

                logger.debug('Total available docs: %s', len(available_docs))
                logger.debug('Available doc IDs: %s', [doc.get('id') for doc in available_docs])
                logger.debug('Selected documents (from frontend): %s', selected_documents)

                # Filter by selected documents if provided
                if selected_documents:
                    def matches_selection(doc_id, selected_codes):
                        if doc_id.startswith('format_'):
                            code = doc_id[7:]
                            return code in selected_codes
                        elif doc_id.startswith('timlak_'):
                            code = doc_id[7:]
                            return code in selected_codes
                        return False

                    available_docs = [doc for doc in available_docs if matches_selection(doc.get('id', ''), selected_documents)]

                    logger.debug('After filtering by selection: %s', len(available_docs))
                    logger.debug('Docs to process: %s', [doc.get('id') for doc in available_docs])

                if not available_docs:
                    return jsonify({'success': False, 'message': 'Tidak ada dokumen yang dipilih atau tersedia untuk diproses. Silakan pilih dokumen dengan mencentang checkbox di tabel.'})

                for doc in available_docs:
                    try:
                        source_path = doc.get('path')
                        output_filename = doc.get('name')
                        output_path = os.path.join(PROCESSED_FILES_DIR, output_filename)

                        success, result = process_docx_comprehensive(source_path, keywords, output_path, deleted_documents, keywords_to_delete_rows)

                        if success:
                            processed_files.append({'filename': output_filename, 'original_filename': doc.get('name'), 'document_type': doc.get('type'), 'replacements': result.get('total_replacements', 0), 'log_entries': result.get('log_entries', []), 'keyword_details': result.get('keyword_details', {})})
                        else:
                            failed_files.append({'filename': doc.get('name'), 'error': result.get('error', 'Unknown error')})

                    except Exception as e:
                        failed_files.append({'filename': doc.get('name', ''), 'error': str(e)})

            except Exception as e:
                return jsonify({'success': False, 'message': f'Error processing master folder: {str(e)}'})

        # Process uploaded files (fallback for backward compatibility)
        elif uploaded_files and any(f.filename != '' for f in uploaded_files):
            for file in uploaded_files:
                if file.filename == '':
                    continue
                if not file.filename.lower().endswith('.docx'):
                    failed_files.append({'filename': file.filename, 'error': 'File bukan format .docx'})
                    continue
                try:
                    temp_input = os.path.join(PROCESSED_FILES_DIR, f"temp_{file.filename}")
                    file.save(temp_input)
                    output_filename = file.filename
                    output_path = os.path.join(PROCESSED_FILES_DIR, output_filename)
                    success, result = process_docx_comprehensive(temp_input, keywords, output_path, deleted_documents, keywords_to_delete_rows)
                    os.remove(temp_input)
                    if success:
                        processed_files.append({'filename': output_filename, 'original_filename': file.filename, 'replacements': result.get('total_replacements', 0), 'log_entries': result.get('log_entries', [])})
                    else:
                        failed_files.append({'filename': file.filename, 'error': result.get('error', 'Unknown error')})
                except Exception as e:
                    failed_files.append({'filename': file.filename, 'error': str(e)})
        else:
            return jsonify({'success': False, 'message': 'Pilih master folder atau upload file template'})

        return jsonify({'success': True, 'files': processed_files, 'failed_files': failed_files, 'keywords_used': keywords})
    except Exception as e:
        logger.exception('process_comprehensive failed')
        return jsonify({'success': False, 'message': str(e)})


@bp.route('/process_keywords', methods=['POST'])
def process_keywords():
    try:
        import shutil
        from app.docx_processor import process_docx_keywords
        from .utils import generate_keywords_from_form

        shutil.rmtree(PROCESSED_FILES_DIR, ignore_errors=True)
        os.makedirs(PROCESSED_FILES_DIR, exist_ok=True)

        form_data = request.form.to_dict()
        uploaded_files = request.files.getlist('template_files')
        if not uploaded_files or all(f.filename == '' for f in uploaded_files):
            return jsonify({'success': False, 'message': 'Tidak ada file yang diupload'})

        keywords = generate_keywords_from_form(form_data)
        processed_files = []
        failed_files = []

        for file in uploaded_files:
            if file.filename == '':
                continue
            if not file.filename.lower().endswith('.docx'):
                failed_files.append({'filename': file.filename, 'error': 'File bukan format .docx'})
                continue
            try:
                temp_input = os.path.join(PROCESSED_FILES_DIR, f"temp_{file.filename}")
                file.save(temp_input)
                output_filename = file.filename
                if 'Format' in output_filename:
                    doc_type = form_data.get('document_type', '')
                    if doc_type and doc_type in DOCUMENT_TYPES:
                        output_filename = output_filename.replace('Format', f'{doc_type}-{form_data.get("kode_pokja", "")} -')
                output_path = os.path.join(PROCESSED_FILES_DIR, output_filename)
                success, result = process_docx_keywords(temp_input, keywords, output_path)
                os.remove(temp_input)
                if success:
                    processed_files.append({'filename': output_filename, 'original_filename': file.filename, 'replacements': result['total_replacements'], 'log_entries': result['log_entries']})
                else:
                    failed_files.append({'filename': file.filename, 'error': result.get('error', 'Unknown error')})
            except Exception as e:
                failed_files.append({'filename': file.filename, 'error': str(e)})

        return jsonify({'success': True, 'files': processed_files, 'failed_files': failed_files, 'keywords_used': keywords})
    except Exception as e:
        logger.exception('process_keywords failed')
        return jsonify({'success': False, 'message': str(e)})


@bp.route('/api/save_defaults', methods=['POST'])
def save_defaults():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'})
        saved_data_dir = os.path.join(os.getcwd(), 'saved_data')
        os.makedirs(saved_data_dir, exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"defaults_{timestamp}.json"
        filepath = os.path.join(saved_data_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return jsonify({'success': True, 'message': 'Data berhasil disimpan', 'filename': filename})
    except Exception as e:
        logger.exception('save_defaults failed')
        return jsonify({'success': False, 'message': str(e)})


@bp.route('/api/load_defaults/<filename>')
def load_defaults(filename):
    try:
        saved_data_dir = os.path.join(os.getcwd(), 'saved_data')
        filepath = os.path.join(saved_data_dir, filename)
        if not os.path.exists(filepath):
            return jsonify({'success': False, 'message': 'File tidak ditemukan'})
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return jsonify({'success': True, 'data': data, 'message': 'Data berhasil dimuat'})
    except Exception as e:
        logger.exception('load_defaults failed')
        return jsonify({'success': False, 'message': str(e)})


@bp.route('/api/list_saved_defaults')
def list_saved_defaults():
    try:
        saved_data_dir = os.path.join(os.getcwd(), 'saved_data')
        if not os.path.exists(saved_data_dir):
            return jsonify({'success': True, 'files': []})
        files = []
        for filename in os.listdir(saved_data_dir):
            if filename.endswith('.json') and filename.startswith('defaults_'):
                filepath = os.path.join(saved_data_dir, filename)
                stat = os.stat(filepath)
                files.append({'filename': filename, 'created': datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d %H:%M:%S'), 'size': stat.st_size})
        files.sort(key=lambda x: x['created'], reverse=True)
        return jsonify({'success': True, 'files': files})
    except Exception as e:
        logger.exception('list_saved_defaults failed')
        return jsonify({'success': False, 'message': str(e)})


@bp.route('/api/export_defaults/<filename>')
def export_defaults(filename):
    try:
        saved_data_dir = os.path.join(os.getcwd(), 'saved_data')
        filepath = os.path.join(saved_data_dir, filename)
        if not os.path.exists(filepath):
            return jsonify({'error': 'File tidak ditemukan'}), 404
        return send_file(filepath, as_attachment=True, download_name=filename)
    except Exception as e:
        logger.exception('export_defaults failed')
        return jsonify({'error': str(e)}), 500


@bp.route('/api/import_defaults', methods=['POST'])
def import_defaults():
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'message': 'No file uploaded'})
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No file selected'})
        if not file.filename.lower().endswith('.json'):
            return jsonify({'success': False, 'message': 'File harus berformat JSON'})
        try:
            data = json.load(file)
        except json.JSONDecodeError:
            return jsonify({'success': False, 'message': 'File JSON tidak valid'})
        saved_data_dir = os.path.join(os.getcwd(), 'saved_data')
        os.makedirs(saved_data_dir, exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"imported_{timestamp}.json"
        filepath = os.path.join(saved_data_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return jsonify({'success': True, 'data': data, 'message': 'Data berhasil diimport', 'filename': filename})
    except Exception as e:
        logger.exception('import_defaults failed')
        return jsonify({'success': False, 'message': str(e)})
