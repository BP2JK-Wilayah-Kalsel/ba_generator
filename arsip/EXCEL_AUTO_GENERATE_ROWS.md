# 📊 Excel Auto-Generate Rows - Lampiran Pengalaman

## Date: October 19, 2025

---

## 🎯 Feature Overview

Sistem sekarang **otomatis generate baris** di Excel `09.no-3-Lamp Kerja Sejenis.xlsx` sesuai dengan jumlah pengalaman yang diinput di form:

- ✅ **Pengalaman Sejenis**: Generate X baris (contoh: 7 baris)
- ✅ **Pengalaman Beda Jenis**: Generate Y baris (contoh: 6 baris)
- ✅ **NPT (Nilai Pengalaman Tertinggi)**: 1 baris fixed
- ✅ **Auto-fill placeholders** dengan data perusahaan dan variable
- ✅ **Copy cell formatting** dari template row

---

## 📋 Excel Structure Generated

### Based on User Input:
- `pengalaman_sejenis` = 7
- `tahun_sejenis` = 10
- `pengalaman_beda_jenis` = 6
- `tahun_beda_jenis` = 10

### Result Structure:

```
Row 2:  Lampiran Pembuktian Pengalaman
Row 4:  (empty)
Row 5:  Header Row 1 (No, Nama Paket, Tahun Anggaran, Lokasi, Nilai Kontrak, Sharing, KSO/Tidak KSO, Keterangan)
Row 6:  Header Row 2 with "{10 tahun_sejenis} Tahun Terakhir (Sejenis)"
Row 7:  1  [empty cells for data entry]
Row 8:  2  [empty cells for data entry]
Row 9:  3  [empty cells for data entry]
Row 10: 4  [empty cells for data entry]
Row 11: 5  [empty cells for data entry]
Row 12: 6  [empty cells for data entry]
Row 13: 7  [empty cells for data entry]
Row 14: "{10 tahun_beda_jenis} TAHUN TERAKHIR" (centered, bold)
Row 15: 1  [empty cells for data entry]
Row 16: 2  [empty cells for data entry]
Row 17: 3  [empty cells for data entry]
Row 18: 4  [empty cells for data entry]
Row 19: 5  [empty cells for data entry]
Row 20: 6  [empty cells for data entry]
Row 21: "NILAI PENGALAMAN TERTINGGI (NPT)" (centered, bold)
Row 22: 1  [empty cells for data entry]
Row 23: (empty)
Row 24: *Hapus note ini sebelum ditunjukkan ke penyedia
Row 25: NOTE: {note_pengalaman}
```

---

## 🔧 How It Works

### 1. **Form Input** (HTML)

```html
<!-- Pengalaman Sejenis -->
<input type="number" id="pengalaman_sejenis" value="7" min="0">
<input type="number" id="tahun_sejenis" value="10" min="1" max="10">

<!-- Pengalaman Beda Jenis -->
<input type="number" id="pengalaman_beda_jenis" value="6" min="0">
<input type="number" id="tahun_beda_jenis" value="10" min="1" max="10">

<!-- Note Pengalaman (Optional) -->
<textarea id="note_pengalaman" rows="2" 
          placeholder="Contoh: Lead firm sesuai hasil klarifikasi..."></textarea>
```

**Field `note_pengalaman`:**
- Opsional (tidak required)
- Akan muncul di Excel row paling bawah
- Highlighted dengan background kuning
- Untuk reminder/note internal POKJA

---

### 2. **Python Function** (`baapp.py`)

**Function: `fill_excel_pengalaman()`**

```python
def fill_excel_pengalaman(excel_path, company_data, pengalaman_data, form_data):
    """
    Fill Excel template with company data and generate rows
    
    Args:
        excel_path: Path to Excel file (09.no-3-Lamp Kerja Sejenis.xlsx)
        company_data: {
            "no": 1, 
            "name": "PT. XXX", 
            "kso": ["PT. KSO1", "PT. KSO2"],
            "leadfirm": "PT. XXX",
            "anggota2": "PT. KSO1",
            "anggota3": "PT. KSO2"
        }
        pengalaman_data: {
            "sejenis": 7,
            "tahun_sejenis": 10,
            "beda_jenis": 6,
            "tahun_beda_jenis": 10
        }
        form_data: {all form fields including note_pengalaman}
    """
```

**Process Steps:**

1. **Load Excel** using `openpyxl.load_workbook()`
2. **Calculate row positions** based on counts:
   - `sejenis_start_row = 7`
   - `beda_jenis_marker_row = 7 + sejenis_count` (e.g., row 14)
   - `beda_jenis_start_row = 15`
   - `npt_marker_row = 15 + beda_jenis_count` (e.g., row 21)
   - `npt_data_row = 22`
   - `note_row = 24`

3. **Replace placeholder in row 6**: `{X_tahun_sejenis}` → `10`

4. **Generate SEJENIS rows** (7 rows):
   ```python
   for i in range(sejenis_count):
       row_num = sejenis_start_row + i  # 7, 8, 9, ..., 13
       ws.cell(row=row_num, column=1).value = i + 1  # 1, 2, 3, ..., 7
       # Copy cell formatting from template row 7
   ```

5. **Add marker row**: `{X_tahun_beda_jenis} TAHUN TERAKHIR` → `10 TAHUN TERAKHIR`

6. **Generate BEDA JENIS rows** (6 rows):
   ```python
   for i in range(beda_jenis_count):
       row_num = beda_jenis_start_row + i  # 15, 16, 17, ..., 20
       ws.cell(row=row_num, column=1).value = i + 1  # 1, 2, 3, ..., 6
       # Copy cell formatting
   ```

7. **Add NPT section**:
   - Marker row: "NILAI PENGALAMAN TERTINGGI (NPT)"
   - Data row: Single row with number "1"

8. **Add NOTE section** (Yellow background):
   ```python
   note_cell.value = "*Hapus note ini sebelum ditunjukkan ke penyedia\nNOTE: {note_pengalaman}"
   note_cell.fill = PatternFill(start_color="FFFF00", end_color="FFFF00", fill_type="solid")
   ```

9. **Replace all placeholders** in worksheet:
   - `{note_pengalaman}` → User's note text
   - `{kso}` → "PT. KSO1, PT. KSO2"
   - `{leadfirm}` → "PT. XXX"
   - `{anggota2}` → "PT. KSO1"
   - `{anggota3}` → "PT. KSO2"

10. **Save workbook**: `wb.save(excel_path)`

---

### 3. **Integration** in `generate_pembuktian_folders()`

```python
# After copying Excel file to company folder
if file_name == '09.no-3-Lamp Kerja Sejenis.xlsx':
    # Prepare company data
    kso_text = ', '.join(kso_list) if kso_list else ''
    company_info = {
        'no': company_no,
        'name': company_name,
        'kso': kso_list,
        'kso_text': kso_text,
        'leadfirm': company_name,
        'anggota2': kso_list[0] if len(kso_list) > 0 else '',
        'anggota3': kso_list[1] if len(kso_list) > 1 else ''
    }
    
    # Fill Excel with generated rows
    fill_excel_pengalaman(dst_path, company_info, pengalaman, data)
```

**Variables passed:**
- `dst_path`: Path to copied Excel in company folder
- `company_info`: Company + KSO data
- `pengalaman`: `{"sejenis": 7, "tahun_sejenis": 10, ...}`
- `data`: All form data including `note_pengalaman`

---

## 📊 Cell Formatting

**All generated rows copy formatting from template row 7:**

| Property | Value |
|----------|-------|
| **Font** | From template (Arial, size 11) |
| **Border** | From template (all sides, thin) |
| **Alignment** | From template (center for No, left for others) |
| **Number Format** | From template |
| **Fill Color** | From template (white for data rows) |

**Special formatting:**

- **Marker rows** (TAHUN TERAKHIR, NPT):
  - Font: Bold, size 11
  - Alignment: Center horizontal + vertical
  
- **Note row** (Yellow highlight):
  - Fill: `PatternFill(start_color="FFFF00", end_color="FFFF00")`
  - Font: Regular

---

## 🎨 Placeholders

### Available Placeholders in Excel Template:

| Placeholder | Example Value | Description |
|-------------|--------------|-------------|
| `{X_tahun_sejenis}` | `10` | Tahun pengalaman sejenis |
| `{X_tahun_beda_jenis}` | `10` | Tahun pengalaman beda jenis |
| `{note_pengalaman}` | `Lead firm sesuai hasil klarifikasi...` | Note untuk POKJA |
| `{kso}` | `PT. KSO1, PT. KSO2` | Daftar anggota KSO (comma-separated) |
| `{leadfirm}` | `PT. XXX` | Lead firm (nama perusahaan utama) |
| `{anggota2}` | `PT. KSO1` | Anggota KSO ke-2 |
| `{anggota3}` | `PT. KSO2` | Anggota KSO ke-3 |

**Replacement happens for ALL cells in worksheet** using:

```python
for row in ws.iter_rows():
    for cell in row:
        if cell.value and isinstance(cell.value, str):
            cell.value = cell.value.replace('{placeholder}', value)
```

---

## ✅ Testing Checklist

### Test Case 1: Standard Input
**Input:**
- Pengalaman Sejenis: 7
- Tahun Sejenis: 10
- Pengalaman Beda Jenis: 6
- Tahun Beda Jenis: 10
- Note: "Lead firm sesuai hasil klarifikasi"

**Expected:**
- ✅ 7 baris sejenis (row 7-13)
- ✅ Marker "10 Tahun Terakhir (Sejenis)" di row 6
- ✅ Marker "10 TAHUN TERAKHIR" di row 14
- ✅ 6 baris beda jenis (row 15-20)
- ✅ NPT section di row 21-22
- ✅ Note kuning di row 24-25 dengan text yang sesuai

---

### Test Case 2: Different Counts
**Input:**
- Pengalaman Sejenis: 5
- Tahun Sejenis: 8
- Pengalaman Beda Jenis: 3
- Tahun Beda Jenis: 5
- Note: ""

**Expected:**
- ✅ 5 baris sejenis (row 7-11)
- ✅ Marker "8 Tahun Terakhir (Sejenis)"
- ✅ Marker "5 TAHUN TERAKHIR" di row 12
- ✅ 3 baris beda jenis (row 13-15)
- ✅ NPT section di row 16-17
- ✅ Note kuning di row 19 (empty note text)

---

### Test Case 3: KSO Company
**Input:**
- Company: PT. ABC
- KSO: ["PT. DEF", "PT. GHI"]
- Note: "Anggota 2 dan 3 adalah KSO"

**Expected:**
- ✅ `{leadfirm}` replaced with "PT. ABC"
- ✅ `{anggota2}` replaced with "PT. DEF"
- ✅ `{anggota3}` replaced with "PT. GHI"
- ✅ `{kso}` replaced with "PT. DEF, PT. GHI"
- ✅ Note text appears correctly

---

## 🐛 Error Handling

**Potential Issues:**

1. **Template row not found** (row 7 doesn't exist):
   ```python
   if ws.max_row < template_row_sejenis:
       raise Exception("Template Excel tidak sesuai format")
   ```

2. **Excel file locked** (opened in Excel):
   - Error message: "Permission denied"
   - Solution: Close Excel file before generation

3. **openpyxl not installed**:
   - Error: `ModuleNotFoundError: No module named 'openpyxl'`
   - Solution: `pip install openpyxl`

4. **Invalid pengalaman count** (negative or non-numeric):
   - Handled by HTML validation: `min="0"`, `type="number"`
   - Python fallback: `int(pengalaman_data.get('sejenis', 7))`

---

## 📦 Dependencies

**Python packages required:**

```bash
pip install openpyxl
```

**Imports added to `baapp.py`:**

```python
from openpyxl import load_workbook
from openpyxl.styles import Font, Alignment, Border, Side, PatternFill
from copy import copy
```

---

## 📁 Files Modified

| File | Changes |
|------|---------|
| `baapp.py` | Added `fill_excel_pengalaman()` function |
| `baapp.py` | Updated imports (openpyxl, PatternFill, copy) |
| `baapp.py` | Updated `generate_pembuktian_folders()` to call Excel fill function |
| `templates/persiapan_pembuktian.html` | Added `note_pengalaman` textarea field |

---

## 🚀 Usage Example

### User Workflow:

1. **Fill form** with pengalaman details:
   - Pengalaman Sejenis: `7`
   - Tahun Sejenis: `10`
   - Pengalaman Beda Jenis: `6`
   - Tahun Beda Jenis: `10`
   - Note Pengalaman: `Lead firm sesuai hasil klarifikasi dari LKPP`

2. **Add companies** with KSO (if applicable)

3. **Click "Generate"** button

4. **System processes**:
   - Copy master Excel to each company folder
   - Auto-generate rows based on input
   - Fill placeholders with company data
   - Add note with yellow highlight

5. **Download ZIP** containing all folders

6. **Open Excel** → See generated structure ready for data entry!

---

## 💡 Benefits

✅ **Time Saving**: No manual copy-paste rows  
✅ **Consistency**: Same structure for all companies  
✅ **Flexibility**: Adjustable row counts per paket  
✅ **Professional**: Proper formatting copied from template  
✅ **Context-Aware**: Note reminder for POKJA  
✅ **Error-Free**: No missed rows or wrong counts  

---

## 🔮 Future Enhancements

Possible improvements:

1. ✅ **Done**: Auto-generate rows
2. ⏳ **Pending**: Pre-fill some data from SPSE/LKPP
3. ⏳ **Pending**: Validation rules in Excel (data validation)
4. ⏳ **Pending**: Auto-calculate NPT based on highest nilai kontrak
5. ⏳ **Pending**: Export to PDF directly from system

---

**Updated By:** GitHub Copilot  
**Date:** October 19, 2025  
**Status:** ✅ Complete & Ready for Testing
