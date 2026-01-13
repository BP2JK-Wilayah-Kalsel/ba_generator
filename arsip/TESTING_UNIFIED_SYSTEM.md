# 🧪 Testing Guide - Unified Save/Load System

## 📋 Pre-Test Checklist

- [ ] Browser console open (F12) untuk monitor errors
- [ ] Clear localStorage (optional): `localStorage.clear()`
- [ ] Prepare test data (kode POKJA, anggota, dll)

## 🎯 Test Scenarios

### ✅ Test 1: Save to Browser (LocalStorage)

**Steps:**
1. Buka menu **Persiapan Pembuktian**
2. Isi form dengan data test:
   - Kode POKJA: `TEST-01`
   - Paket: `Pengujian Save Load System`
   - Pilih 5 anggota POKJA
   - Paste data perusahaan (minimal 2 perusahaan)
3. Klik tombol **"💾 Save to Browser"**

**Expected Result:**
```
✓ Data persiapan_pembuktian berhasil disimpan!

File: TEST-01 - Pengujian_Save_Load_Sy
```

**Verify:**
- Alert muncul dengan pesan sukses
- Dropdown "Pilih data tersimpan..." menampilkan entry baru
- Console tidak ada error

---

### ✅ Test 2: Load from Browser (LocalStorage)

**Steps:**
1. Clear semua form fields (refresh page)
2. Klik dropdown **"Pilih data tersimpan..."**
3. Pilih data yang baru disimpan
4. Tunggu form ter-restore

**Expected Result:**
```
✓ Data "TEST-01 - Pengujian_Save_Load_Sy" 
berhasil dimuat untuk menu persiapan_pembuktian!
```

**Verify:**
- Semua field ter-restore dengan benar
- POKJA table menampilkan anggota yang dipilih
- Company cards menampilkan perusahaan
- Master folder path ter-restore (jika ada)

---

### ✅ Test 3: Export to JSON File

**Steps:**
1. Dengan form yang sudah terisi (dari Test 2)
2. Klik tombol **"📤 Export to JSON"**
3. Save file ke folder test

**Expected Result:**
```
✓ Data berhasil di-export!

File: BA_Data_TEST-01_2025-10-19.json

File ini dapat digunakan untuk menyimpan data 
dari 3 menu sekaligus.
```

**Verify:**
- File downloaded dengan nama format: `BA_Data_{kodePokja}_{date}.json`
- Open file dengan text editor
- Check struktur JSON:
  ```json
  {
    "_version": "1.0",
    "_kodePokja": "TEST-01",
    "persiapan_pembuktian": {
      "kode_pokja": "TEST-01",
      "_companies": [...]
    }
  }
  ```

---

### ✅ Test 4: Import from JSON File

**Steps:**
1. Clear form (refresh page)
2. Klik tombol **"📥 Import from JSON"**
3. Pilih file yang di-export di Test 3
4. Tunggu proses import

**Expected Result:**
```
✓ Data "TEST-01 - Pengujian_Save_Load_Sy" 
berhasil diimport untuk menu persiapan_pembuktian!
```

**Verify:**
- Form ter-restore sempurna
- Data tersimpan ke localStorage
- Dropdown menampilkan entry baru

---

### ✅ Test 5: Multi-Menu Scenario (Simulate 3 Menu Usage)

**Objective:** Test apakah data dari menu lain tidak tertimpa

**Steps:**

#### Step 5.1: Save from Pembuktian Menu
1. Isi form Pembuktian dengan data:
   - Kode POKJA: `MULTI-TEST-01`
   - Add 3 companies
2. Save to browser
3. Export to JSON → save as `multi_test.json`

#### Step 5.2: Manually Edit JSON (Simulate BA POKJA Save)
1. Open `multi_test.json` dengan text editor
2. Add BA POKJA data manually:
   ```json
   {
     "_version": "1.0",
     "_kodePokja": "MULTI-TEST-01",
     "persiapan_pembuktian": {
       "kode_pokja": "MULTI-TEST-01",
       "_companies": [...]
     },
     "ba_pokja_konsultan": {
       "kode_pokja": "MULTI-TEST-01",
       "tanggal_ba": "2025-10-20",
       "waktu_ba": "09:00"
     }
   }
   ```
3. Save file

#### Step 5.3: Manually Add TIMLAK Data
1. Edit `multi_test.json` again
2. Add BA TIMLAK data:
   ```json
   {
     "_version": "1.0",
     "_kodePokja": "MULTI-TEST-01",
     "persiapan_pembuktian": { ... },
     "ba_pokja_konsultan": { ... },
     "ba_timlak_konsultan": {
       "kode_pokja": "MULTI-TEST-01",
       "email_timlak": "test@example.com"
     }
   }
   ```
3. Save file

#### Step 5.4: Import Multi-Menu File
1. Clear form (refresh page)
2. Import `multi_test.json`
3. Check alert message

**Expected Result:**
```
✓ Data "MULTI-TEST-01 - ..." berhasil diimport 
untuk menu persiapan_pembuktian!

📦 File ini juga berisi data untuk menu lain 
yang akan tersimpan.
```

**Verify:**
- Pembuktian data ter-restore
- Check localStorage → data POKJA & TIMLAK juga tersimpan
- Open browser DevTools → Application → LocalStorage
- Find key: `ba_generator_unified_MULTI-TEST-01_...`
- Inspect value → pastikan ada 3 menu keys

---

### ✅ Test 6: Backward Compatibility (Old Format)

**Objective:** Test import file format lama

**Steps:**
1. Create old format JSON manually:
   ```json
   {
     "kode_pokja": "OLD-FORMAT-01",
     "paket": "Test Old Format",
     "_companies": [
       {"no": 1, "name": "PT. OLD FORMAT"}
     ]
   }
   ```
2. Save as `old_format_test.json`
3. Import file tersebut

**Expected Result:**
```
✓ Data berhasil diimport!

⚠ File menggunakan format lama. 
Disarankan untuk export ulang agar 
mendukung multi-menu.
```

**Verify:**
- Data ter-restore dengan benar
- Alert menampilkan warning format lama

---

### ✅ Test 7: Error Handling - Import Wrong Menu Data

**Objective:** Test jika import file yang tidak memiliki data untuk menu ini

**Steps:**
1. Create JSON dengan data menu lain saja:
   ```json
   {
     "_version": "1.0",
     "ba_pokja_konsultan": {
       "kode_pokja": "POKJA-99"
     }
   }
   ```
2. Save as `wrong_menu_test.json`
3. Import di menu Pembuktian

**Expected Result:**
```
⚠ File ini tidak berisi data untuk menu 
"Persiapan Pembuktian"!

Pastikan Anda mengimport file yang benar.
```

**Verify:**
- Alert error muncul
- Form tidak berubah
- Console tidak ada error fatal

---

### ✅ Test 8: Dropdown Display with Multiple Saves

**Objective:** Test dropdown sorting dan display

**Steps:**
1. Save data dengan kode POKJA berbeda 3x:
   - `POKJA-01`
   - `POKJA-02`
   - `POKJA-03`
2. Buka dropdown "Pilih data tersimpan..."

**Expected Result:**
- Dropdown menampilkan 3 entries
- Sorted by timestamp (newest first)
- Format display: `POKJA-XX - Nama_Paket - DD MMM YYYY, HH:MM`

**Verify:**
- Entry terbaru di posisi paling atas
- Nama POKJA jelas terlihat
- Tanggal & waktu dalam format Indonesia

---

### ✅ Test 9: LocalStorage Persistence

**Objective:** Test data tetap ada setelah close browser

**Steps:**
1. Save data ke browser
2. Note nama POKJA dan timestamp
3. Close browser completely
4. Open browser lagi
5. Buka aplikasi
6. Check dropdown

**Expected Result:**
- Data masih ada di dropdown
- Bisa di-load kembali tanpa error

---

### ✅ Test 10: Large Data Test

**Objective:** Test dengan data besar

**Steps:**
1. Paste data 50 perusahaan
2. Add KSO ke 20 perusahaan (2-3 KSO each)
3. Isi semua form fields
4. Save to browser
5. Export to JSON
6. Check file size
7. Import kembali

**Expected Result:**
- Save sukses
- Export sukses
- File size < 1MB (reasonable)
- Import restore semua data dengan benar
- Performance tetap responsif

---

## 🐛 Common Issues & Solutions

### Issue: "Data tidak ditemukan!"

**Cause:** LocalStorage key tidak cocok atau data corrupt

**Solution:**
1. Check browser console untuk error details
2. Clear localStorage: `localStorage.clear()`
3. Save ulang data

---

### Issue: Dropdown kosong "(Belum ada data tersimpan)"

**Cause:** Belum ada data tersimpan atau filter tidak match

**Solution:**
1. Save data terlebih dahulu
2. Check console untuk error saat save
3. Verify localStorage di DevTools

---

### Issue: Import file gagal dengan error parse

**Cause:** JSON format tidak valid

**Solution:**
1. Validate JSON dengan tool online (jsonlint.com)
2. Check bracket dan quote yang hilang
3. Export ulang dari aplikasi

---

### Issue: Data menu lain tertimpa

**Cause:** Menggunakan fungsi lama (bukan unified system)

**Solution:**
1. Verify fungsi menggunakan `MENU_KEY`
2. Check apakah merge logic berjalan
3. Console log `unifiedData` untuk debug

---

## 📊 Test Results Template

```
┌─────────────────────────────────────────────────────┐
│           TEST RESULTS - Unified Save/Load           │
├─────────────────────────────────────────────────────┤
│ Test 1: Save to Browser              [ PASS / FAIL ]│
│ Test 2: Load from Browser            [ PASS / FAIL ]│
│ Test 3: Export to JSON               [ PASS / FAIL ]│
│ Test 4: Import from JSON             [ PASS / FAIL ]│
│ Test 5: Multi-Menu Scenario          [ PASS / FAIL ]│
│ Test 6: Backward Compatibility       [ PASS / FAIL ]│
│ Test 7: Error Handling               [ PASS / FAIL ]│
│ Test 8: Dropdown Display             [ PASS / FAIL ]│
│ Test 9: LocalStorage Persistence     [ PASS / FAIL ]│
│ Test 10: Large Data Test             [ PASS / FAIL ]│
├─────────────────────────────────────────────────────┤
│ Overall Status:                      [ PASS / FAIL ]│
│ Notes:                                              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Test Commands (Browser Console)

```javascript
// Check semua saved data
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key.startsWith('ba_generator_unified_')) {
    console.log(key, JSON.parse(localStorage.getItem(key)));
  }
}

// Clear all BA Generator data
for (let i = localStorage.length - 1; i >= 0; i--) {
  const key = localStorage.key(i);
  if (key.startsWith('ba_generator_unified_')) {
    localStorage.removeItem(key);
  }
}

// Check specific data structure
const data = JSON.parse(localStorage.getItem('ba_generator_unified_TEST-01_...'));
console.log('Menu keys:', Object.keys(data).filter(k => !k.startsWith('_')));
console.log('Has Pembuktian:', !!data.persiapan_pembuktian);
console.log('Has POKJA:', !!data.ba_pokja_konsultan);
console.log('Has TIMLAK:', !!data.ba_timlak_konsultan);
```

---

**Test Date:** _____________  
**Tested By:** _____________  
**Browser:** _____________  
**Status:** ✅ All tests passed / ⚠️ Some issues found
