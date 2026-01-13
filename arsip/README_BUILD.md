# BA Generator - Development Build Guide

## ⚠️ PERINGATAN: VERSI DEVELOPMENT/TESTING

**Ini adalah versi BETA untuk testing dan pengembangan.**  
Aplikasi masih dalam tahap pengembangan dan belum final.

---

## 📋 Prerequisites

Sebelum build, pastikan sudah terinstall:

1. **Python 3.8+** (sudah terinstall)
2. **Dependencies Python:**
   ```powershell
   pip install flask python-docx lxml pyinstaller
   ```

3. **Verifikasi instalasi:**
   ```powershell
   python -c "import flask, docx, lxml, PyInstaller; print('✓ All OK')"
   ```

---

## 🚀 Cara Build Executable

### **Metode 1: Otomatis (Recommended)**

1. **Double-click file `build_dev.bat`**
   - Script akan otomatis check dependencies
   - Build executable
   - Create README
   - Butuh waktu 2-5 menit

2. **Hasil build** ada di folder:
   ```
   dist/BA Generator (BETA)/
   ```

### **Metode 2: Manual**

Jika ingin build manual via PowerShell:

```powershell
# 1. Clean previous build
Remove-Item -Recurse -Force build, dist -ErrorAction SilentlyContinue

# 2. Build executable
pyinstaller baapp_dev.spec --clean --noconfirm

# 3. Check hasil
dir "dist\BA Generator (BETA)\"
```

---

## 📦 Struktur Hasil Build

```
dist/
└── BA Generator (BETA)/
    ├── BA Generator (BETA).exe  ← File utama (double-click ini)
    ├── README.txt                ← Panduan untuk user
    ├── _internal/                ← Dependencies (jangan dihapus!)
    ├── Master BA Pokja Konsultan/
    ├── Master BA Timlak Konsultan/
    ├── Master Pembuktian/
    ├── templates/
    └── static/
```

**Total size:** ~80-120 MB (tergantung dependencies)

---

## ✅ Testing Executable

### **Test Lokal:**

1. Buka folder: `dist\BA Generator (BETA)\`
2. Double-click: `BA Generator (BETA).exe`
3. Console window akan muncul dengan logs
4. Browser akan auto-open ke http://127.0.0.1:5000
5. Test semua fitur:
   - ✓ BA Pokja Konsultan
   - ✓ BA Timlak Konsultan
   - ✓ Load/Save/Export/Import
   - ✓ Generate documents
   - ✓ Preview keywords

### **Expected Behavior:**

```
============================================================
BA Generator - DEVELOPMENT BUILD v0.1.0-dev
============================================================
⚠️  PERINGATAN: Ini adalah versi BETA/TESTING
   Aplikasi masih dalam pengembangan
============================================================
Starting Flask server on http://127.0.0.1:5000
Browser akan terbuka otomatis dalam 2 detik...
Tekan CTRL+C untuk stop server
============================================================
```

### **Stop Server:**

- Tekan **CTRL+C** di console window, ATAU
- Tutup console window

---

## 📤 Distribusi untuk Testing

### **Cara Share ke Tester:**

1. **Zip seluruh folder:**
   ```powershell
   # Di folder dist/
   Compress-Archive -Path "BA Generator (BETA)" -DestinationPath "BA-Generator-v0.1.0-dev-beta.zip"
   ```

2. **Upload ke cloud:**
   - Google Drive / OneDrive / Dropbox
   - Share link dengan tester

3. **Instruksi untuk Tester:**
   ```
   1. Download file ZIP
   2. Extract ke folder mana saja
   3. Buka folder hasil extract
   4. Double-click "BA Generator (BETA).exe"
   5. Tunggu browser terbuka otomatis
   6. Mulai testing!
   ```

### **Catatan untuk Tester:**

- ⚠️ Ini versi BETA/TESTING, bukan final
- Console window akan muncul (jangan ditutup!)
- Port yang digunakan: 5000
- Tidak perlu install Python/environment apapun
- Bisa langsung running di Windows

---

## 🐛 Troubleshooting

### **Problem: "Port 5000 already in use"**

**Solusi:**
1. Tutup aplikasi lain yang pakai port 5000
2. Atau restart komputer

### **Problem: Browser tidak auto-open**

**Solusi:**
1. Buka manual: http://127.0.0.1:5000
2. Check console window untuk error messages

### **Problem: "Failed to execute script"**

**Solusi:**
1. Check apakah semua folder (Master BA, templates, static) ada
2. Rebuild dengan `build_dev.bat`
3. Check antivirus (kadang block .exe)

### **Problem: Build gagal**

**Solusi:**
```powershell
# 1. Update PyInstaller
pip install --upgrade pyinstaller

# 2. Clear cache
pyinstaller --clean baapp_dev.spec

# 3. Reinstall dependencies
pip install --force-reinstall flask python-docx lxml
```

---

## 🔧 Development Notes

### **File yang Dibuat:**

| File | Fungsi |
|------|--------|
| `run_app.py` | Launcher script dengan auto-open browser |
| `baapp_dev.spec` | PyInstaller configuration (dev version) |
| `build_dev.bat` | Automated build script untuk Windows |
| `README_BUILD.md` | Dokumentasi ini |

### **Konfigurasi Dev vs Production:**

**Development Build (sekarang):**
- ✓ Console window visible (untuk debugging)
- ✓ Detailed logging
- ✓ Nama: "BA Generator (BETA)"
- ✓ Version: 0.1.0-dev

**Production Build (nanti):**
- No console window
- Minimal logging
- Nama: "BA Generator"
- Version: 1.0.0
- Icon custom
- Digital signature (optional)

### **Cara Switch ke Production:**

Edit `baapp_dev.spec`, ubah:
```python
console=True,  # False untuk production
name='BA Generator (BETA)',  # 'BA Generator' untuk production
```

---

## 📝 Version History

| Version | Date | Notes |
|---------|------|-------|
| 0.1.0-dev | 2025-10-19 | Initial development build |

---

## 🎯 Next Steps

### **Sebelum Release Final:**

- [ ] Extensive testing pada multiple Windows versions
- [ ] Fix semua bugs yang ditemukan
- [ ] Optimize file size
- [ ] Add custom icon
- [ ] Remove console window
- [ ] Update version ke 1.0.0
- [ ] Create installer (optional: Inno Setup)
- [ ] Digital signature (optional)

### **Feature Roadmap:**

- [ ] Auto-update mechanism
- [ ] Error reporting system
- [ ] User analytics (optional)
- [ ] Multi-language support
- [ ] Database backend (SQLite)

---

## 💡 Tips & Best Practices

1. **Always test .exe sebelum distribute**
2. **Test di komputer lain** (bukan dev machine)
3. **Include README.txt** untuk user guidance
4. **Version naming:** Gunakan semantic versioning
5. **Keep development build separate** dari production
6. **Backup** Master folders sebelum distribute

---

## 📞 Support

Jika ada masalah saat build atau testing:

1. Check console output untuk error details
2. Review file `build/BA Generator (BETA)/warn-*.txt`
3. Check PyInstaller logs
4. Google error message specific

---

## ✨ Quick Reference

### **Build Command:**
```powershell
# Via batch file
.\build_dev.bat

# Via PyInstaller
pyinstaller baapp_dev.spec --clean --noconfirm
```

### **Test Command:**
```powershell
# Run executable
.\dist\BA Generator (BETA)\BA Generator (BETA).exe
```

### **Distribute:**
```powershell
# Create ZIP
Compress-Archive -Path "dist\BA Generator (BETA)" -DestinationPath "BA-Generator-BETA.zip"
```

---

**Happy Building! 🚀**

*Remember: This is a DEVELOPMENT/TESTING version. Keep iterating!*
