# 🌩️ Panduan Update Master Data dari OneDrive

## ✅ Fitur yang Sudah Diimplementasikan

### Backend (`baapp.py`)
1. **Endpoint `/api/update_master_data`**
   - Download master data dari OneDrive
   - Extract ZIP file
   - Validasi struktur folder
   - Backup folder existing
   - Update `_internal` folder
   - Cleanup backup lama (keep 3 backup terakhir)

2. **Helper Functions**
   - `convert_onedrive_share_link_to_download()` - Convert share link ke download URL
   - `get_internal_path()` - Detect path `_internal` (EXE atau development)
   - `cleanup_old_backups()` - Hapus backup lama otomatis

3. **Endpoint `/api/list_master_backups`**
   - List semua backup yang tersedia
   - Sorted by timestamp (newest first)

### Frontend (`home.html`)
1. **Button "Update Master Data dari OneDrive"**
   - Tampil di footer home page
   - Icon cloud download

2. **Modal Dialog**
   - Konfirmasi sebelum update
   - Progress indicator saat download
   - Success/error message
   - Detail folder yang diupdate & backup

3. **JavaScript Functions**
   - `updateMasterData()` - Show modal
   - `executeUpdate()` - Execute update via API

## 📋 Cara Pakai (Development)

### 1. Install Dependencies
```bash
pip install requests
```

### 2. Test di Development Mode
```bash
python baapp.py
```

Akses: http://localhost:5000

Klik button **"Update Master Data dari OneDrive"** di footer

### 3. Struktur Folder Development
```
ba_generator - baru/
├── baapp.py
├── _internal/              ← Akan dicreate otomatis
│   ├── Master BA Pokja Konsultan/
│   ├── Master BA Timlak Konsultan/
│   ├── Master Pembuktian/
│   └── Backup_Master_20251025_140530/  ← Auto backup
└── templates/
    └── home.html
```

## 🚀 Cara Pakai (Production EXE)

### 1. Build EXE dengan PyInstaller
```bash
pyinstaller baapp_dev.spec
```

### 2. Struktur Deployment
```
BA_GENERATOR/
├── BA_Generator.exe
└── _internal/
    ├── Master BA Pokja Konsultan/
    │   ├── 09.no-1.docx
    │   └── ...
    ├── Master BA Timlak Konsultan/
    │   ├── DH.docx
    │   └── ...
    ├── Master Pembuktian/
    │   ├── 09.no-1.xlsx
    │   └── ...
    └── (backup folders akan muncul di sini)
```

### 3. User Flow
1. User jalankan `BA_Generator.exe`
2. Klik button **"Update Master Data dari OneDrive"**
3. Konfirmasi update
4. System akan:
   - Download ZIP dari OneDrive
   - Extract file
   - Backup folder lama
   - Overwrite `_internal\Master xxx`
   - Show success message

## ⚙️ Konfigurasi OneDrive URL

### Default URL (di `baapp.py`)
```python
ONEDRIVE_MASTER_DATA_URL = "https://puprtes-my.sharepoint.com/:f:/g/personal/muhammad_rayhan_kurniawan_pu_go_id/En7w3Dje-tlAmFBOZ99_gjsBGr-1gCqmOHWqKFHyczdh7w?e=4olP7O"
```

### Cara Ganti URL (Opsional)
Bisa kirim URL custom via POST request:
```javascript
fetch('/api/update_master_data', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        onedrive_url: "https://your-new-onedrive-url"
    })
});
```

## 📦 Format OneDrive Folder

**PENTING**: File di OneDrive harus dalam struktur folder seperti ini:

```
OneDrive Shared Folder/
├── Master BA Pokja Konsultan/
│   ├── 09.no-1.docx
│   ├── 09.no-2.docx
│   └── ...
├── Master BA Timlak Konsultan/
│   ├── DH.docx
│   ├── 01.docx
│   └── ...
└── Master Pembuktian/
    ├── 09.no-1.xlsx
    └── ...
```

Jika ada folder yang tidak sesuai format, akan di-skip.

## 🔒 Keamanan & Backup

### Auto Backup
- Setiap update, folder lama di-backup ke `Backup_Master_[timestamp]`
- Format timestamp: `YYYYMMDD_HHMMSS`
- Example: `Backup_Master_20251025_140530`

### Cleanup Policy
- Keep only 3 latest backups
- Backup lama otomatis dihapus

### Validasi
- Validasi ZIP file
- Validasi struktur folder
- Validasi file exists before backup
- Error handling untuk network issues

## 🐛 Troubleshooting

### Error: "Gagal mengkonversi link OneDrive"
- Pastikan link OneDrive valid
- Format: `https://xxx.sharepoint.com/:f:/...`
- Harus shared link untuk folder (bukan file)

### Error: "Tidak ditemukan folder master yang valid"
- Check struktur folder di OneDrive
- Nama folder harus EXACT match:
  - `Master BA Pokja Konsultan`
  - `Master BA Timlak Konsultan`
  - `Master Pembuktian`

### Error: "Timeout saat download"
- Internet connection issue
- OneDrive file terlalu besar
- Try again nanti

### Error: "File yang didownload bukan ZIP yang valid"
- OneDrive mungkin return HTML error page
- Check sharing permission
- Pastikan link masih valid

## 🔄 Update Flow Diagram

```
[User Click Button]
        ↓
[Show Confirmation Modal]
        ↓
[User Confirm "Update Sekarang"]
        ↓
[Show Progress Indicator]
        ↓
[POST /api/update_master_data]
        ↓
[Convert Share Link → Download URL]
        ↓
[Download ZIP from OneDrive]
        ↓
[Extract ZIP to temp folder]
        ↓
[Validate Folder Structure]
        ↓
[Backup Existing _internal/Master xxx]
        ↓
[Copy New Files to _internal/Master xxx]
        ↓
[Cleanup Old Backups (keep 3)]
        ↓
[Show Success Message with Details]
        ↓
[User Close Modal]
```

## 📝 Testing Checklist

### Development Testing
- [ ] Install `requests` library
- [ ] Run `python baapp.py`
- [ ] Click "Update Master Data" button
- [ ] Check modal muncul
- [ ] Check download progress
- [ ] Check success message
- [ ] Verify `_internal` folder created
- [ ] Verify master folders updated
- [ ] Verify backup folder created

### Production Testing (EXE)
- [ ] Build EXE: `pyinstaller baapp_dev.spec`
- [ ] Copy `_internal` folder to deployment
- [ ] Run `BA_Generator.exe`
- [ ] Test update master data
- [ ] Verify existing `_internal` folder backed up
- [ ] Verify new files downloaded
- [ ] Test with multiple updates (check cleanup)
- [ ] Test with invalid OneDrive link (error handling)

## 🎯 Next Enhancements (Optional)

1. **Manual Restore from Backup**
   - Button untuk restore dari backup tertentu
   - List backup dengan preview

2. **Custom OneDrive URL**
   - Settings page untuk ganti OneDrive URL
   - Save to config file

3. **Selective Update**
   - Pilih folder mana yang mau diupdate
   - Checkbox: Pokja / Timlak / Pembuktian

4. **Update Notification**
   - Check OneDrive untuk update baru
   - Show notification jika ada update

5. **Offline Mode**
   - Cache last downloaded files
   - Use cache jika no internet

## 📞 Support

Jika ada error atau butuh bantuan:
1. Check console log (F12 di browser)
2. Check terminal output (jika run development mode)
3. Check `Backup_Master_xxx` folder jika perlu restore manual

---

**Created**: October 25, 2025
**Version**: 1.0.0
**Author**: Muhammad Rayhan Kurniawan
