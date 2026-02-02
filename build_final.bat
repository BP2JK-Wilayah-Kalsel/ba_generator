@echo off
REM ============================================================================
REM BA Generator - Build Script (FINAL VERSION)
REM ============================================================================
REM Program Aktualisasi: Sistem Generator Berita Acara Terintegrasi
REM Pengembang: Muhammad Rayhan Kurniawan, S.Kom.
REM Instansi: Kementerian Pekerjaan Umum
REM Program: Latsar 2025
REM ============================================================================

echo.
echo ============================================================================
echo BA GENERATOR - BUILD FINAL v1.0.0
echo ============================================================================
echo Program Aktualisasi Latsar 2025
echo Pengembang: Muhammad Rayhan Kurniawan, S.Kom.
echo Instansi: Kementerian Pekerjaan Umum
echo ============================================================================
echo.

REM Check if PyInstaller is installed
python -c "import PyInstaller" 2>nul
if errorlevel 1 (
    echo [ERROR] PyInstaller belum terinstall!
    echo.
    echo Jalankan command berikut untuk install PyInstaller:
    echo    pip install pyinstaller
    echo.
    pause
    exit /b 1
)

REM Hapus folder build dan dist lama
echo [1/6] Membersihkan build lama...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
if exist "BA Generator.spec" del "BA Generator.spec"
echo      Selesai.
echo.

REM Build dengan PyInstaller menggunakan spec file
echo [2/6] Building dengan PyInstaller...
echo      Ini mungkin memakan waktu beberapa menit...
echo.

pyinstaller baapp_final.spec --clean --noconfirm

if errorlevel 1 (
    echo.
    echo [ERROR] Build gagal! Periksa error di atas.
    pause
    exit /b 1
)

echo      Build selesai!
echo.

REM Verifikasi build
echo [3/6] Verifying build...
if not exist "dist\BA Generator\BA Generator.exe" (
    echo [ERROR] Executable tidak ditemukan!
    pause
    exit /b 1
)
echo      Executable berhasil dibuat.
echo.

REM Buat folder processed_results
echo [4/6] Membuat folder processed_results...
if not exist "dist\BA Generator\processed_results" mkdir "dist\BA Generator\processed_results"
echo      Folder processed_results dibuat.
echo.

REM Copy Master Folder Template
echo [5.5/6] Menyalin Master Folder Template...
xcopy "Master Folder" "dist\BA Generator\Master Folder\" /E /I /H /Y
echo      Master Folder berhasil disalin.
echo.

REM Copy README dan file pendukung
echo [6/6] Menyalin dokumentasi...
if exist README_FINAL.md copy README_FINAL.md "dist\BA Generator\README.md"
if exist CARA_PENGGUNAAN.txt copy CARA_PENGGUNAAN.txt "dist\BA Generator\CARA_PENGGUNAAN.txt"
if exist SYSTEM_REQUIREMENTS.txt copy SYSTEM_REQUIREMENTS.txt "dist\BA Generator\SYSTEM_REQUIREMENTS.txt"
echo      Dokumentasi berhasil disalin.
echo.

REM Buat file CREDITS
echo [6/6] Membuat file informasi...
(
echo ============================================================================
echo BA GENERATOR - Sistem Generator Berita Acara Terintegrasi
echo ============================================================================
echo.
echo Version: 1.0.0
echo Release Date: %date%
echo.
echo PROGRAM AKTUALISASI LATSAR 2025
echo.
echo Pengembang:
echo   Muhammad Rayhan Kurniawan, S.Kom.
echo   Kementerian Pekerjaan Umum
echo.
echo Instansi:
echo   Balai Pelaksana Pemilihan Jasa Konstruksi Wilayah Kalimantan Selatan
echo   Kementerian Pekerjaan Umum
echo.
echo Program:
echo   Pelatihan Dasar CPNS ^(Latsar^) 2025
echo.
echo Deskripsi:
echo   Aplikasi ini dikembangkan sebagai bagian dari Proyek Aktualisasi
echo   Pelatihan Dasar CPNS. Aplikasi ini bertujuan untuk mengotomatisasi
echo   pembuatan dokumen Berita Acara dalam proses pengadaan jasa konstruksi,
echo   sehingga meningkatkan efisiensi dan akurasi dalam penyusunan dokumen.
echo.
echo Fitur Utama:
echo   - Generate dokumen BA Pokja Konsultan
echo   - Generate dokumen BA Timlak Konsultan
echo   - Generate dokumen Persiapan Pembuktian Kualifikasi
echo   - Auto-fill data dari SPSE
echo   - Sistem Save/Load data
echo   - Auto-clean file lama
echo   - Preview keywords sebelum generate
echo   - Format tanggal otomatis Bahasa Indonesia
echo   - Konversi angka ke terbilang otomatis
echo.
echo Teknologi:
echo   - Python 3.12
echo   - Flask Web Framework
echo   - python-docx ^(Word document processing^)
echo   - BeautifulSoup4 ^(SPSE web scraping^)
echo   - PyInstaller ^(Executable packaging^)
echo.
echo ============================================================================
echo Untuk bantuan dan troubleshooting, baca README.md
echo ============================================================================
) > "dist\BA Generator\CREDITS.txt"
echo      File informasi berhasil dibuat.
echo.

echo ============================================================================
echo BUILD SELESAI!
echo ============================================================================
echo.
echo Lokasi output: dist\BA Generator\
echo.
echo File yang dihasilkan:
echo   - BA Generator.exe           : Aplikasi utama ^(NO CONSOLE^)
echo   - Master Folder\              : Template dokumen
echo   - processed_results\          : Folder hasil generate
echo   - README.md                  : Dokumentasi lengkap
echo   - CARA_PENGGUNAAN.txt        : Panduan penggunaan
echo   - SYSTEM_REQUIREMENTS.txt    : Spesifikasi sistem minimum
echo   - CREDITS.txt                : Informasi pengembang
echo.
pause
