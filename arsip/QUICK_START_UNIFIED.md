# ⚡ Quick Start - Unified Save/Load System

## 🎯 Apa yang Berubah?

### ❌ Sistem Lama (Sebelum Update)
- Setiap menu save data terpisah
- File JSON hanya untuk 1 menu
- Data bisa tertimpa jika tidak hati-hati
- LocalStorage key: `pembuktian_timestamp`, `pokja_timestamp`, dll

### ✅ Sistem Baru (Unified)
- **1 file JSON untuk 3 menu**
- Data tidak saling menimpa
- Share informasi dasar (kode POKJA, anggota)
- LocalStorage key: `ba_generator_unified_{kodePokja}_{timestamp}`

---

## 📦 Struktur File JSON Baru

```json
{
  "_kodePokja": "POKJA-01",
  "_displayName": "POKJA-01 - Pengadaan Jalan",
  
  "persiapan_pembuktian": {
    "kode_pokja": "POKJA-01",
    "_companies": [...]
  },
  
  "ba_pokja_konsultan": {
    "kode_pokja": "POKJA-01",
    "tanggal_ba": "2025-10-20"
  },
  
  "ba_timlak_konsultan": {
    "kode_pokja": "POKJA-01",
    "email_timlak": "ketua@example.com"
  }
}
```

**Key Points:**
- 3 menu dalam 1 file
- Tidak saling menimpa
- Shared data (kode POKJA) tidak duplikat

---

## 🚀 Cara Menggunakan

### Scenario 1: Bekerja di 1 Menu Saja

```
1. Isi form → Save to Browser ✅
2. Lain waktu → Load from Browser ✅
3. Export ke JSON jika perlu backup ✅
```

**Sama seperti sebelumnya!** Tidak ada perubahan workflow.

---

### Scenario 2: Bekerja di 3 Menu dengan Data Sama

```
Day 1 - Menu Pembuktian:
├─ Isi form (kode POKJA, anggota, perusahaan)
├─ Export to JSON → simpan "BA_Data_POKJA-01.json"
└─ ✅ File berisi data Pembuktian

Day 2 - Menu BA POKJA:
├─ Import "BA_Data_POKJA-01.json"
├─ Data dasar (POKJA, anggota) otomatis ter-load
├─ Isi data khusus BA POKJA (tanggal, tempat)
├─ Export to JSON → replace "BA_Data_POKJA-01.json"
└─ ✅ File sekarang berisi: Pembuktian + POKJA

Day 3 - Menu BA TIMLAK:
├─ Import "BA_Data_POKJA-01.json"
├─ Data dasar otomatis ter-load
├─ Isi data khusus BA TIMLAK (email representative)
├─ Export to JSON → replace "BA_Data_POKJA-01.json"
└─ ✅ File sekarang berisi: Pembuktian + POKJA + TIMLAK
```

**Result:** 1 file untuk semua keperluan POKJA-01! 🎉

---

## 🔧 Implementasi untuk Menu Lain

Saat ini **hanya menu Persiapan Pembuktian** yang sudah updated.

### Untuk Update Menu BA POKJA & BA TIMLAK:

1. **Copy fungsi-fungsi ini** dari `persiapan_pembuktian.html`:
   - `saveToLocal()`
   - `loadFromLocal()`
   - `updateSavedDefaultsList()`
   - `loadSelectedDefault()`
   - `setAllFormData()`
   - `exportDefaults()`
   - `importDefaults()`

2. **Ubah MENU_KEY**:
   ```javascript
   // BA POKJA:
   const MENU_KEY = 'ba_pokja_konsultan';
   
   // BA TIMLAK:
   const MENU_KEY = 'ba_timlak_konsultan';
   
   // Keep sama:
   const STORAGE_PREFIX = 'ba_generator_unified_';
   ```

3. **Test** save/load/import/export

---

## 📱 UI Changes - Apa yang User Lihat?

### Dropdown "Pilih data tersimpan..."

**Before:**
```
19 Okt 2025, 10:30:00
19 Okt 2025, 09:15:45
18 Okt 2025, 14:22:10
```

**After:**
```
POKJA-01 - Pengadaan_Jalan_Raya - 19 Okt 2025, 10:30
POKJA-02 - Konsultansi_Design - 19 Okt 2025, 09:15
POKJA-01 - Pengadaan_Jalan_Raya - 18 Okt 2025, 14:22
```

**Lebih jelas!** Langsung tahu POKJA mana dan paket apa.

---

### Alert Messages

**Save:**
```
✓ Data persiapan_pembuktian berhasil disimpan!

File: POKJA-01 - Pengadaan_Jalan_Raya
```

**Load:**
```
✓ Data "POKJA-01 - Pengadaan_Jalan_Raya" 
berhasil dimuat untuk menu persiapan_pembuktian!
```

**Export:**
```
✓ Data berhasil di-export!

File: BA_Data_POKJA-01_2025-10-19.json

File ini dapat digunakan untuk menyimpan data 
dari 3 menu sekaligus.
```

**Import (Multi-Menu File):**
```
✓ Data "POKJA-01 - Pengadaan_Jalan_Raya" 
berhasil diimport untuk menu persiapan_pembuktian!

📦 File ini juga berisi data untuk menu lain 
yang akan tersimpan.
```

---

## 🧪 Quick Test

### Test 1: Basic Save/Load (5 menit)

1. Buka menu Persiapan Pembuktian
2. Isi minimal:
   - Kode POKJA: `TEST-01`
   - Paket: `Tes Sistem Unified`
   - Pilih 5 anggota POKJA
3. Klik **"💾 Save to Browser"**
4. Refresh page (F5)
5. Klik dropdown → pilih data yang disimpan
6. ✅ Form ter-restore sempurna

### Test 2: Export/Import (5 menit)

1. Dengan form terisi (dari Test 1)
2. Klik **"📤 Export to JSON"**
3. File downloaded: `BA_Data_TEST-01_2025-10-19.json`
4. Refresh page (F5)
5. Klik **"📥 Import from JSON"**
6. Pilih file yang di-download
7. ✅ Form ter-restore sempurna

---

## 🐛 Troubleshooting

### "Data tidak ditemukan!"
**Solution:** Clear localStorage dan save ulang
```javascript
localStorage.clear();
```

### Dropdown kosong
**Solution:** Save data terlebih dahulu

### Import error
**Solution:** Validate JSON format atau export ulang

---

## 📚 Full Documentation

Untuk detail lengkap, lihat:
- `UNIFIED_SAVE_LOAD_SYSTEM.md` - Konsep & arsitektur
- `UNIFIED_SYSTEM_DIAGRAM.txt` - Visual diagram
- `TESTING_UNIFIED_SYSTEM.md` - Complete test guide
- `example_unified_data.json` - Contoh struktur file

---

## ✅ Checklist Implementation

- [x] **Persiapan Pembuktian** - DONE
- [ ] **BA POKJA Konsultan** - TODO
- [ ] **BA TIMLAK Konsultan** - TODO

---

**Version:** 1.0  
**Date:** October 19, 2025  
**Status:** ✅ Production Ready (Pembuktian menu only)
