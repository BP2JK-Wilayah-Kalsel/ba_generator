"""
BA Generator - Application Launcher
====================================
Sistem Generator Berita Acara Terintegrasi

Author: Muhammad Rayhan Kurniawan, S.Kom.
Program: Aktualisasi Latsar 2025
Instansi: Kementerian Pekerjaan Umum
Version: 1.0.0
"""

import sys
import os
import webbrowser
from threading import Timer
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def open_browser():
    """Auto-open browser ke aplikasi setelah server ready"""
    try:
        logger.info("Opening browser...")
        webbrowser.open('http://127.0.0.1:5000')
    except Exception as e:
        logger.error(f"Failed to open browser: {e}")

def main():
    """Main function untuk menjalankan Flask app"""
    try:
        # Import Flask app
        from baapp import app
        
        logger.info("="*70)
        logger.info("  BA GENERATOR v1.0.0 - Sistem Generator Berita Acara Terintegrasi")
        logger.info("="*70)
        logger.info("  Program Aktualisasi Latsar 2025")
        logger.info("  Pengembang: Muhammad Rayhan Kurniawan, S.Kom.")
        logger.info("  Kementerian Pekerjaan Umum")
        logger.info("="*70)
        logger.info("")
        logger.info("🌐 Server running on: http://127.0.0.1:5000")
        logger.info("� Template folder: Master Folder/")
        logger.info("💾 Output folder: processed_results/")
        logger.info("")
        logger.info("🚀 Browser akan terbuka otomatis dalam 2 detik...")
        logger.info("")
        logger.info("="*70)
        logger.info("  💡 CARA MENUTUP APLIKASI:")
        logger.info("     1. Tekan CTRL+C di console ini")
        logger.info("     2. Atau tutup console window ini")
        logger.info("     3. Jangan hanya close browser - server tetap jalan!")
        logger.info("="*70)
        
        # Schedule browser to open after 2 seconds
        Timer(2.0, open_browser).start()
        
        # Run Flask app
        app.run(
            host='127.0.0.1',
            port=5000,
            debug=False,
            use_reloader=False  # Disable reloader for exe
        )
        
    except KeyboardInterrupt:
        logger.info("")
        logger.info("="*70)
        logger.info("  ⚠️  Server dihentikan oleh pengguna (CTRL+C)")
        logger.info("="*70)
        logger.info("  ✅ Aplikasi ditutup dengan aman")
        logger.info("  📝 Semua dokumen yang sudah di-generate tersimpan di:")
        logger.info("     processed_results/")
        logger.info("")
        logger.info("  Terima kasih telah menggunakan BA Generator!")
        logger.info("  Program Aktualisasi Latsar 2025")
        logger.info("="*70)
        input("\nTekan Enter untuk menutup window ini...")
        sys.exit(0)
        
    except ImportError as e:
        logger.error(f"Failed to import Flask app: {e}")
        logger.error("Pastikan file baapp.py ada di folder yang sama")
        input("Press Enter to exit...")
        sys.exit(1)
        
    except OSError as e:
        if "Address already in use" in str(e):
            logger.error("Port 5000 sudah digunakan!")
            logger.error("Tutup aplikasi lain yang menggunakan port 5000")
        else:
            logger.error(f"OS Error: {e}")
        input("Press Enter to exit...")
        sys.exit(1)
        
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        input("Press Enter to exit...")
        sys.exit(1)

if __name__ == '__main__':
    main()
