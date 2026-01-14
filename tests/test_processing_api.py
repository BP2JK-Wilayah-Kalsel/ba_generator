import os
import io
import json
import shutil
import tempfile
from datetime import datetime

import pytest

from app import create_app
from config import DefaultConfig


@pytest.fixture
def client(tmp_path, monkeypatch):
    # Use a temp processed files dir for tests
    temp_processed = tmp_path / "processed_results"
    temp_processed.mkdir()
    monkeypatch.setenv('BAAPP_DEBUG', 'True')
    monkeypatch.setenv('BAAPP_PORT', '5001')

    # Override config.PROCESSED_FILES_DIR and module-level constant used by routes
    monkeypatch.setattr(DefaultConfig, 'PROCESSED_FILES_DIR', str(temp_processed))
    import app.routes_processing as routes_processing_module
    monkeypatch.setattr(routes_processing_module, 'PROCESSED_FILES_DIR', str(temp_processed))

    app = create_app('config.DefaultConfig')
    app.config['TESTING'] = True

    with app.test_client() as client:
        yield client


def test_process_comprehensive_no_input_returns_error(client):
    # POST without master_folder_data and without files
    resp = client.post('/process_comprehensive', data={})
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['success'] is False
    assert 'Pilih master folder' in data['message']


def test_process_keywords_no_files_returns_error(client):
    resp = client.post('/process_keywords', data={})
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['success'] is False
    assert 'Tidak ada file yang diupload' in data['message']


def test_save_and_export_defaults(client, tmp_path):
    saved_dir = tmp_path / 'saved_data'
    os.makedirs(saved_dir, exist_ok=True)

    # Ensure app will use cwd for saved_data; monkeypatching cwd is heavy, instead create file via endpoint
    payload = {'foo': 'bar'}
    resp = client.post('/api/save_defaults', json=payload)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['success'] is True
    filename = data.get('filename')
    assert filename and filename.endswith('.json')

    # Now request export
    resp2 = client.get(f'/api/export_defaults/{filename}')
    assert resp2.status_code == 200
    # Content-disposition header should contain filename
    assert filename in resp2.headers.get('Content-Disposition', '')

    # Clean up created saved_data file
    try:
        os.remove(os.path.join(os.getcwd(), 'saved_data', filename))
    except Exception:
        pass


def test_download_file_and_results(client, tmp_path):
    # Create a dummy .docx in processed_results and test download_file and download_results
    proc_dir = DefaultConfig.PROCESSED_FILES_DIR
    os.makedirs(proc_dir, exist_ok=True)
    sample_path = os.path.join(proc_dir, 'sample.docx')
    with open(sample_path, 'wb') as f:
        f.write(b'PK\x03\x04')

    # download_file
    resp = client.get('/download_file/sample.docx')
    assert resp.status_code == 200
    assert resp.data.startswith(b'PK')

    # download_results -> should produce a zip
    resp2 = client.get('/download_results')
    assert resp2.status_code == 200
    # basic check for zip signature
    assert resp2.data[:2] == b'PK'

    # cleanup
    try:
        os.remove(sample_path)
        # remove generated zip in processed_results
        for fname in os.listdir(proc_dir):
            if fname.endswith('.zip'):
                os.remove(os.path.join(proc_dir, fname))
    except Exception:
        pass
