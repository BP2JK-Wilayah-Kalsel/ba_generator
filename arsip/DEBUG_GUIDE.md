============================================================================
DEBUG & DEVELOPMENT GUIDE - BA GENERATOR
============================================================================

CARA MENJALANKAN APLIKASI DALAM MODE DEVELOPMENT
============================================================================

OPTION 1: Menggunakan Batch File (REKOMENDASI) ✅
--------------------------------------------------
Double-click: "run BA App.bat"

HASIL:
- Console window akan MUNCUL dan TERLIHAT
- Logs akan ditampilkan di console
- Browser otomatis terbuka
- Server Flask berjalan di http://127.0.0.1:5000

CARA STOP:
- Tekan CTRL+C di console window
- Atau tutup console window
- Server akan stop dengan aman

KEUNTUNGAN:
✅ Bisa lihat logs real-time
✅ Mudah debug errors
✅ Mudah stop server (CTRL+C)
✅ Console window bisa di-close kapan saja

---

OPTION 2: Menjalankan Python Langsung
--------------------------------------
Di terminal/PowerShell:
```
python run_app.py
```

HASIL:
- Console menampilkan logs
- Browser otomatis terbuka
- Server di http://127.0.0.1:5000

CARA STOP:
- Tekan CTRL+C

---

OPTION 3: Menjalankan baapp.py Langsung
----------------------------------------
Di terminal/PowerShell:
```
python baapp.py
```

HASIL:
- Server berjalan di http://127.0.0.1:5001
- Logs minimal (Flask default)
- Browser TIDAK otomatis terbuka

CARA STOP:
- Tekan CTRL+C

============================================================================
PERBEDAAN DEVELOPMENT vs PRODUCTION BUILD
============================================================================

DEVELOPMENT BUILD (baapp_dev.spec):
------------------------------------
- Executable: "BA Generator (BETA).exe"
- Console Window: VISIBLE ✅
- Logs: Ditampilkan di console
- User bisa: Stop dengan close window
- Tujuan: Testing & debugging
- Build command: .\build_dev.bat

PRODUCTION BUILD (baapp_final.spec):
------------------------------------
- Executable: "BA Generator.exe"
- Console Window: HIDDEN ❌
- Logs: Internal only (tidak terlihat)
- User bisa: Stop via Task Manager (atau tutup browser, aplikasi akan timeout)
- Tujuan: Distribusi ke end-users
- Build command: .\build_final.bat

============================================================================
TROUBLESHOOTING
============================================================================

MASALAH: Console window tidak muncul saat development
------------------------------------------------------
SOLUSI:
1. Pastikan menggunakan "run BA App.bat"
2. Jangan gunakan "start" command dengan "/MIN" atau "/B"
3. Check file batch, harusnya ada "python run_app.py" tanpa "start"

---

MASALAH: Server masih jalan di background setelah tutup browser
----------------------------------------------------------------
SOLUSI:
1. Tekan CTRL+C di console window (jika visible)
2. Atau tutup console window langsung
3. Atau buka Task Manager → End task "python.exe"

Setelah update terbaru:
- Console window AKAN MUNCUL saat development
- Bisa di-close langsung dengan CTRL+C atau close window

---

MASALAH: Port 5000 already in use
----------------------------------
SOLUSI:
1. Stop server lama:
   - CTRL+C di console
   - Task Manager → End "python.exe"
2. Atau ganti port di baapp.py:
   app.run(port=5001)  # Ubah ke port lain

---

MASALAH: Aplikasi tidak bisa di-stop
-------------------------------------
SOLUSI:
1. Cari process di Task Manager:
   - Processes tab
   - Cari "python.exe" atau "BA Generator"
   - Right-click → End task
2. Atau restart komputer (jika semua gagal)

============================================================================
BEST PRACTICES DEVELOPMENT
============================================================================

1. SELALU gunakan "run BA App.bat" untuk development
   → Console visible, mudah debug

2. JANGAN langsung close browser
   → Stop server dulu dengan CTRL+C
   → Baru close browser

3. CHECK Task Manager jika ragu
   → Pastikan tidak ada python.exe orphan process

4. GUNAKAN console logs untuk debug
   → Semua error akan muncul di console
   → Mudah trace masalah

5. RESTART server setelah code changes
   → CTRL+C untuk stop
   → Run ulang "run BA App.bat"

============================================================================
LOGS YANG DITAMPILKAN DI CONSOLE
============================================================================

Saat server start:
------------------
============================================================
BA Generator - DEVELOPMENT BUILD v1.0.0-dev
============================================================
⚠️  Mode: DEVELOPMENT (Console Window Visible)
   Logs akan ditampilkan di console ini
============================================================
🌐 Server: http://127.0.0.1:5000
🔧 Debug Mode: OFF (use_reloader=False)
============================================================
Browser akan terbuka otomatis dalam 2 detik...

💡 CARA STOP SERVER:
   1. Tekan CTRL+C di console ini
   2. Atau tutup console window ini
============================================================

Saat ada request:
-----------------
127.0.0.1 - - [08/Nov/2025 10:30:45] "GET / HTTP/1.1" 200 -
127.0.0.1 - - [08/Nov/2025 10:30:46] "GET /static/style.css HTTP/1.1" 200 -

Saat ada error:
---------------
ERROR - Failed to generate document: Template not found
Traceback (most recent call last):
  ...

Saat stop dengan CTRL+C:
------------------------
============================================================
⚠️  Server stopped by user (CTRL+C)
============================================================
✅ Aplikasi ditutup dengan aman
   Terima kasih telah menggunakan BA Generator!
============================================================

============================================================================
KAPAN MENGGUNAKAN MANA?
============================================================================

Gunakan DEVELOPMENT BUILD ketika:
✅ Testing aplikasi
✅ Debugging errors
✅ Developing fitur baru
✅ Butuh lihat logs
✅ Sering restart server

Gunakan PRODUCTION BUILD ketika:
✅ Distribusi ke end-users
✅ Deployment final
✅ Aplikasi sudah stable
✅ Tidak perlu troubleshooting
✅ Clean UX (no console window)

============================================================================
FILE PENTING
============================================================================

Development:
- run BA App.bat        → Launcher development (console visible)
- run_app.py           → Python launcher dengan logging
- baapp_dev.spec       → PyInstaller config untuk dev build
- build_dev.bat        → Build script untuk dev version

Production:
- baapp_final.spec     → PyInstaller config untuk final build
- build_final.bat      → Build script untuk final version

Core:
- baapp.py             → Main Flask application
- templates/           → HTML templates
- static/              → CSS, JS, CSV files
- Master Folder/       → Template dokumen Word

============================================================================
