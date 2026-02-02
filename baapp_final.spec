# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller Spec File untuk BA Generator
FINAL RELEASE Configuration

Program Aktualisasi: Sistem Generator Berita Acara Terintegrasi
Pengembang: Muhammad Rayhan Kurniawan, S.Kom.
Instansi: Kementerian Pekerjaan Umum
Program: Aktualisasi Latsar CPNS 2025

Version: 1.0.0
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
    'docx.oxml.ns',
    'docx.shared',
    'docx.text',
    'docx.table',
    'docx.parts',
    'docx.document',
    'lxml',
    'lxml.etree',
    'lxml._elementpath',
    
    # openpyxl
    'openpyxl',
    'openpyxl.cell',
    'openpyxl.styles',
    
    # requests & beautifulsoup (SPSE crawler)
    'requests',
    'bs4',
    'beautifulsoup4',
    
    # Other dependencies
    'mammoth',
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
    ('app/templates', 'app/templates'),
    
    # Static files (CSS, JS, CSV, etc)
    ('static', 'static'),
    
    # Master BA folders (dari Master Folder)
    # Dipindahkan ke copy manual di build script agar ada di root folder (bukan _internal)
    # ('Master Folder/Master BA Pokja Konsultan', 'Master Folder/Master BA Pokja Konsultan'),
    # ('Master Folder/Master BA Timlak Fisik', 'Master Folder/Master BA Timlak Fisik'),
    # ('Master Folder/Master BA Timlak Konsultan', 'Master Folder/Master BA Timlak Konsultan'),
    # ('Master Folder/Master BA Timlak RO Konsultan', 'Master Folder/Master BA Timlak RO Konsultan'),
    # ('Master Folder/Master Pembuktian', 'Master Folder/Master Pembuktian'),
]

a = Analysis(
    ['run_build.py'],
    pathex=[],
    binaries=[],
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        'matplotlib',
        'pandas',
        'pytest',
        'IPython',
        'jupyter',
        'sphinx',
        'tkinter',
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
    name='BA Generator',
    debug=False,
    strip=False,
    upx=True,
    console=False,  # FINAL RELEASE (NO CONSOLE)
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='BA Generator',
)
