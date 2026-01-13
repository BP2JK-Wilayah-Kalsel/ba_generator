# 📝 Sistem Input Manual Perusahaan - Dual Mode (SPSE vs Manual)

## Date: October 19, 2025

---

## 🎯 Feature Overview - UPDATED!

Sistem sekarang menyediakan **2 mode input** untuk daftar perusahaan dengan **pilihan radio button**:

1. **Mode SPSE** (default) - Copy paste langsung dari tabel SPSE
2. **Mode Manual** - Tulis 1 nama perusahaan per baris

User dapat memilih mode yang sesuai dengan workflow mereka melalui tombol pilihan yang jelas!

---

## 🆕 What's New?

### Radio Button Selector

```
┌─────────────────────────────────────────────┐
│ [●] Copy dari SPSE    [ ] Isi Per Baris    │
└─────────────────────────────────────────────┘
```

**Features:**
- ✅ Clear mode selection dengan icon
- ✅ Dynamic info box (changes based on selected mode)
- ✅ Dynamic textarea label and placeholder
- ✅ Separate parsing logic untuk setiap mode

---

## 📋 Mode 1: SPSE (Copy dari SPSE)

**Use Case:** Copy paste langsung dari SPSE

**Info Box (Blue):**
```
ℹ️ Mode SPSE:
• Copy paste langsung dari tabel SPSE (dengan TAB, date, status)
• Sistem akan otomatis extract nama perusahaan saja
• Tanggal dan status akan diabaikan

Contoh: 1    PT. ABC    2 Oktober 2025    Kualifikasi
```

**Input Example:**
```
1	PT. TRIKON MITRA ABADI  	2 Oktober 2025		Kualifikasi
2	PT. BERMUDA KONSULTAN  	30 September 2025		Kualifikasi
3	CV. KARYA MANDIRI		28 September 2025		Kualifikasi
```

**Characteristics:**
- Tab-separated columns (dapat juga multiple spaces)
- Column 1: Nomor urut
- Column 2: Nama perusahaan
- Column 3+: Tanggal, status, dll (diabaikan)

**Detection:** Line contains `\t` OR multiple spaces (`  `)

---

### **Format 2: Numbered List** (NEW!)

**Source:** Manual typing dengan numbering

**Example A - Dot notation:**
```
1. PT. TRIKON MITRA ABADI
2. PT. BERMUDA KONSULTAN
3. CV. KARYA MANDIRI
4. PT. Indonesia JAYA
```

**Example B - Parenthesis notation:**
```
1) PT. TRIKON MITRA ABADI
2) PT. BERMUDA KONSULTAN
3) CV. KARYA MANDIRI
```

**Example C - Space notation:**
```
1 PT. TRIKON MITRA ABADI
2 PT. BERMUDA KONSULTAN
3 CV. KARYA MANDIRI
```

**Characteristics:**
- Starts with number
- Followed by `.` or `)` or space
- Rest of line = company name

**Detection:** Line matches regex `/^\s*\d+[\.\)\s]/`

---

### **Format 3: Simple List** (NEW!)

**Source:** Paling sederhana, langsung nama perusahaan

**Example:**
```
PT. TRIKON MITRA ABADI
PT. BERMUDA KONSULTAN
CV. KARYA MANDIRI
PT. INDONESIA JAYA
```

**Characteristics:**
- No numbering
- 1 line = 1 company name
- Auto-numbered (1, 2, 3, ...)

**Detection:** Any line that doesn't match Format 1 or 2

---

## 🔍 Parsing Logic

### **Parsing Strategy (Sequential):**

```javascript
function parseCompanyData() {
    for (let line of lines) {
        // Skip empty lines
        if (!line.trim()) continue;
        
        // Strategy 1: SPSE Format (tab or multiple spaces)
        if (line.includes('\t') || /\s{2,}/.test(line)) {
            const parts = line.split(/\t+|\s{2,}/);
            companyName = parts[1].trim();
            extractedNo = parseInt(parts[0]);
        }
        // Strategy 2: Numbered List (1. / 1) / 1 )
        else if (/^\s*\d+[\.\)\s]/.test(line)) {
            const match = line.match(/^\s*(\d+)[\.\)\s]+(.+)/);
            extractedNo = parseInt(match[1]);
            companyName = match[2].trim();
        }
        // Strategy 3: Simple List (fallback)
        else {
            companyName = line.trim();
            extractedNo = currentNo; // Auto-increment
        }
        
        // Add to companies array
        companies.push({
            no: extractedNo,
            name: companyName
        });
    }
}
```

---

## 📊 Examples & Results

### **Example 1: SPSE Format**

**Input:**
```
1	PT. TRIKON MITRA ABADI  	2 Oktober 2025		Kualifikasi
2	PT. BERMUDA KONSULTAN  	30 September 2025		Kualifikasi
```

**Parsed:**
```javascript
[
  { no: 1, name: "PT. TRIKON MITRA ABADI" },
  { no: 2, name: "PT. BERMUDA KONSULTAN" }
]
```

---

### **Example 2: Numbered List (Dot)**

**Input:**
```
1. PT. ABC
2. CV. DEF
3. PT. GHI
```

**Parsed:**
```javascript
[
  { no: 1, name: "PT. ABC" },
  { no: 2, name: "CV. DEF" },
  { no: 3, name: "PT. GHI" }
]
```

---

### **Example 3: Simple List**

**Input:**
```
PT. ABC
CV. DEF
PT. GHI
```

**Parsed:**
```javascript
[
  { no: 1, name: "PT. ABC" },
  { no: 2, name: "CV. DEF" },
  { no: 3, name: "PT. GHI" }
]
```

---

### **Example 4: Mixed Format** (Auto-detect)

**Input:**
```
PT. COMPANY A
2. CV. COMPANY B
PT. COMPANY C
4	PT. COMPANY D  	Date	Status
```

**Parsed:**
```javascript
[
  { no: 1, name: "PT. COMPANY A" },      // Simple List
  { no: 2, name: "CV. COMPANY B" },      // Numbered List
  { no: 3, name: "PT. COMPANY C" },      // Simple List (auto-increment)
  { no: 4, name: "PT. COMPANY D" }       // SPSE Format
]
```

---

## 🧹 Data Cleaning

**Automatic cleaning applied:**

1. **Trim whitespace:**
   ```javascript
   companyName = companyName.trim();
   ```

2. **Remove extra spaces:**
   ```javascript
   companyName = companyName.replace(/\s+/g, ' ');
   ```

3. **Skip empty lines:**
   ```javascript
   if (!line.trim()) continue;
   ```

4. **Skip "Tambahan" keyword:**
   ```javascript
   if (line.toLowerCase() === 'tambahan') continue;
   ```

5. **Validate minimum length:**
   ```javascript
   if (companyName.length < 2) continue;
   ```

---

## ✅ Validation Rules

| Rule | Check | Action if Failed |
|------|-------|------------------|
| Empty input | `text.trim()` | Alert: "Paste area kosong!" |
| No companies found | `companies.length === 0` | Alert: "Tidak ada data perusahaan..." |
| Company name too short | `name.length < 2` | Skip line |
| Empty company name | `!companyName` | Skip line |
| "Tambahan" keyword | `toLowerCase() === 'tambahan'` | Skip line |

---

## 🎨 UI Updates

### **Updated Placeholder:**

```html
<textarea placeholder="Format yang didukung:

1️⃣ SPSE Format:
1	PT. TRIKON MITRA ABADI  	2 Oktober 2025		Kualifikasi
2	PT. BERMUDA KONSULTAN  	30 September 2025		Kualifikasi

2️⃣ Simple List (1 baris = 1 perusahaan):
PT. TRIKON MITRA ABADI
PT. BERMUDA KONSULTAN
CV. KARYA MANDIRI

3️⃣ Numbered List:
1. PT. TRIKON MITRA ABADI
2. PT. BERMUDA KONSULTAN
3. CV. KARYA MANDIRI"></textarea>
```

### **Updated Alert Message:**

```
Label: "Paste Data Perusahaan" (bukan "Paste Data dari SPSE")

Info Box: 
"Paste daftar perusahaan dari SPSE ATAU input manual 
(1 baris = 1 perusahaan)"

Error Alert:
"Format yang didukung:
1️⃣ SPSE Format: "1\tPT. ABC\t2 Okt 2025..."
2️⃣ Numbered List: "1. PT. ABC" atau "1) PT. ABC"
3️⃣ Simple List: "PT. ABC" (1 baris = 1 perusahaan)"
```

---

## 🧪 Testing

### **Test Case 1: SPSE Format**

**Input:**
```
1	PT. TRIKON MITRA ABADI  	2 Oktober 2025		Kualifikasi
2	PT. BERMUDA KONSULTAN  	30 September 2025		Kualifikasi
```

**Expected:**
- ✅ 2 companies extracted
- ✅ No: 1, 2
- ✅ Names: "PT. TRIKON MITRA ABADI", "PT. BERMUDA KONSULTAN"

---

### **Test Case 2: Simple List**

**Input:**
```
PT. ABC
CV. DEF
PT. GHI
```

**Expected:**
- ✅ 3 companies extracted
- ✅ Auto-numbered: 1, 2, 3
- ✅ Names preserved correctly

---

### **Test Case 3: Numbered List (Dot)**

**Input:**
```
1. PT. ABC
2. CV. DEF
3. PT. GHI
```

**Expected:**
- ✅ 3 companies extracted
- ✅ Numbers: 1, 2, 3 (from input)
- ✅ Names without numbers

---

### **Test Case 4: Numbered List (Parenthesis)**

**Input:**
```
1) PT. ABC
2) CV. DEF
```

**Expected:**
- ✅ 2 companies extracted
- ✅ Numbers: 1, 2
- ✅ Names without parenthesis

---

### **Test Case 5: Mixed Format**

**Input:**
```
PT. COMPANY A
2. CV. COMPANY B
PT. COMPANY C
```

**Expected:**
- ✅ 3 companies extracted
- ✅ No: 1, 2, 3
- ✅ Different detection strategies work

---

### **Test Case 6: With Empty Lines**

**Input:**
```
PT. ABC

CV. DEF

PT. GHI
```

**Expected:**
- ✅ 3 companies extracted (empty lines skipped)
- ✅ Numbering: 1, 2, 3

---

### **Test Case 7: With "Tambahan" Keyword**

**Input:**
```
PT. ABC
Tambahan
CV. DEF
```

**Expected:**
- ✅ 2 companies extracted ("Tambahan" skipped)
- ✅ Only "PT. ABC" and "CV. DEF"

---

### **Test Case 8: Extra Spaces**

**Input:**
```
PT.   ABC   COMPANY
CV.  DEF    KONSULTAN
```

**Expected:**
- ✅ Extra spaces cleaned: "PT. ABC COMPANY", "CV. DEF KONSULTAN"

---

## 🔧 Code Changes

### **Files Modified:**

| File | Section | Change |
|------|---------|--------|
| `persiapan_pembuktian.html` | Label | "Paste Data dari SPSE" → "Paste Data Perusahaan" |
| `persiapan_pembuktian.html` | Placeholder | Added 3 format examples |
| `persiapan_pembuktian.html` | Info Alert | "dari SPSE ATAU input manual" |
| `persiapan_pembuktian.html` | `parseCompanyData()` | Added 3 parsing strategies |

---

## 💡 Benefits

| Benefit | Description |
|---------|-------------|
| **Flexibility** | User dapat pilih format paling mudah |
| **Time Saving** | Tidak perlu format ulang dari SPSE |
| **User-Friendly** | Support input manual untuk kasus khusus |
| **Backward Compatible** | SPSE format tetap work seperti biasa |
| **Auto-Detection** | Sistem pintar detect format otomatis |

---

## 📝 Usage Examples

### **Scenario 1: Copy from SPSE**
User copy-paste langsung dari tabel SPSE → Works! ✅

### **Scenario 2: Manual Input**
User ketik manual dengan numbering:
```
1. PT. ABC
2. CV. DEF
```
→ Works! ✅

### **Scenario 3: Quick List**
User ketik nama perusahaan aja:
```
PT. ABC
CV. DEF
```
→ Works! Auto-numbered! ✅

### **Scenario 4: Mixed Sources**
User punya sebagian dari SPSE, sebagian manual → Works! Auto-detect! ✅

---

## 🚀 Next Steps

**Current Status:** ✅ Complete & Ready

**Potential Enhancements:**
1. ⏳ Add drag & drop file upload (.txt, .csv)
2. ⏳ Import from Excel file directly
3. ⏳ Bulk edit company names
4. ⏳ Validation for company name format (PT./CV./etc.)

---

**Updated By:** GitHub Copilot  
**Date:** October 19, 2025  
**Status:** ✅ Complete - Multiple Format Support Active
