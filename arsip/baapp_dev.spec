# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller Spec File untuk BA Generator
Development Build Configuration

PERINGATAN: Ini adalah konfigurasi untuk versi DEVELOPMENT/TESTING
File .exe yang dihasilkan adalah versi BETA untuk testing saja.

Version: 0.1.0-dev
"""

import sys
from PyInstaller.utils.hooks import collect_data_files, collect_submodules

block_cipher = None

# Collect all hidden imports
hiddenimports = [
    # Flask and dependencies
    'flask',
    'jinja2',
    'werkzeug',
    'werkzeug.security',
    'werkzeug.urls',
    'click',
    'itsdangerous',
    
    # python-docx and dependencies
    'docx',
    'docx.oxml',
    'docx.oxml.text',
    'docx.oxml.table',
    'docx.oxml.section',
    'docx.shared',
    'docx.text',
    'docx.table',
    'docx.parts',
    'docx.document',
    'lxml',
    'lxml.etree',
    
    # Other dependencies
    'zipfile',
    'datetime',
    'json',
    'csv',
    'threading',
    'webbrowser',
    'logging',
]

# Data files to include
datas = [
    # Templates HTML
    ('templates', 'templates'),
    
    # Static files (CSS, JS, CSV, etc)
    ('static', 'static'),
    
    # Master BA folders (dari _internal)
    ('_internal/Master BA Pokja Konsultan', 'Master Folder/Master BA Pokja Konsultan'),
    ('_internal/Master BA Timlak Konsultan', 'Master Folder/Master BA Timlak Konsultan'),
    ('_internal/Master Pembuktian', 'Master Folder/Master Pembuktian'),
]

a = Analysis(
    ['run_app.py'],
    pathex=[],
    binaries=[],
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        'matplotlib',
        'numpy',
        'pandas',
        'pytest',
        'IPython',
        'jupyter',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyd = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyd,
    a.scripts,
    [],
    exclude_binaries=True,
    name='BA Generator (BETA)',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,  # Set True untuk melihat logs (development mode)
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    # icon='icon.ico'  # Uncomment jika ada file icon.ico
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='BA Generator (BETA)',
)
