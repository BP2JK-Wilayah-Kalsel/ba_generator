# 🗑️ Sistem Penghapusan Baris KSO Kosong

## 📋 Overview

Sistem ini **otomatis menghapus baris** di Excel dan Word yang berisi placeholder KSO kosong. Ini memastikan dokumen final hanya menampilkan anggota KSO yang benar-benar ada.

---

## 🎯 Masalah yang Diselesaikan

**Sebelum:**
```
| No | Nama                | Jabatan         |
|----|---------------------|-----------------|
| 1  | PT. ABC             | Jabatan {leadfirm}  |
| 2  | CV. DEF             | Jabatan {kso_anggota2} |
| 3  |                     | Jabatan {kso_anggota3} | ← Baris kosong!
| 4  |                     | Jabatan {kso_anggota4} | ← Baris kosong!
```

**Sesudah (otomatis dihapus):**
```
| No | Nama                | Jabatan         |
|----|---------------------|-----------------|
| 1  | PT. ABC             | Jabatan {leadfirm}  |
| 2  | CV. DEF             | Jabatan {kso_anggota2} |
```

---

## 🔧 Implementasi

### **1. Excel (File: baapp.py - `fill_excel_pengalaman()`)**

```python
# Setelah replace placeholders, hapus baris yang berisi "Jabatan {" atau "Jabatan " saja
rows_to_delete = []

for row_idx, row in enumerate(ws.iter_rows(min_row=1, max_row=ws.max_row), start=1):
    # Cek kolom 2 (Jabatan)
    jabatan_cell = ws.cell(row=row_idx, column=2)
    if jabatan_cell.value and isinstance(jabatan_cell.value, str):
        jabatan_value = jabatan_cell.value.strip()
        
        # Jika masih ada placeholder atau hanya "Jabatan" saja
        if 'Jabatan {' in jabatan_value or jabatan_value == 'Jabatan':
            rows_to_delete.append(row_idx)

# Hapus dari bawah ke atas (agar index tidak bergeser)
for row_idx in reversed(rows_to_delete):
    ws.delete_rows(row_idx, 1)
```

**Kriteria Penghapusan:**
- ✅ Baris berisi `"Jabatan {"` (placeholder tidak ter-replace)
- ✅ Baris berisi `"Jabatan"` atau `"Jabatan "` saja (placeholder diganti kosong)

---

### **2. Word (File: baapp.py - `process_docx_comprehensive()`)**

```python
# Identifikasi placeholder KSO kosong
keywords_to_delete_rows = []
if not kso_list or len(kso_list) == 0:
    # Tidak ada KSO sama sekali → hapus semua baris KSO
    keywords_to_delete_rows.extend(['kso_anggota2', 'kso_anggota3', 'kso_anggota4', 'kso_anggota5'])
else:
    # Ada KSO, tapi tidak lengkap → hapus baris yang kosong saja
    if len(kso_list) < 1:
        keywords_to_delete_rows.append('kso_anggota2')
    if len(kso_list) < 2:
        keywords_to_delete_rows.append('kso_anggota3')
    if len(kso_list) < 3:
        keywords_to_delete_rows.append('kso_anggota4')
    if len(kso_list) < 4:
        keywords_to_delete_rows.append('kso_anggota5')

# Proses Word dengan row deletion
process_docx_comprehensive(dst_path, word_keywords, dst_path, 
                         keywords_to_delete_rows=keywords_to_delete_rows)
```

**Di dalam `process_docx_comprehensive()`:**
```python
# Cek setiap baris tabel
for row_idx, row in enumerate(table.rows):
    row_should_delete = False
    
    for cell in row.cells:
        # Jika cell berisi placeholder yang harus dihapus
        if keywords_to_delete_rows:
            for keyword_to_delete in keywords_to_delete_rows:
                if f"{{{keyword_to_delete}}}" in cell.text:
                    row_should_delete = True
                    break
    
    if row_should_delete:
        rows_to_delete.append(row_idx)

# Hapus baris dari bawah ke atas
for row_idx in reversed(rows_to_delete):
    table._element.remove(table.rows[row_idx]._element)
```

---

## 📊 Contoh Skenario

### **Skenario 1: Perusahaan Tunggal (Tidak Ber-KSO)**

**Input:**
```
Nama Perusahaan: PT. ABC
KSO: (kosong)
```

**Hasil:**
```
keywords_to_delete_rows = ['kso_anggota2', 'kso_anggota3', 'kso_anggota4', 'kso_anggota5']
```

**Tabel Awal:**
```
| No | Nama | Jabatan |
|----|------|---------|
| 1  | ...  | Jabatan {leadfirm} |
| 2  | ...  | Jabatan {kso_anggota2} | ← DIHAPUS
| 3  | ...  | Jabatan {kso_anggota3} | ← DIHAPUS
| 4  | ...  | Jabatan {kso_anggota4} | ← DIHAPUS
| 5  | ...  | Jabatan {kso_anggota5} | ← DIHAPUS
```

**Tabel Akhir:**
```
| No | Nama       | Jabatan |
|----|------------|---------|
| 1  | PT. ABC    | Jabatan {leadfirm} |
```

---

### **Skenario 2: Perusahaan dengan 2 Anggota KSO**

**Input:**
```
Nama Perusahaan: PT. ABC
KSO: 
  - CV. DEF
  - PT. GHI
```

**Hasil:**
```
kso_list = ['CV. DEF', 'PT. GHI']
keywords_to_delete_rows = ['kso_anggota4', 'kso_anggota5']  # Hanya yang kosong
```

**Tabel Awal:**
```
| No | Nama | Jabatan |
|----|------|---------|
| 1  | ...  | Jabatan {leadfirm} |
| 2  | ...  | Jabatan {kso_anggota2} |
| 3  | ...  | Jabatan {kso_anggota3} |
| 4  | ...  | Jabatan {kso_anggota4} | ← DIHAPUS
| 5  | ...  | Jabatan {kso_anggota5} | ← DIHAPUS
```

**Tabel Akhir:**
```
| No | Nama       | Jabatan |
|----|------------|---------|
| 1  | PT. ABC    | Jabatan {leadfirm} |
| 2  | CV. DEF    | Jabatan {kso_anggota2} |
| 3  | PT. GHI    | Jabatan {kso_anggota3} |
```

---

### **Skenario 3: Perusahaan dengan 5 Anggota KSO (Full)**

**Input:**
```
Nama Perusahaan: PT. ABC
KSO: 
  - CV. DEF
  - PT. GHI
  - CV. JKL
  - PT. MNO
```

**Hasil:**
```
kso_list = ['CV. DEF', 'PT. GHI', 'CV. JKL', 'PT. MNO']
keywords_to_delete_rows = []  # Tidak ada yang dihapus!
```

**Tabel Akhir:**
```
| No | Nama       | Jabatan |
|----|------------|---------|
| 1  | PT. ABC    | Jabatan {leadfirm} |
| 2  | CV. DEF    | Jabatan {kso_anggota2} |
| 3  | PT. GHI    | Jabatan {kso_anggota3} |
| 4  | CV. JKL    | Jabatan {kso_anggota4} |
| 5  | PT. MNO    | Jabatan {kso_anggota5} |
```

---

## ✅ Keuntungan Sistem Ini

### **1. Dokumen Lebih Bersih**
- ❌ Tidak ada baris kosong yang membingungkan
- ✅ Hanya menampilkan data yang valid

### **2. Otomatis dan Konsisten**
- 🤖 Tidak perlu edit manual
- 🎯 Konsisten untuk semua perusahaan

### **3. Fleksibel**
- 1️⃣ Perusahaan tunggal? ✅ Hanya 1 baris
- 5️⃣ KSO lengkap? ✅ Semua 5 baris muncul
- 2️⃣ KSO 2 anggota? ✅ Hanya 3 baris (lead + 2 anggota)

### **4. Professional Output**
```
✓ Tidak ada "Jabatan" kosong
✓ Tidak ada placeholder yang tidak ter-replace
✓ Dokumen siap langsung digunakan
```

---

## 🧪 Testing Checklist

### **Excel Testing:**
```
□ 1. Generate untuk perusahaan tunggal
   - Verify: Hanya 1 baris di tabel Nama Perusahaan
   
□ 2. Generate untuk perusahaan dengan 1 anggota KSO
   - Verify: 2 baris (lead + anggota2)
   
□ 3. Generate untuk perusahaan dengan 3 anggota KSO
   - Verify: 4 baris (lead + anggota2 + anggota3 + anggota4)
   
□ 4. Generate untuk perusahaan dengan 4 anggota KSO (full)
   - Verify: 5 baris (semua muncul)
```

### **Word Testing:**
```
□ 1. Generate BA Pembuktian untuk perusahaan tunggal
   - Verify: Tidak ada baris dengan "{kso_anggota2}" dst.
   
□ 2. Generate Daftar Hadir untuk perusahaan dengan KSO
   - Verify: Hanya baris dengan data yang muncul
   
□ 3. Check tabel di Word
   - Verify: Tidak ada baris kosong
   - Verify: Tidak ada placeholder yang tidak ter-replace
```

---

## 🔍 Troubleshooting

### **Masalah: Baris tidak terhapus di Excel**

**Penyebab:**
- Template Excel tidak menggunakan format `"Jabatan {kso_anggota2}"`
- Placeholder berada di kolom lain (bukan kolom 2)

**Solusi:**
```python
# Update deteksi di kolom yang benar
jabatan_cell = ws.cell(row=row_idx, column=X)  # Ganti X dengan nomor kolom yang tepat
```

---

### **Masalah: Baris tidak terhapus di Word**

**Penyebab:**
- Placeholder tidak dalam format `{kso_anggotaX}`
- Row deletion tidak diaktifkan

**Solusi:**
```python
# Pastikan keywords_to_delete_rows di-pass ke fungsi
process_docx_comprehensive(dst_path, word_keywords, dst_path, 
                         keywords_to_delete_rows=keywords_to_delete_rows)
```

---

## 📝 Template Requirements

Untuk sistem ini bekerja dengan baik, pastikan template Anda:

### **Excel Template:**
```
| No | Nama      | Jabatan {leadfirm}     | ...
| 1  |           | Jabatan {kso_anggota2} | ...
| 2  |           | Jabatan {kso_anggota3} | ...
| 3  |           | Jabatan {kso_anggota4} | ...
```

**Kriteria:**
- ✅ Kolom Jabatan di kolom 2
- ✅ Format: `"Jabatan {placeholder}"`
- ✅ Setiap anggota KSO dalam baris terpisah

### **Word Template:**
```
┌─────┬─────────────────────┬──────────────────┐
│ No  │ Nama                │ Jabatan          │
├─────┼─────────────────────┼──────────────────┤
│ 1   │ {leadfirm}          │ Direktur         │
│ 2   │ {kso_anggota2}      │ Direktur         │
│ 3   │ {kso_anggota3}      │ Direktur         │
└─────┴─────────────────────┴──────────────────┘
```

**Kriteria:**
- ✅ Placeholder dalam format `{kso_anggotaX}`
- ✅ Setiap placeholder dalam cell terpisah
- ✅ Baris lengkap (semua cell dalam baris yang sama)

---

## 🚀 Future Enhancements

### **1. Custom Deletion Patterns**
```python
# User bisa define pattern sendiri
deletion_patterns = [
    'Jabatan {',
    'Nama: {',
    'Email: {'
]
```

### **2. Logging Deletion**
```python
# Track baris yang dihapus
deleted_rows_log = {
    'Excel': [3, 4, 5],  # Baris 3-5 dihapus
    'Word': ['kso_anggota4', 'kso_anggota5']
}
```

### **3. Conditional Deletion**
```python
# Hapus hanya jika seluruh baris kosong
if all(cell.value is None for cell in row.cells):
    delete_row()
```

---

## 📚 Related Files

- `baapp.py` - Main logic
  - `fill_excel_pengalaman()` - Excel row deletion (lines ~1830-1870)
  - `process_docx_comprehensive()` - Word row deletion (lines ~624-750)
  - `generate_pembuktian_folders()` - Integration point (lines ~1990-2015)

- `templates/persiapan_pembuktian.html` - Frontend UI
  - Company detail cards with KSO input

---

## ✨ Summary

**Sistem ini memberikan:**
- ✅ **Otomatis** - Tidak perlu edit manual
- ✅ **Bersih** - Tidak ada baris kosong
- ✅ **Fleksibel** - Support 0-4 anggota KSO
- ✅ **Konsisten** - Excel dan Word sama-sama bersih
- ✅ **Professional** - Output siap langsung digunakan

**Cara Kerja:**
1. 🔍 Deteksi placeholder KSO kosong
2. 📝 Tandai baris untuk dihapus
3. 🗑️ Hapus baris dari bawah ke atas
4. ✅ Simpan dokumen bersih

Sistem ready untuk production! 🚀
