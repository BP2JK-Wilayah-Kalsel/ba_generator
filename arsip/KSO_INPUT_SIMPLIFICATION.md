# KSO Input Simplification & File Naming Update

## 📋 Overview Perubahan

Tiga perubahan besar telah dilakukan pada sistem **Persiapan Pembuktian**:

1. ✅ **Hapus placeholder `{kso}`** - Digantikan sepenuhnya dengan `{nama_kso}`
2. ✅ **Ubah KSO Input menjadi Textarea** - Lebih simpel, mudah save/load
3. ✅ **Update Format Nama File** - Tambah nomor perusahaan: `09.XX-1-...`

---

## 1. Penghapusan Placeholder `{kso}`

### ❌ BEFORE (Dihapus)
```
{kso} - Semua anggota KSO (comma-separated)
```
**Masalah:**
- Redundan dengan `{nama_kso}`
- Membingungkan user (mana yang harus dipakai?)
- Auto-generated dari anggota2, anggota3 (tidak fleksibel)

### ✅ AFTER (Hanya 1 Placeholder)
```
{nama_kso} - Nama resmi KSO yang diinput manual
```
**Keuntungan:**
- Lebih jelas dan simpel
- User input manual sesuai format yang diinginkan
- Tidak ada redundansi

### Preview Keywords Update
**BEFORE:**
```
🤝 Placeholder KSO
├─ {nama_kso}: Nama resmi KSO
├─ {leadfirm}: Lead firm
├─ {kso}: Semua anggota (comma-separated)  ← DIHAPUS
├─ {anggota2}: Anggota pertama
├─ {anggota3}: Anggota kedua
└─ {anggota4}, {anggota5}: Anggota tambahan
```

**AFTER:**
```
🤝 Placeholder KSO
├─ {nama_kso}: Nama resmi KSO
├─ {leadfirm}: Lead firm
├─ {anggota2}: Anggota pertama
├─ {anggota3}: Anggota kedua
└─ {anggota4}, {anggota5}: Anggota tambahan
```

---

## 2. KSO Input: Button System → Textarea System

### ❌ BEFORE (Button/Input System)

**UI:**
```html
<label>Anggota KSO (Opsional)</label>
<div id="kso_container_0">
    <!-- Dynamic inputs added here -->
</div>
<button onclick="addKSOToCompany(0)">
    + Tambah Anggota KSO
</button>
```

**Generated HTML per anggota:**
```html
<div class="kso-item">
    <span>{anggota2}</span>
    <input placeholder="Nama perusahaan anggota 2">
    <button>×</button>
</div>
```

**Masalah:**
1. ❌ **Nomor tidak reset** - Hapus anggota2, anggota3 → Add lagi jadi anggota4, anggota5
2. ❌ **Kompleks untuk save/load** - Array dengan null values
3. ❌ **Banyak fungsi** - addKSOToCompany(), removeKSOFromCompany(), updateKSOName()
4. ❌ **UI cluttered** - Banyak button dan dynamic elements

**Data Structure (Kompleks):**
```javascript
company = {
    no: 1,
    name: "PT. ABC",
    namaKSO: "KSO PT. ABC - CV. DEF",
    ksoList: ["CV. DEF", null, "PT. GHI", null, "PT. JKL"]
    //        anggota2  (deleted) anggota4  (deleted) anggota6
}
```

### ✅ AFTER (Textarea System)

**UI:**
```html
<label>Anggota KSO (Opsional)</label>
<small>
    Lead firm: PT. ABC = {leadfirm}
    Tulis 1 baris = 1 anggota KSO
    Baris 1 = {anggota2}, Baris 2 = {anggota3}, dst.
</small>
<textarea id="kso_text_0" rows="3"
          placeholder="Contoh:
CV. DEF
PT. GHI
(1 baris = 1 anggota)"></textarea>
<span class="badge">2 anggota KSO</span>
```

**Keuntungan:**
1. ✅ **Nomor auto-correct** - Baris 1 = anggota2, Baris 2 = anggota3 (selalu konsisten)
2. ✅ **Simpel save/load** - Cukup simpan string textarea
3. ✅ **1 fungsi saja** - updateKSOText()
4. ✅ **UI clean** - Tidak ada dynamic elements

**Data Structure (Simpel):**
```javascript
company = {
    no: 1,
    name: "PT. ABC",
    namaKSO: "KSO PT. ABC - CV. DEF",
    ksoText: "CV. DEF\nPT. GHI\nPT. JKL"
}
```

**Parse saat submit:**
```javascript
const ksoLines = company.ksoText.split('\n')
    .map(line => line.trim())
    .filter(line => line !== '');
// Result: ["CV. DEF", "PT. GHI", "PT. JKL"]
// anggota2    anggota3    anggota4
```

---

## 3. Format Nama File dengan Nomor Perusahaan

### ❌ BEFORE (Tanpa Nomor Perusahaan)

**Master Folder:**
```
Master Pembuktian/
├── 09.no-1-BA Pembuktian.docx
├── 09.no-3-Lamp Kerja Sejenis.xlsx
└── 09.no-4-Daftar Hadir Pembuktian.docx
```

**Generated Folders:**
```
01- PT. ABC/
├── 09.no-1-BA Pembuktian.docx       ← SAMA untuk semua
├── 09.no-3-Lamp Kerja Sejenis.xlsx   ← SAMA untuk semua
└── 09.no-4-Daftar Hadir Pembuktian.docx ← SAMA untuk semua

02- CV. DEF/
├── 09.no-1-BA Pembuktian.docx
├── 09.no-3-Lamp Kerja Sejenis.xlsx
└── 09.no-4-Daftar Hadir Pembuktian.docx
```

**Masalah:**
- ❌ File names identical across all folders
- ❌ Sulit identify file dari folder mana
- ❌ Tidak ada unique identifier

### ✅ AFTER (Dengan Nomor Perusahaan)

**Master Folder (Tidak Berubah):**
```
Master Pembuktian/
├── 09.no-1-BA Pembuktian.docx
├── 09.no-3-Lamp Kerja Sejenis.xlsx
└── 09.no-4-Daftar Hadir Pembuktian.docx
```

**Generated Folders:**
```
01- PT. ABC/
├── 09.01-1-BA Pembuktian.docx       ← 09.01 (company #1)
├── 09.01-3-Lamp Kerja Sejenis.xlsx
└── 09.01-4-Daftar Hadir Pembuktian.docx

02- CV. DEF/
├── 09.02-1-BA Pembuktian.docx       ← 09.02 (company #2)
├── 09.02-3-Lamp Kerja Sejenis.xlsx
└── 09.02-4-Daftar Hadir Pembuktian.docx

10- PT. GHI/
├── 09.10-1-BA Pembuktian.docx       ← 09.10 (company #10)
├── 09.10-3-Lamp Kerja Sejenis.xlsx
└── 09.10-4-Daftar Hadir Pembuktian.docx
```

**Format Pattern:**
```
09.XX-Y-[Nama Dokumen].docx/xlsx

Where:
- 09 = Prefix (tetap)
- XX = Nomor perusahaan (01, 02, 03, ..., 10, 11, dst)
- Y  = Nomor dokumen (1, 3, 4)
```

**Keuntungan:**
- ✅ **Unique per company** - Setiap file punya identifier unik
- ✅ **Easy to track** - Langsung tahu file untuk perusahaan ke berapa
- ✅ **Professional** - Standard numbering convention
- ✅ **Scalable** - Support 01-99 companies

---

## 🔧 Technical Implementation

### Frontend Changes

#### 1. Data Structure Update
```javascript
// BEFORE
companiesWithDetails = [{
    no: 1,
    name: "PT. ABC",
    namaKSO: "KSO PT. ABC - CV. DEF",
    ksoList: ["CV. DEF", null, "PT. GHI"]  // ❌ Complex array
}]

// AFTER
companiesWithDetails = [{
    no: 1,
    name: "PT. ABC",
    namaKSO: "KSO PT. ABC - CV. DEF",
    ksoText: "CV. DEF\nPT. GHI"  // ✅ Simple string
}]
```

#### 2. generateCompanyDetailCards() Update
```javascript
// BEFORE
const cardHtml = `
    <div id="kso_container_${index}">
        <!-- Dynamic inputs -->
    </div>
    <button onclick="addKSOToCompany(${index})">+ Tambah</button>
`;

// AFTER
const cardHtml = `
    <textarea id="kso_text_${index}" rows="3"
              oninput="updateKSOText(${index}, this.value)"></textarea>
    <span class="badge" id="kso_count_${index}">0 anggota KSO</span>
`;
```

#### 3. Functions Simplified
**BEFORE (5 functions):**
```javascript
function addKSOToCompany(companyIndex) { /* 20 lines */ }
function removeKSOFromCompany(companyIndex, ksoIndex) { /* 10 lines */ }
function updateKSOName(companyIndex, ksoIndex, value) { /* 3 lines */ }
function updateKSONama(companyIndex, value) { /* 3 lines */ }
function updateKSOBadge(companyIndex) { /* 5 lines */ }
```

**AFTER (2 functions):**
```javascript
function updateKSOText(companyIndex, value) {
    companiesWithDetails[companyIndex].ksoText = value;
    
    // Count lines
    const lines = value.split('\n').filter(line => line.trim() !== '');
    const ksoCount = lines.length;
    
    // Update badge
    document.getElementById(`kso_count_${companyIndex}`).textContent = 
        `${ksoCount} anggota KSO`;
    
    updatePreview();
}

function updateKSONama(companyIndex, value) {
    companiesWithDetails[companyIndex].namaKSO = value;
    updatePreview();
}
```

#### 4. Save/Load Update
**BEFORE (Complex restoration):**
```javascript
if (company.ksoList && company.ksoList.length > 0) {
    company.ksoList.forEach((ksoName, ksoIndex) => {
        if (ksoName) {
            addKSOToCompany(index);  // Dynamic DOM manipulation
            const input = document.querySelector(`...`);
            if (input) input.value = ksoName;
        }
    });
}
```

**AFTER (Simple restoration):**
```javascript
if (company.ksoText) {
    const ksoTextarea = document.getElementById(`kso_text_${index}`);
    if (ksoTextarea) {
        ksoTextarea.value = company.ksoText;
        updateKSOText(index, company.ksoText);  // Refresh badge
    }
}
```

#### 5. Form Submission Update
**BEFORE:**
```javascript
companies: companiesWithDetails.map(company => ({
    no: company.no,
    name: company.name,
    namaKSO: company.namaKSO,
    kso: company.ksoList.filter(kso => kso !== null && kso !== '')
}))
```

**AFTER:**
```javascript
companies: companiesWithDetails.map(company => {
    // Parse textarea into array
    const ksoLines = (company.ksoText || '').split('\n')
        .map(line => line.trim())
        .filter(line => line !== '');
    
    return {
        no: company.no,
        name: company.name,
        namaKSO: company.namaKSO,
        kso: ksoLines  // Clean array
    };
})
```

### Backend Changes

#### 1. File Naming Logic
```python
# BEFORE
for file_name in master_files:
    src_path = os.path.join(master_folder, file_name)
    dst_path = os.path.join(company_folder, file_name)  # ❌ Same name
    shutil.copy2(src_path, dst_path)

# AFTER
for file_name in master_files:
    src_path = os.path.join(master_folder, file_name)
    
    # Generate new name: 09.no- → 09.01-
    formatted_no = str(company_no).zfill(2)
    new_file_name = file_name.replace('09.no-', f'09.{formatted_no}-')
    dst_path = os.path.join(company_folder, new_file_name)
    
    shutil.copy2(src_path, dst_path)
```

**Example:**
```python
company_no = 5
formatted_no = "05"

# File: 09.no-1-BA Pembuktian.docx
new_name = "09.05-1-BA Pembuktian.docx"

# File: 09.no-3-Lamp Kerja Sejenis.xlsx
new_name = "09.05-3-Lamp Kerja Sejenis.xlsx"

# File: 09.no-4-Daftar Hadir Pembuktian.docx
new_name = "09.05-4-Daftar Hadir Pembuktian.docx"
```

#### 2. Placeholder Removal
```python
# BEFORE
cell.value = (cell.value
    .replace('{nama_kso}', company_data.get('nama_kso', ''))
    .replace('{kso}', company_data.get('kso_text', ''))  # ❌ REMOVED
    .replace('{leadfirm}', company_data.get('leadfirm', ''))
    # ...
)

# AFTER
cell.value = (cell.value
    .replace('{nama_kso}', company_data.get('nama_kso', ''))
    .replace('{leadfirm}', company_data.get('leadfirm', ''))
    # ...
)
```

#### 3. Company Info Simplification
```python
# BEFORE
kso_text = ', '.join(kso_list) if kso_list else ''
company_info = {
    'kso': kso_list,
    'kso_text': kso_text,  # ❌ Redundant
    'nama_kso': nama_kso,
    # ...
}

# AFTER
company_info = {
    'nama_kso': nama_kso,  # ✅ Only nama_kso needed
    'leadfirm': company_name,
    'anggota2': kso_list[0] if len(kso_list) > 0 else '',
    # ...
}
```

---

## 📊 Comparison Summary

| Aspect | BEFORE | AFTER | Improvement |
|--------|--------|-------|-------------|
| **Placeholders** | 7 placeholders | 6 placeholders | -1 (redundancy removed) |
| **KSO Input UI** | Dynamic buttons/inputs | Single textarea | Simpler, cleaner |
| **Data Structure** | Array with nulls | Simple string | Easier to manage |
| **Functions** | 5 functions (60+ lines) | 2 functions (20 lines) | -67% code |
| **Save/Load** | Complex loop + DOM | Simple textarea value | Faster, reliable |
| **File Names** | Generic (09.no-X-...) | Unique (09.XX-X-...) | Better tracking |
| **User Experience** | Confusing (reset issues) | Intuitive (line-based) | Much better |

---

## 🧪 Testing Scenarios

### Test 1: KSO Input Textarea
**Steps:**
1. Extract 3 companies
2. For Company 1:
   - Nama KSO: "KSO PT. ABC - CV. DEF"
   - Anggota KSO textarea:
     ```
     CV. DEF
     PT. GHI
     PT. JKL
     ```
3. Save to localStorage
4. Refresh page
5. Load from localStorage

**Expected:**
- ✅ Textarea restored dengan 3 baris
- ✅ Badge shows "3 anggota KSO"
- ✅ Data structure: `ksoText: "CV. DEF\nPT. GHI\nPT. JKL"`

### Test 2: Edit & Delete Lines
**Steps:**
1. Initial textarea:
   ```
   CV. DEF
   PT. GHI
   PT. JKL
   PT. MNO
   ```
   Badge: "4 anggota KSO"

2. Delete lines 2 & 3:
   ```
   CV. DEF
   PT. MNO
   ```

3. Generate

**Expected:**
- ✅ Badge updates to "2 anggota KSO"
- ✅ Backend receives: `kso: ["CV. DEF", "PT. MNO"]`
- ✅ Placeholders: `{anggota2}` = "CV. DEF", `{anggota3}` = "PT. MNO"
- ✅ No `{anggota4}` or `{anggota5}` (auto-skipped)

### Test 3: File Naming Format
**Steps:**
1. Generate with 12 companies
2. Extract ZIP
3. Check file names in folders

**Expected:**
```
01- PT. First/
├── 09.01-1-BA Pembuktian.docx
├── 09.01-3-Lamp Kerja Sejenis.xlsx
└── 09.01-4-Daftar Hadir Pembuktian.docx

05- PT. Fifth/
├── 09.05-1-BA Pembuktian.docx
├── 09.05-3-Lamp Kerja Sejenis.xlsx
└── 09.05-4-Daftar Hadir Pembuktian.docx

12- PT. Twelfth/
├── 09.12-1-BA Pembuktian.docx
├── 09.12-3-Lamp Kerja Sejenis.xlsx
└── 09.12-4-Daftar Hadir Pembuktian.docx
```

### Test 4: Placeholder Replacement
**Steps:**
1. Company with:
   - Nama KSO: "KSO PT. ABC - CV. DEF"
   - Anggota: "CV. DEF\nPT. GHI"
2. Generate
3. Open Excel file

**Expected Replacements:**
- ✅ `{nama_kso}` → "KSO PT. ABC - CV. DEF"
- ✅ `{leadfirm}` → "PT. ABC"
- ✅ `{anggota2}` → "CV. DEF"
- ✅ `{anggota3}` → "PT. GHI"
- ✅ `{anggota4}` → "" (empty)
- ❌ `{kso}` → NOT FOUND (removed)

---

## 📝 Migration Guide (For Existing Data)

Jika sudah ada data tersimpan dengan format lama:

### Option 1: Manual Migration
1. Export data JSON
2. Edit JSON manually:
   ```json
   // BEFORE
   {
       "namaKSO": "KSO PT. ABC",
       "ksoList": ["CV. DEF", null, "PT. GHI"]
   }
   
   // AFTER
   {
       "namaKSO": "KSO PT. ABC",
       "ksoText": "CV. DEF\nPT. GHI"
   }
   ```
3. Import kembali

### Option 2: Auto-Migration Script
```javascript
// Add to loadFromLocal() or importDefaultsFromFile()
if (data._companies) {
    data._companies = data._companies.map(company => {
        // Migrate old ksoList to new ksoText
        if (company.ksoList && !company.ksoText) {
            const validKSO = company.ksoList.filter(k => k !== null && k !== '');
            company.ksoText = validKSO.join('\n');
            delete company.ksoList;  // Remove old field
        }
        return company;
    });
}
```

---

## 🎯 Benefits Summary

### 1. Simpler Code
- **-67% code reduction** for KSO management
- **5 functions → 2 functions**
- Easier maintenance

### 2. Better UX
- **Intuitive textarea** instead of confusing buttons
- **Auto-numbering** always correct (baris 1 = anggota2, dst)
- **Easy copy-paste** multiple companies

### 3. Cleaner Data
- **No null values** in arrays
- **Simple string storage** for save/load
- **Consistent structure**

### 4. Professional Files
- **Unique file names** per company
- **Easy to track** which file belongs to which company
- **Scalable naming** up to 99 companies

### 5. Less Confusion
- **Only 1 KSO placeholder** (`{nama_kso}`)
- **Clear instructions** in UI
- **No redundancy**

---

**Last Updated:** October 19, 2025  
**Version:** 2.0  
**Status:** ✅ Implemented & Tested
