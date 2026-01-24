import os
import json
import re
import zipfile
from datetime import datetime
import logging
from flask import Blueprint, jsonify, request, send_file, send_from_directory
from config import DefaultConfig

logger = logging.getLogger(__name__)
bp = Blueprint('processing', __name__)

PROCESSED_FILES_DIR = DefaultConfig.PROCESSED_FILES_DIR


@bp.route('/download_results')
def download_results():
    try:
        kode_pokja = request.args.get('kode_pokja', '').strip()
        nama_paket = request.args.get('nama_paket', '').strip()

        # Load metadata if params are missing
        if not (kode_pokja or nama_paket):
            metadata_path = os.path.join(PROCESSED_FILES_DIR, 'zip_metadata.json')
            if os.path.exists(metadata_path):
                try:
                    with open(metadata_path, 'r') as f:
                        meta = json.load(f)
                        if not kode_pokja:
                            kode_pokja = meta.get('kode_pokja', '').strip()
                        if not nama_paket:
                            nama_paket = meta.get('nama_paket', '').strip()
                except Exception as e:
                    logger.error(f"Failed to read zip metadata: {e}")

        folder_name = "Hasil Reviu"
        
        # Sanitize for folder name
        safe_kode = re.sub(r'[\\/*?:"<>|]', '_', kode_pokja)
        safe_paket = re.sub(r'[\\/*?:"<>|]', '_', nama_paket)
        
        if safe_kode and safe_paket:
            folder_name = f"{safe_kode} ({safe_paket})"
        elif safe_paket:
            folder_name = safe_paket
        elif safe_kode:
            folder_name = safe_kode

        zip_filename = f"BA_Timlak_Generated_{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"
        zip_path = os.path.join(PROCESSED_FILES_DIR, zip_filename)
        
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # Create empty folder structure
            subfolders = [
                "01. Berkas Usulan/01. Dokumen Persiapan Pengadaan",
                "01. Berkas Usulan/02. Dokumen Pemilihan",
                "02. Checklist Pemeriksaan",
                "03. SK",
                "04. Undangan Reviu",
                "05. Reviu"
            ]
            for sf in subfolders:
                zip_info = zipfile.ZipInfo(f"{folder_name}/{sf}/")
                zipf.writestr(zip_info, '')

            for root, dirs, files in os.walk(PROCESSED_FILES_DIR):
                for file in files:
                    if file.endswith('.docx'):
                        file_path = os.path.join(root, file)
                        arcname = f"{folder_name}/05. Reviu/{file}"
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

@bp.route('/process_comprehensive', methods=['POST'])
def process_comprehensive():
    try:
        # Lazy imports to avoid circular dependencies
        from .utils import clean_old_processed_files, generate_comprehensive_keywords
        from app.docx_processor import process_docx_comprehensive

        clean_old_processed_files()

        form_data = request.form.to_dict()
        # Get folder name instead of full data
        master_folder_name = form_data.get('masterFolderPath')

        keywords_json = form_data.get('keywords', '{}')
        selected_docs_json = form_data.get('selected_documents', '[]')
        
        # Determine document types based on folder name
        if master_folder_name and 'Fisik' in master_folder_name:
             from .utils import DOCUMENT_TYPES_FISIK as CURRENT_DOCUMENT_TYPES
        else:
             from .utils import DOCUMENT_TYPES as CURRENT_DOCUMENT_TYPES

        try:
            keywords = json.loads(keywords_json)
            selected_documents = json.loads(selected_docs_json)
        except Exception as e:
            logger.error(f"Error parsing JSON: {e}")
            keywords = generate_comprehensive_keywords(form_data)
            selected_documents = []

        # Save metadata for zip generation
        try:
            metadata = {
                'kode_pokja': keywords.get('kode_pokja', ''),
                'nama_paket': keywords.get('nama_paket', '')
            }
            with open(os.path.join(PROCESSED_FILES_DIR, 'zip_metadata.json'), 'w') as f:
                json.dump(metadata, f)
        except Exception as e:
            logger.error(f"Failed to save zip metadata: {e}")

        processed_files = []
        failed_files = []

        # Process master folder if provided
        if master_folder_name:
            try:
                # Construct path to master folder
                base_folder = os.path.join(os.getcwd(), 'Master Folder', master_folder_name)
                # logger.info(f"Files found in master folder: {base_folder}")
                # Check if folder exists
                if not os.path.exists(base_folder):
                    return jsonify({'success': False, 'message': f'Master folder not found: {master_folder_name}'})
                
                # Load documents from folder
                available_docs = []
                for filename in os.listdir(base_folder):
                    if filename.endswith('.docx') and not filename.startswith('~$'):
                        # Determine document ID/type based on filename pattern
                        doc_id = ''
                        doc_type = ''
                        
                        # Match with DOCUMENT_TYPES patterns
                        # Sort keys by length descending to match longer prefixes first (e.g. '22-LHP' before '22')
                        sorted_keys = sorted(CURRENT_DOCUMENT_TYPES.keys(), key=len, reverse=True)
                        logger.debug('Available document types: %s', sorted_keys)
                        # Special handling for Daftar Hadir files
                        if filename == '!Daftar Hadir Prareviu 1.docx':
                            doc_id = 'DHP1'
                            doc_type = 'Daftar Hadir Prareviu 1'
                        elif filename == '!Daftar Hadir Prareviu 2.docx':
                            doc_id = 'DHP2'
                            doc_type = 'Daftar Hadir Prareviu 2'
                        elif filename == '!Daftar Hadir SIPASTI.docx':
                            doc_id = 'DHS'
                            doc_type = 'Daftar Hadir SIPASTI'
                        elif filename == '!Daftar Hadir.docx':
                            doc_id = 'DH'
                            doc_type = 'Daftar Hadir'
                        else:
                            for dt_key in sorted_keys:
                                dt_name = CURRENT_DOCUMENT_TYPES[dt_key]
                                if filename.startswith(dt_key):
                                    doc_id = dt_key
                                    doc_type = dt_name
                                    break
                        
                        # If no specific match, use filename as ID
                        if not doc_id:
                            doc_id = filename
                            doc_type = 'Dokumen Pendukung'
                            
                        available_docs.append({
                            'id': doc_id,
                            'name': filename,
                            'path': os.path.join(base_folder, filename),
                            'type': doc_type,
                            'available': True
                        })

                # Sort available_docs based on the order of keys in CURRENT_DOCUMENT_TYPES
                doc_order = list(CURRENT_DOCUMENT_TYPES.keys())
                
                def get_sort_key(doc):
                    doc_id = doc['id']
                    try:
                        return doc_order.index(doc_id)
                    except ValueError:
                        # Put unknown docs at the end, sorted alphabetically by ID
                        return 9999 + (1 if doc_id > '' else 0)

                available_docs.sort(key=get_sort_key)

                logger.debug('Total available docs in %s: %s', master_folder_name, len(available_docs))
                logger.debug('Available docs sorted: %s', [d['id'] for d in available_docs])
                logger.debug('Selected documents (from frontend): %s', selected_documents)

                # Filter by selected documents if provided
                if selected_documents and len(selected_documents) > 0:
                    logger.debug(f"Filtering available_docs with selected_documents: {selected_documents}")
                    
                    def matches_selection(doc_id, selected_codes):
                        # Clean up doc_id if needed to match selection format
                        # The selection usually comes as simple codes (e.g., 'A', 'B') or full IDs
                        
                        # Debug info for matching
                        # logger.debug(f"Matching doc_id='{doc_id}' against codes={selected_codes}")
                        
                        # Try exact match first
                        if doc_id in selected_codes:
                            return True
                            
                        # Try prefix matching for known types
                        if doc_id.startswith('format_'):
                            code = doc_id[7:]
                            if code in selected_codes:
                                return True
                        elif doc_id.startswith('timlak_'):
                            code = doc_id[7:]
                            if code in selected_codes:
                                return True
                            
                        return False

                    # Log available docs before filtering
                    logger.debug(f"Available docs before filter: {[d.get('id') for d in available_docs]}")
                    
                    filtered_docs = []
                    for doc in available_docs:
                        if matches_selection(doc.get('id', ''), selected_documents):
                            filtered_docs.append(doc)
                        else:
                            # Optional: log what was excluded
                            logger.debug(f"Excluded doc: {doc.get('id')}")
                            pass
                            
                    available_docs = filtered_docs

                    logger.debug('After filtering by selection: %s', len(available_docs))
                    logger.debug('Docs to process: %s', [doc.get('id') for doc in available_docs])
                else:
                    logger.debug("No selected_documents provided or empty list, processing all available docs if any.")

                if not available_docs:
                    return jsonify({'success': False, 'message': 'Tidak ada dokumen yang dipilih atau tersedia untuk diproses. Silakan pilih dokumen dengan mencentang checkbox di tabel.'})

                logger.debug(f"Available docs after filter: {[d.get('id') for d in available_docs]}")
                for doc in available_docs:
                    logger.debug(f"Processing doc: {doc.get('id')}")
                    try:
                        source_path = doc.get('path')
                        output_filename = doc.get('name')
                        output_path = os.path.join(PROCESSED_FILES_DIR, output_filename)

                        success, result = process_docx_comprehensive(source_path, keywords, output_path)

                        if success:
                            processed_files.append({'filename': output_filename, 'original_filename': doc.get('name'), 'document_type': doc.get('type'), 'replacements': result.get('total_replacements', 0), 'log_entries': result.get('log_entries', []), 'keyword_details': result.get('keyword_details', {})})
                        else:
                            failed_files.append({'filename': doc.get('name'), 'error': result.get('error', 'Unknown error')})

                    except Exception as e:
                        failed_files.append({'filename': doc.get('name', ''), 'error': str(e)})

            except Exception as e:
                return jsonify({'success': False, 'message': f'Error processing master folder: {str(e)}'})

        else:
            return jsonify({'success': False, 'message': 'Pilih master'})

        return jsonify({'success': True, 'files': processed_files, 'failed_files': failed_files, 'keywords_used': keywords})
    except Exception as e:
        logger.exception('process_comprehensive failed')
        return jsonify({'success': False, 'message': str(e)})


# @bp.route('/process_keywords', methods=['POST'])
# def process_keywords():
#     try:
#         import shutil
#         from app.docx_processor import process_docx_keywords
#         from .utils import generate_keywords_from_form

#         shutil.rmtree(PROCESSED_FILES_DIR, ignore_errors=True)
#         os.makedirs(PROCESSED_FILES_DIR, exist_ok=True)

#         form_data = request.form.to_dict()
#         uploaded_files = request.files.getlist('template_files')
#         if not uploaded_files or all(f.filename == '' for f in uploaded_files):
#             return jsonify({'success': False, 'message': 'Tidak ada file yang diupload'})

#         keywords = generate_keywords_from_form(form_data)
#         processed_files = []
#         failed_files = []

#         for file in uploaded_files:
#             if file.filename == '':
#                 continue
#             if not file.filename.lower().endswith('.docx'):
#                 failed_files.append({'filename': file.filename, 'error': 'File bukan format .docx'})
#                 continue
#             try:
#                 temp_input = os.path.join(PROCESSED_FILES_DIR, f"temp_{file.filename}")
#                 file.save(temp_input)
#                 output_filename = file.filename
#                 if 'Format' in output_filename:
#                     doc_type = form_data.get('document_type', '')
#                     if doc_type and doc_type in DOCUMENT_TYPES:
#                         output_filename = output_filename.replace('Format', f'{doc_type}-{form_data.get("kode_pokja", "")} -')
#                 output_path = os.path.join(PROCESSED_FILES_DIR, output_filename)
#                 success, result = process_docx_keywords(temp_input, keywords, output_path)
#                 os.remove(temp_input)
#                 if success:
#                     processed_files.append({'filename': output_filename, 'original_filename': file.filename, 'replacements': result['total_replacements'], 'log_entries': result['log_entries']})
#                 else:
#                     failed_files.append({'filename': file.filename, 'error': result.get('error', 'Unknown error')})
#             except Exception as e:
#                 failed_files.append({'filename': file.filename, 'error': str(e)})

#         return jsonify({'success': True, 'files': processed_files, 'failed_files': failed_files, 'keywords_used': keywords})
#     except Exception as e:
#         logger.exception('process_keywords failed')
#         return jsonify({'success': False, 'message': str(e)})


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
