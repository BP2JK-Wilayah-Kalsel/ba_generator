# 📋 KSO Placeholder System & Folder Numbering Format

## Date: October 19, 2025

---

## 🎯 Updates Overview

### **1. KSO Placeholder System**
Clear placeholder untuk lead firm dan anggota KSO

### **2. Folder Numbering Format**
Format nomor folder dengan leading zero: `01-`, `02-`, `03-`

---

## 📝 KSO Placeholder System

### **Placeholder Structure:**

| Placeholder | Description | Example Value |
|-------------|-------------|---------------|
| `{leadfirm}` | Lead firm (perusahaan utama) | `PT. TRIKON MITRA ABADI` |
| `{kso}` | Semua anggota KSO (comma-separated) | `PT. ABC, CV. DEF` |
| `{anggota2}` | Anggota KSO ke-2 | `PT. ABC` |
| `{anggota3}` | Anggota KSO ke-3 | `CV. DEF` |
| `{anggota4}` | Anggota KSO ke-4 (if exists) | `PT. GHI` |
| `{anggota5}` | Anggota KSO ke-5 (if exists) | `CV. JKL` |

### **Numbering Logic:**

```
Lead Firm = {leadfirm} (anggota 1)
KSO Member 1 = {anggota2} (anggota 2)
KSO Member 2 = {anggota3} (anggota 3)
KSO Member 3 = {anggota4} (anggota 4)
...
```

**Example:**
```
Company: PT. TRIKON MITRA ABADI
KSO: [PT. ABC, CV. DEF]

Placeholders:
{leadfirm} → PT. TRIKON MITRA ABADI
{kso} → PT. ABC, CV. DEF
{anggota2} → PT. ABC
{anggota3} → CV. DEF
```

---

## 📊 UI Updates for KSO

### **Company Detail Card - Enhanced:**

```html
<div class="company-card">
    <div class="company-card-header">
        <div class="company-card-title">
            1. PT. TRIKON MITRA ABADI
        </div>
        <span class="badge bg-primary">2 KSO</span>
    </div>

    <div class="mb-3">
        <label>Perusahaan KSO (Opsional)</label>
        
        <!-- NEW: Info text showing lead firm -->
        <small class="text-muted">
            Lead firm: PT. TRIKON MITRA ABADI | 
            Anggota KSO: {anggota2}, {anggota3}, dst.
        </small>
        
        <!-- KSO Input with placeholder label -->
        <div class="input-group">
            <span class="input-group-text">
                <code>{anggota2}</code>
            </span>
            <input type="text" placeholder="Nama perusahaan anggota 2">
            <button class="btn btn-danger"><i class="fas fa-times"></i></button>
        </div>
        
        <div class="input-group">
            <span class="input-group-text">
                <code>{anggota3}</code>
            </span>
            <input type="text" placeholder="Nama perusahaan anggota 3">
            <button class="btn btn-danger"><i class="fas fa-times"></i></button>
        </div>
        
        <button class="btn btn-success">
            <i class="fas fa-plus"></i> Tambah Anggota KSO
        </button>
    </div>
</div>
```

### **Visual Enhancement:**

**Before:**
```
┌────────────────────────────────────┐
│ 1. PT. TRIKON MITRA ABADI    2 KSO│
├────────────────────────────────────┤
│ Perusahaan KSO (Opsional)          │
│ [_______________________] [X]      │  ← No context
│ [_______________________] [X]      │
│ [+ Tambah KSO]                     │
└────────────────────────────────────┘
```

**After:**
```
┌────────────────────────────────────┐
│ 1. PT. TRIKON MITRA ABADI    2 KSO│
├────────────────────────────────────┤
│ Perusahaan KSO (Opsional)          │
│ Lead firm: PT. TRIKON | {anggota2} │  ← Context info
│                                    │
│ {anggota2} [_______________] [X]   │  ← Clear placeholder
│ {anggota3} [_______________] [X]   │  ← Clear placeholder
│ [+ Tambah Anggota KSO]             │
└────────────────────────────────────┘
```

---

## 🔢 Folder Numbering Format

### **Old Format:**
```
1- PT. TRIKON MITRA ABADI
2- PT. BERMUDA KONSULTAN
3- CV. KARYA MANDIRI
...
10- PT. COMPANY TEN
11- PT. COMPANY ELEVEN
```

**Problem:** Sorting alphabetically causes wrong order:
```
1- PT. A
10- PT. J
11- PT. K
2- PT. B
3- PT. C
```

### **New Format (Leading Zero):**
```
01- PT. TRIKON MITRA ABADI
02- PT. BERMUDA KONSULTAN
03- CV. KARYA MANDIRI
...
10- PT. COMPANY TEN
11- PT. COMPANY ELEVEN
```

**Benefit:** Correct alphabetical sorting:
```
01- PT. A
02- PT. B
03- PT. C
...
10- PT. J
11- PT. K
```

---

## 🔧 Code Changes

### **1. JavaScript - addKSOToCompany() Function**

**Before:**
```javascript
const ksoHtml = `
    <div class="kso-item">
        <input placeholder="Nama perusahaan KSO ${ksoIndex + 1}">
        <button onclick="removeKSOFromCompany(...)">×</button>
    </div>
`;
```

**After:**
```javascript
const ksoNumber = ksoIndex + 2; // Start from 2 (lead firm is 1)
const ksoHtml = `
    <div class="kso-item">
        <div class="input-group">
            <span class="input-group-text">
                <code>{anggota${ksoNumber}}</code>
            </span>
            <input placeholder="Nama perusahaan anggota ${ksoNumber}">
            <button onclick="removeKSOFromCompany(...)">×</button>
        </div>
    </div>
`;
```

**Key Changes:**
- Added `<code>{anggota2}</code>` label before input
- Changed placeholder text to include "anggota" number
- Used `input-group` for better layout

---

### **2. JavaScript - updatePreview() Function**

**Before:**
```javascript
// Folder name
preview += `${prefix} 📁 ${company.no}- ${company.name}\n`;
```

**After:**
```javascript
// Format nomor dengan leading zero (01, 02, 03, dst)
const formattedNo = String(company.no).padStart(2, '0');

// Folder name dengan format: 01- PT. Name, 02- CV. Name
preview += `${prefix} 📁 ${formattedNo}- ${company.name}\n`;
```

**Key Changes:**
- Added `padStart(2, '0')` to format number with leading zero
- Updated comment to reflect new format

---

### **3. Python - generate_pembuktian_folders() Function**

**Before:**
```python
# Create company folder: "1- PT. Company Name"
folder_name = f"{company_no}- {company_name}"
```

**After:**
```python
# Format company number with leading zero: 01, 02, 03, etc.
formatted_no = str(company_no).zfill(2)

# Create company folder: "01- PT. Company Name", "02- CV. Company", etc.
folder_name = f"{formatted_no}- {company_name}"
```

**Key Changes:**
- Added `zfill(2)` to pad number with zeros
- Updated comment and examples

---

### **4. HTML - Info Box Update**

**Before:**
```html
<li>Folder akan dibuat per perusahaan dengan format: 
    <code>1- PT. Nama Perusahaan</code>
</li>
```

**After:**
```html
<li>Folder akan dibuat per perusahaan dengan format: 
    <code>01- PT. Nama Perusahaan</code>, 
    <code>02- CV. Nama Lain</code>, dst.
</li>
```

---

### **5. HTML - Preview Section Update**

**Before:**
```html
📁 Output Pembuktian/
├── 📁 1- [Perusahaan 1]
├── 📁 2- [Perusahaan 2]

(Setiap folder perusahaan berisi 3 file master data)
```

**After:**
```html
📁 Output Pembuktian/
├── 📁 01- [Perusahaan 1]
│   ├── 📊 09.no-3-Lamp Kerja Sejenis.xlsx (rows auto-generated)
├── 📁 02- [Perusahaan 2]
│   ├── 📊 09.no-3-Lamp Kerja Sejenis.xlsx (rows auto-generated)

(Format nomor dengan leading zero: 01, 02, 03, dst.)
```

**Key Changes:**
- Updated folder numbers to `01-`, `02-`
- Added note about Excel auto-generation
- Updated info text at bottom

---

## 📊 Placeholder Usage in Excel

### **Template Excel File: `09.no-3-Lamp Kerja Sejenis.xlsx`**

**Placeholders Available:**

```
Row 24-25 (Note Section):
*Hapus note ini sebelum ditunjukkan ke penyedia
NOTE: {note_pengalaman}

Anywhere in worksheet:
{leadfirm} → PT. TRIKON MITRA ABADI
{kso} → PT. ABC, CV. DEF
{anggota2} → PT. ABC
{anggota3} → CV. DEF
```

**Python Code:**
```python
# Replace all placeholders in worksheet
for row in ws.iter_rows():
    for cell in row:
        if cell.value and isinstance(cell.value, str):
            cell.value = (cell.value
                .replace('{note_pengalaman}', note_pengalaman)
                .replace('{kso}', company_data.get('kso_text', ''))
                .replace('{leadfirm}', company_data.get('leadfirm', ''))
                .replace('{anggota2}', company_data.get('anggota2', ''))
                .replace('{anggota3}', company_data.get('anggota3', ''))
            )
```

---

## 🧪 Testing

### **Test Case 1: Single Company (No KSO)**

**Input:**
```
Company: PT. ABC
KSO: []
```

**Expected Folder:**
```
01- PT. ABC/
  ├── 09.no-1-BA Pembuktian.docx
  ├── 09.no-3-Lamp Kerja Sejenis.xlsx
  └── 09.no-4-Daftar Hadir Pembuktian.docx
```

**Expected Placeholders:**
- `{leadfirm}` → `PT. ABC`
- `{kso}` → `` (empty)
- `{anggota2}` → `` (empty)
- `{anggota3}` → `` (empty)

---

### **Test Case 2: Company with 2 KSO Members**

**Input:**
```
Company: PT. TRIKON MITRA ABADI
KSO: [PT. ABC, CV. DEF]
```

**Expected Folder:**
```
01- PT. TRIKON MITRA ABADI/
  ├── 09.no-1-BA Pembuktian.docx (with placeholders filled)
  ├── 09.no-3-Lamp Kerja Sejenis.xlsx (with placeholders filled)
  └── 09.no-4-Daftar Hadir Pembuktian.docx (with placeholders filled)
```

**Expected Placeholders:**
- `{leadfirm}` → `PT. TRIKON MITRA ABADI`
- `{kso}` → `PT. ABC, CV. DEF`
- `{anggota2}` → `PT. ABC`
- `{anggota3}` → `CV. DEF`

---

### **Test Case 3: Multiple Companies (10+)**

**Input:**
```
Company 1: PT. A
Company 2: PT. B
...
Company 10: PT. J
Company 11: PT. K
```

**Expected Folders (Sorted):**
```
01- PT. A/
02- PT. B/
03- PT. C/
...
10- PT. J/
11- PT. K/
```

**Sorting Test:**
- ✅ Opens in correct order in File Explorer
- ✅ No `10-` appearing before `02-`

---

### **Test Case 4: UI Display**

**Expected UI for KSO Input:**

```
┌──────────────────────────────────────────────┐
│ 1. PT. TRIKON MITRA ABADI          2 KSO    │
├──────────────────────────────────────────────┤
│ Perusahaan KSO (Opsional)                    │
│ ℹ️ Lead firm: PT. TRIKON | {anggota2}, ...   │
│                                              │
│ ┌────────────┬─────────────────────┬───┐    │
│ │ {anggota2} │ [input field      ] │ X │    │
│ └────────────┴─────────────────────┴───┘    │
│                                              │
│ ┌────────────┬─────────────────────┬───┐    │
│ │ {anggota3} │ [input field      ] │ X │    │
│ └────────────┴─────────────────────┴───┘    │
│                                              │
│ [+ Tambah Anggota KSO]                       │
└──────────────────────────────────────────────┘
```

---

## 📦 Files Modified

| File | Section | Change |
|------|---------|--------|
| `persiapan_pembuktian.html` | `generateCompanyDetailCards()` | Added info text with lead firm and placeholder labels |
| `persiapan_pembuktian.html` | `addKSOToCompany()` | Added `<code>{anggotaX}</code>` label with input-group |
| `persiapan_pembuktian.html` | `updatePreview()` | Added `padStart(2, '0')` for leading zero |
| `persiapan_pembuktian.html` | Info alert box | Updated folder format examples |
| `persiapan_pembuktian.html` | Preview section | Updated to show `01-`, `02-` format |
| `baapp.py` | `generate_pembuktian_folders()` | Added `zfill(2)` for folder naming |

---

## 💡 Benefits

### **KSO Placeholder System:**
✅ **Clear Labeling** - User tahu placeholder mana untuk anggota ke berapa  
✅ **Visual Clarity** - `{anggota2}` label terlihat jelas di sebelah input  
✅ **Easy Mapping** - Mudah map input ke placeholder di dokumen  
✅ **Self-Documenting** - Tidak perlu dokumentasi terpisah  

### **Leading Zero Format:**
✅ **Correct Sorting** - Folder terurut benar di File Explorer  
✅ **Professional** - Format standar untuk numbering  
✅ **Scalable** - Work untuk sampai 99 perusahaan  
✅ **Consistent** - Semua folder length sama (01-, 02-, dst.)  

---

## 🚀 Usage Example

### **Scenario: Company with KSO**

**Step 1: Input Company**
```
PT. TRIKON MITRA ABADI
```

**Step 2: Add KSO Members**
```
Click "Tambah Anggota KSO"
  {anggota2}: PT. ABC
  {anggota3}: CV. DEF
```

**Step 3: Generate**
```
Creates folder: 01- PT. TRIKON MITRA ABADI/
```

**Step 4: Open Excel**
```
{leadfirm} replaced with: PT. TRIKON MITRA ABADI
{kso} replaced with: PT. ABC, CV. DEF
{anggota2} replaced with: PT. ABC
{anggota3} replaced with: CV. DEF
```

---

**Updated By:** GitHub Copilot  
**Date:** October 19, 2025  
**Status:** ✅ Complete - KSO Placeholders & Leading Zero Format Active
