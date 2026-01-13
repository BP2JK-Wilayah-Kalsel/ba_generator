# 📦 Unified Save/Load System - BA Generator

## 🎯 Konsep Utama

Sistem save/load yang baru dirancang untuk **menyimpan data dari 3 menu dalam 1 file JSON** tanpa saling menimpa:

1. **BA POKJA Konsultan**
2. **BA TIMLAK Konsultan**  
3. **Persiapan Pembuktian**

## 🏗️ Struktur Data

### Format File JSON

```json
{
  "_version": "1.0",
  "_exportedAt": "2025-10-19T10:30:00.000Z",
  "_kodePokja": "POKJA-01",
  "_displayName": "POKJA-01 - Pengadaan Jalan",
  "_note": "File ini dapat menyimpan data dari 3 menu",
  
  "persiapan_pembuktian": {
    "kode_pokja": "POKJA-01",
    "paket": "Pengadaan Jalan Raya",
    "pokja_ketua": "0",
    "_companies": [...],
    "_masterFolder": "C:/path/to/master",
    "_savedAt": "2025-10-19T10:30:00.000Z"
  },
  
  "ba_pokja_konsultan": {
    "kode_pokja": "POKJA-01",
    "paket": "Pengadaan Jalan Raya",
    "pokja_ketua": "0",
    "_savedAt": "2025-10-19T10:35:00.000Z"
  },
  
  "ba_timlak_konsultan": {
    "kode_pokja": "POKJA-01",
    "paket": "Pengadaan Jalan Raya",
    "timlak_ketua": "0",
    "email_timlak": "ketua@example.com",
    "_savedAt": "2025-10-19T10:40:00.000Z"
  }
}
```

## 🔑 Key Components

### 1. Menu Identifier
Setiap menu memiliki key unik:
- `persiapan_pembuktian` - Menu Persiapan Pembuktian
- `ba_pokja_konsultan` - Menu BA POKJA Konsultan
- `ba_timlak_konsultan` - Menu BA TIMLAK Konsultan

### 2. Metadata Fields (awalan `_`)
- `_version` - Versi format file
- `_exportedAt` - Waktu export
- `_kodePokja` - Kode POKJA untuk identifikasi
- `_displayName` - Nama tampilan untuk dropdown
- `_note` - Catatan informasi
- `_lastUpdated` - Waktu update terakhir

### 3. Menu-Specific Data
Setiap menu menyimpan data form lengkap + metadata:
- Semua field form (kode_pokja, paket, dll)
- `_companies` - Array perusahaan (khusus Persiapan Pembuktian)
- `_masterFolder` - Path folder master
- `_savedAt` - Waktu save menu ini
- `_menuType` - Identifier menu

## 🔄 Workflow

### Save to LocalStorage

```
User klik "Save to Browser"
     ↓
Collect data dari form current menu
     ↓
Generate storage key: ba_generator_unified_{kodePokja}_{timestamp}
     ↓
Load existing unified data (jika ada)
     ↓
Update/Add data untuk menu current tanpa menimpa menu lain
     ↓
Save ke localStorage
```

### Load from LocalStorage

```
User pilih file dari dropdown
     ↓
Parse unified data dari localStorage
     ↓
Check apakah ada data untuk menu current
     ↓
Extract data menu current
     ↓
Restore ke form
```

### Export to JSON

```
User klik "Export to JSON"
     ↓
Collect data dari form current menu
     ↓
Create unified structure
     ↓
Download file: BA_Data_{kodePokja}_{date}.json
```

### Import from JSON

```
User pilih file JSON
     ↓
Parse JSON file
     ↓
Check format (unified atau old format)
     ↓
Extract data untuk menu current
     ↓
Restore ke form
     ↓
Save ke localStorage dalam format unified
```

## 💡 Keuntungan Sistem Ini

### ✅ Tidak Saling Menimpa
- Data dari menu POKJA tidak akan menimpa data TIMLAK
- Data dari menu TIMLAK tidak akan menimpa data Pembuktian
- Satu file dapat menyimpan data lengkap dari semua menu

### ✅ Efisien
- Informasi dasar (kode POKJA, anggota) hanya disimpan 1x
- Shared data otomatis tersedia untuk semua menu
- Mengurangi duplikasi data

### ✅ Backward Compatible
- Tetap bisa import file format lama
- Otomatis convert ke format baru saat save
- Peringatan jika format lama terdeteksi

### ✅ User Friendly
- Dropdown menampilkan nama POKJA + tanggal
- Alert informatif saat save/load
- Indikasi jika file berisi multiple menu data

## 🎮 Cara Penggunaan

### Scenario 1: Bekerja di 3 Menu dengan Data Sama

1. **Di Menu Persiapan Pembuktian:**
   - Isi form (kode POKJA, paket, anggota, perusahaan)
   - Klik "💾 Save to Browser"
   - Atau klik "📤 Export to JSON" → simpan file

2. **Di Menu BA POKJA:**
   - Klik "📥 Import from JSON" → pilih file yang sama
   - Data dasar (kode POKJA, anggota) otomatis ter-load
   - Isi data khusus BA POKJA
   - Klik "💾 Save to Browser"
   - Atau "📤 Export to JSON" → save ke file yang sama

3. **Di Menu BA TIMLAK:**
   - Klik "📥 Import from JSON" → pilih file yang sama
   - Data dasar otomatis ter-load
   - Isi data khusus BA TIMLAK (email representative)
   - Klik "💾 Save to Browser"
   - Atau "📤 Export to JSON" → save ke file yang sama

**Hasil:** Satu file JSON berisi data lengkap dari 3 menu!

### Scenario 2: Load Data yang Sudah Tersimpan

1. Buka menu manapun (POKJA/TIMLAK/Pembuktian)
2. Klik dropdown "Pilih data tersimpan..."
3. Pilih data berdasarkan kode POKJA + tanggal
4. Data untuk menu tersebut akan ter-load otomatis

## 🔧 Implementasi di Menu Lain

### Step 1: Copy Konstanta
```javascript
const MENU_KEY = 'ba_pokja_konsultan'; // atau 'ba_timlak_konsultan'
const STORAGE_PREFIX = 'ba_generator_unified_';
```

### Step 2: Copy Semua Fungsi
- `saveToLocal()`
- `loadFromLocal()`
- `updateSavedDefaultsList()`
- `loadSelectedDefault()`
- `setAllFormData()`
- `exportDefaults()`
- `importDefaults()`

### Step 3: Sesuaikan `collectAllKeywords()`
Pastikan fungsi ini mengumpulkan semua data form yang diperlukan

### Step 4: Test!
- Test save/load di menu tersebut
- Test import file dari menu lain
- Verify data tidak tertimpa

## 📝 Technical Notes

### LocalStorage Key Format
```
ba_generator_unified_{kodePokja}_{timestamp}

Contoh:
ba_generator_unified_POKJA-01_1729335000000
```

### File Naming Format
```
BA_Data_{kodePokja}_{date}.json

Contoh:
BA_Data_POKJA-01_2025-10-19.json
```

### Metadata Prefixes
Semua metadata field dimulai dengan `_`:
- `_version`
- `_exportedAt`
- `_kodePokja`
- `_displayName`
- `_lastUpdated`
- `_savedAt`
- `_menuType`
- `_companies`
- `_masterFolder`
- `_note`

Field dengan prefix `_` akan di-skip saat restore ke form input.

## 🐛 Troubleshooting

### Data Tidak Muncul di Dropdown
- **Penyebab:** File tidak dalam format unified
- **Solusi:** Import file lalu export ulang

### Data Menu Lain Tertimpa
- **Penyebab:** Menggunakan fungsi lama
- **Solusi:** Update fungsi save/load ke versi unified

### Error Saat Import File Lama
- **Penyebab:** Format backward compatibility
- **Solusi:** System akan detect otomatis, tapi disarankan export ulang

### Dropdown Kosong
- **Penyebab:** Belum ada data tersimpan untuk menu ini
- **Solusi:** Save data terlebih dahulu atau import file

## 🚀 Next Steps

1. ✅ **Persiapan Pembuktian** - DONE (implemented)
2. ⏳ **BA POKJA Konsultan** - TODO (copy functions, change MENU_KEY)
3. ⏳ **BA TIMLAK Konsultan** - TODO (copy functions, change MENU_KEY)

## 📊 Version History

### v1.0 (2025-10-19)
- ✅ Initial unified system implementation
- ✅ Support for 3 menus in 1 file
- ✅ Backward compatibility with old format
- ✅ Smart dropdown with POKJA code + date
- ✅ Implemented in Persiapan Pembuktian menu

---

**Author:** GitHub Copilot  
**Date:** October 19, 2025  
**Status:** ✅ Production Ready
