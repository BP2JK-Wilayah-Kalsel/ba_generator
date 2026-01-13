@echo off
REM ============================================================
REM BA Generator - Build Script (Development Version)
REM ============================================================
REM PERINGATAN: Script ini membuat versi DEVELOPMENT/TESTING
REM File .exe yang dihasilkan adalah versi BETA
REM Version: 0.1.0-dev
REM ============================================================

echo.
echo ============================================================
echo BA Generator - Development Build Script
echo ============================================================
echo PERINGATAN: Ini akan membuat versi BETA/TESTING
echo Aplikasi masih dalam pengembangan
echo ============================================================
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

echo [1/5] Checking dependencies...
python -c "import flask, docx, lxml" 2>nul
if errorlevel 1 (
    echo [ERROR] Ada dependency yang belum terinstall!
    echo.
    echo Pastikan sudah install:
    echo    pip install flask python-docx lxml
    echo.
    pause
    exit /b 1
)
echo     ✓ All dependencies found

echo.
echo [2/5] Cleaning previous build...
if exist "build" rmdir /s /q "build"
if exist "dist" rmdir /s /q "dist"
echo     ✓ Cleaned

echo.
echo [3/5] Building executable with PyInstaller...
echo     This may take 2-5 minutes...
pyinstaller baapp_dev.spec --clean --noconfirm

if errorlevel 1 (
    echo.
    echo [ERROR] Build failed!
    echo Check error messages above
    pause
    exit /b 1
)

echo.
echo [4/5] Verifying build...
if not exist "dist\BA Generator (BETA)\BA Generator (BETA).exe" (
    echo [ERROR] Executable tidak ditemukan!
    pause
    exit /b 1
)
echo     ✓ Executable created

echo.
echo [5/5] Creating README...
(
echo BA Generator - Development Build v0.1.0-dev
echo ============================================
echo.
echo ⚠️  PERINGATAN: INI ADALAH VERSI BETA/TESTING
echo Aplikasi masih dalam tahap pengembangan.
echo.
echo CARA MENGGUNAKAN:
echo 1. Double-click "BA Generator (BETA).exe"
echo 2. Tunggu beberapa detik
echo 3. Browser akan terbuka otomatis
echo 4. Jika browser tidak terbuka, buka manual: http://127.0.0.1:5000
echo.
echo CARA MENUTUP:
echo - Tutup browser
echo - Tekan CTRL+C di console window
echo - Atau tutup console window
echo.
echo CATATAN:
echo - Console window akan muncul (untuk melihat logs^)
echo - Jangan tutup console window saat aplikasi berjalan
echo - Port yang digunakan: 5000
echo.
echo STRUCTURE FOLDER:
echo - Master BA Pokja Konsultan/  : Template dokumen BA Pokja
echo - Master BA Timlak Konsultan/ : Template dokumen BA Timlak
echo - Master Pembuktian/           : Template dokumen Pembuktian
echo - templates/                   : HTML templates
echo - static/                      : CSS, JS, CSV files
echo.
echo TROUBLESHOOTING:
echo - Jika error "Port already in use": Tutup aplikasi lain di port 5000
echo - Jika browser tidak buka: Buka manual http://127.0.0.1:5000
echo - Jika ada error: Lihat console window untuk detail
echo.
echo Version: 0.1.0-dev (Beta^)
echo Build Date: %date% %time%
) > "dist\BA Generator (BETA)\README.txt"

echo     ✓ README created

echo.
echo ============================================================
echo ✅ BUILD SUKSES!
echo ============================================================
echo.
echo Lokasi file: dist\BA Generator (BETA)\
echo.
echo File yang dihasilkan:
echo   - BA Generator (BETA).exe  : File executable utama
echo   - README.txt                : Panduan penggunaan
echo   - Master BA Pokja Konsultan/
echo   - Master BA Timlak Konsultan/
echo   - Master Pembuktian/
echo   - templates/
echo   - static/
echo   - [dll... dependencies]
echo.
echo LANGKAH SELANJUTNYA:
echo 1. Test: Buka folder "dist\BA Generator (BETA)\"
echo 2. Double-click "BA Generator (BETA).exe"
echo 3. Pastikan aplikasi berjalan dengan baik
echo.
echo UNTUK DISTRIBUSI:
echo - Zip seluruh folder "BA Generator (BETA)"
echo - Share file zip tersebut
echo - User tinggal extract dan jalankan .exe
echo.
echo ⚠️  REMINDER: Ini adalah versi DEVELOPMENT/TESTING
echo    Aplikasi masih dalam tahap pengembangan
echo.
pause
