# BA Generator - Quick Start

## 🎯 Untuk Developer

### Build Executable (Development Version):

1. **Install PyInstaller:**
   ```powershell
   pip install pyinstaller
   ```

2. **Build:**
   ```powershell
   .\build_dev.bat
   ```

3. **Test:**
   ```powershell
   .\dist\BA Generator (BETA)\BA Generator (BETA).exe
   ```

4. **Distribute:**
   ```powershell
   # Zip folder dist/BA Generator (BETA)/
   # Share zip file dengan tester
   ```

Detail lengkap: Lihat `README_BUILD.md`

---

## 👥 Untuk Tester/User

### Cara Jalankan Executable:

1. Extract file ZIP
2. Double-click `BA Generator (BETA).exe`
3. Browser akan auto-open
4. Mulai testing!

**⚠️ PERHATIAN:** Ini versi BETA untuk testing.

---

## 📂 File Structure

```
ba_generator/
├── baapp.py                    # Flask application utama
├── run_app.py                  # Launcher untuk .exe (NEW!)
├── baapp_dev.spec              # PyInstaller config (NEW!)
├── build_dev.bat               # Build script (NEW!)
├── README_BUILD.md             # Build documentation (NEW!)
├── templates/                  # HTML templates
├── static/                     # CSS, JS, CSV
├── Master BA Pokja Konsultan/  # Template docs POKJA
├── Master BA Timlak Konsultan/ # Template docs TIMLAK
└── Master Pembuktian/          # Template docs Pembuktian
```

---

## 🔍 Quick Commands

```powershell
# Run normally (development)
python baapp.py

# Build executable
.\build_dev.bat

# Test executable
cd dist\BA Generator (BETA)
.\BA Generator (BETA).exe

# Clean build
Remove-Item -Recurse -Force build, dist
```

---

**Version:** 0.1.0-dev (Beta)  
**Status:** 🟡 Development/Testing
