@echo off
REM ============================================================================
REM BA Generator - Development Mode Runner
REM ============================================================================
REM Console window akan tetap terlihat untuk melihat logs
REM Tekan CTRL+C untuk stop server
REM ============================================================================

echo.
echo ============================================================================
echo BA GENERATOR - Development Mode
echo ============================================================================
echo.
echo Starting Flask server...
echo Browser akan terbuka otomatis dalam 2 detik
echo.
echo Tekan CTRL+C untuk stop server
echo ============================================================================
echo.

REM Jalankan Python langsung di console ini (tidak background)
python baapp.py

REM Jika ada error, pause agar bisa lihat pesannya
if errorlevel 1 (
    echo.
    echo ============================================================================
    echo ERROR: Aplikasi gagal dijalankan!
    echo ============================================================================
    pause
)