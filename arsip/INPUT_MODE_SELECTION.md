# 📝 Dual Mode Input Selection - BA Generator Pembuktian

**Date:** October 19, 2025  
**Version:** 2.0  
**Feature:** Radio Button Mode Selector (SPSE vs Manual)

---

## 🎯 Overview

Sistem sekarang menyediakan **2 mode input** dengan **pilihan radio button yang jelas**:

```
┌─────────────────────────────────────────────┐
│ [●] Copy dari SPSE    [ ] Isi Per Baris    │
└─────────────────────────────────────────────┘
```

User dapat memilih mode yang sesuai dengan workflow mereka!

---

## 🆕 What's New?

### Before (Single Mode)

```
Paste Data Perusahaan (dari SPSE atau format lain)

┌────────────────────────────────────────┐
│ Format didukung: SPSE, Numbered, ...  │
└────────────────────────────────────────┘

[Paste area]
```

**Problem:**
- ❌ User bingung format mana yang harus digunakan
- ❌ Help text terlalu panjang dan membingungkan
- ❌ Parsing harus handle semua format sekaligus
- ❌ Error message generic

### After (Dual Mode)

```
Pilih Mode Input
┌─────────────────────────────────────────────┐
│ [●] Copy dari SPSE    [ ] Isi Per Baris    │
└─────────────────────────────────────────────┘

Mode SPSE:
• Copy paste langsung dari SPSE
• Tanggal dan status diabaikan
• Contoh: 1  PT. ABC  2 Okt 2025  Kualifikasi

[Paste area - SPSE format]
```

**Benefits:**
- ✅ Jelas mode mana yang dipilih
- ✅ Help text contextual sesuai mode
- ✅ Parsing logic terpisah per mode
- ✅ Error message spesifik per mode

---

## 📋 Mode 1: SPSE (Copy dari SPSE)

### UI Display

**Radio Button:**
```html
[●] Copy dari SPSE    [ ] Isi Per Baris
```

**Info Box (Blue):**
```
ℹ️ Mode SPSE:
• Copy paste langsung dari tabel SPSE (dengan TAB, date, status)
• Sistem akan otomatis extract nama perusahaan saja
• Tanggal dan status akan diabaikan

Contoh format SPSE:
1    PT. ABC    2 Oktober 2025    Kualifikasi
```

**Label:**
```
📋 Paste Data dari SPSE
```

**Placeholder:**
```
Paste data dari SPSE di sini...

Contoh:
1	PT. TRIKON MITRA ABADI  	2 Oktober 2025		Kualifikasi
2	PT. BERMUDA KONSULTAN  	30 September 2025		Kualifikasi
3	PT GLOBAL PROFEX SYNERGY  	1 Oktober 2025		Kualifikasi
```

### Input Example

```
1	PT. TRIKON MITRA ABADI  	2 Oktober 2025		Kualifikasi
2	PT. BERMUDA KONSULTAN  	30 September 2025		Kualifikasi
3	PT GLOBAL PROFEX SYNERGY  	1 Oktober 2025		Kualifikasi
```

### Parsing Logic

```javascript
if (inputMode === 'spse') {
    // SPSE Mode: Parse with TAB/spaces detection
    if (line.includes('\t') || /\s{2,}/.test(line)) {
        // Split by TAB or 2+ spaces
        const parts = line.split(/\t+|\s{2,}/)
            .map(p => p.trim())
            .filter(p => p);
        
        if (parts.length >= 2) {
            const potentialNo = parts[0];
            const noMatch = potentialNo.match(/^\d+/);
            if (noMatch) {
                extractedNo = parseInt(noMatch[0]);
                companyName = parts[1];  // ✅ Only company name
                // ✅ parts[2+] ignored (date, status)
            }
        }
    }
}
```

### Output

```javascript
[
  { no: 1, name: 'PT. TRIKON MITRA ABADI', originalLine: '...' },
  { no: 2, name: 'PT. BERMUDA KONSULTAN', originalLine: '...' },
  { no: 3, name: 'PT GLOBAL PROFEX SYNERGY', originalLine: '...' }
]
```

**Result:**
```
┌────┬──────────────────────────────────────┐
│ No │ Nama Perusahaan                      │
├────┼──────────────────────────────────────┤
│ 1  │ PT. TRIKON MITRA ABADI              │
│ 2  │ PT. BERMUDA KONSULTAN               │
│ 3  │ PT GLOBAL PROFEX SYNERGY            │
└────┴──────────────────────────────────────┘
```

---

## 📋 Mode 2: Manual (Isi Per Baris)

### UI Display

**Radio Button:**
```html
[ ] Copy dari SPSE    [●] Isi Per Baris
```

**Info Box (Green):**
```
⌨️ Mode Manual:
• Tulis 1 nama perusahaan per baris
• Nomor urut akan dibuat otomatis
• Tidak perlu menulis nomor urut

Contoh:
PT. TRIKON MITRA ABADI
PT. BERMUDA KONSULTAN
CV. KARYA MANDIRI
```

**Label:**
```
⌨️ Nama Perusahaan (1 Baris = 1 Perusahaan)
```

**Placeholder:**
```
Tulis nama perusahaan per baris...

Contoh:
PT. TRIKON MITRA ABADI
PT. BERMUDA KONSULTAN
CV. KARYA MANDIRI
PT GLOBAL PROFEX SYNERGY
```

### Input Example

```
PT. TRIKON MITRA ABADI
PT. BERMUDA KONSULTAN
CV. KARYA MANDIRI
PT GLOBAL PROFEX SYNERGY
```

### Parsing Logic

```javascript
if (inputMode === 'manual') {
    // Manual Mode: Simple line-by-line
    companyName = line.trim();
    
    // Remove leading number if exists
    // "1. PT. ABC" → "PT. ABC"
    // "2) PT. DEF" → "PT. DEF"
    // "3 PT. GHI" → "PT. GHI"
    companyName = companyName.replace(/^\d+[\.\)\s]+/, '').trim();
    
    extractedNo = currentNo;  // Auto-increment
}
```

### Output

```javascript
[
  { no: 1, name: 'PT. TRIKON MITRA ABADI', originalLine: '...' },
  { no: 2, name: 'PT. BERMUDA KONSULTAN', originalLine: '...' },
  { no: 3, name: 'CV. KARYA MANDIRI', originalLine: '...' },
  { no: 4, name: 'PT GLOBAL PROFEX SYNERGY', originalLine: '...' }
]
```

**Result:**
```
┌────┬──────────────────────────────────────┐
│ No │ Nama Perusahaan                      │
├────┼──────────────────────────────────────┤
│ 1  │ PT. TRIKON MITRA ABADI              │
│ 2  │ PT. BERMUDA KONSULTAN               │
│ 3  │ CV. KARYA MANDIRI                   │
│ 4  │ PT GLOBAL PROFEX SYNERGY            │
└────┴──────────────────────────────────────┘
```

---

## 🔧 Implementation

### 1. HTML - Radio Button Group

**File:** `templates/persiapan_pembuktian.html` (Lines ~695-710)

```html
<div class="mb-4">
    <label class="form-label fw-bold">
        <i class="fas fa-cog me-2"></i>Pilih Mode Input
    </label>
    <div class="btn-group w-100" role="group">
        <input type="radio" class="btn-check" name="inputMode" 
               id="inputModeSPSE" value="spse" checked>
        <label class="btn btn-outline-primary" for="inputModeSPSE">
            <i class="fas fa-copy me-2"></i>Copy dari SPSE
        </label>
        
        <input type="radio" class="btn-check" name="inputMode" 
               id="inputModeManual" value="manual">
        <label class="btn btn-outline-primary" for="inputModeManual">
            <i class="fas fa-keyboard me-2"></i>Isi Per Baris
        </label>
    </div>
</div>
```

### 2. HTML - Info Boxes (Dynamic)

**SPSE Mode Info:**
```html
<div class="alert alert-info mb-3" id="spseModeInfo">
    <i class="fas fa-info-circle me-2"></i>
    <strong>Mode SPSE:</strong>
    <ul class="mb-0 mt-2">
        <li>Copy paste langsung dari tabel SPSE (dengan TAB, date, status)</li>
        <li>Sistem akan <strong>otomatis extract nama perusahaan saja</strong></li>
        <li>Tanggal dan status akan diabaikan</li>
    </ul>
    <div class="mt-2 p-2 bg-white rounded">
        <small class="text-muted">Contoh format SPSE:</small><br>
        <code class="text-primary">1    PT. ABC    2 Oktober 2025    Kualifikasi</code>
    </div>
</div>
```

**Manual Mode Info (initially hidden):**
```html
<div class="alert alert-success mb-3" id="manualModeInfo" style="display: none;">
    <i class="fas fa-keyboard me-2"></i>
    <strong>Mode Manual:</strong>
    <ul class="mb-0 mt-2">
        <li>Tulis <strong>1 nama perusahaan per baris</strong></li>
        <li>Nomor urut akan dibuat otomatis</li>
        <li>Tidak perlu menulis nomor urut</li>
    </ul>
    <div class="mt-2 p-2 bg-white rounded">
        <small class="text-muted">Contoh:</small><br>
        <code class="text-success">PT. TRIKON MITRA ABADI</code><br>
        <code class="text-success">PT. BERMUDA KONSULTAN</code><br>
        <code class="text-success">CV. KARYA MANDIRI</code>
    </div>
</div>
```

### 3. JavaScript - Toggle Function

**File:** `templates/persiapan_pembuktian.html` (Lines ~2075-2100)

```javascript
function toggleInputMode() {
    const mode = document.querySelector('input[name="inputMode"]:checked').value;
    const pasteAreaLabel = document.getElementById('pasteAreaLabel');
    const pasteArea = document.getElementById('pasteArea');
    const spseModeInfo = document.getElementById('spseModeInfo');
    const manualModeInfo = document.getElementById('manualModeInfo');
    
    if (mode === 'spse') {
        // SPSE Mode
        pasteAreaLabel.innerHTML = '<i class="fas fa-paste me-2"></i>Paste Data dari SPSE';
        pasteArea.placeholder = 'Paste data dari SPSE di sini...\n\nContoh:\n1\tPT. TRIKON...';
        spseModeInfo.style.display = 'block';
        manualModeInfo.style.display = 'none';
    } else {
        // Manual Mode
        pasteAreaLabel.innerHTML = '<i class="fas fa-keyboard me-2"></i>Nama Perusahaan (1 Baris = 1 Perusahaan)';
        pasteArea.placeholder = 'Tulis nama perusahaan per baris...\n\nContoh:\nPT. ABC\nPT. DEF';
        spseModeInfo.style.display = 'none';
        manualModeInfo.style.display = 'block';
    }
}

// Event listener
document.querySelectorAll('input[name="inputMode"]').forEach(radio => {
    radio.addEventListener('change', toggleInputMode);
});
```

### 4. JavaScript - Parsing Logic

**File:** `templates/persiapan_pembuktian.html` (Lines ~1650-1750)

```javascript
function parseCompanyData() {
    // Get selected input mode
    const inputMode = document.querySelector('input[name="inputMode"]:checked').value;
    
    for (let line of lines) {
        if (inputMode === 'spse') {
            // ===== MODE SPSE =====
            if (line.includes('\t') || /\s{2,}/.test(line)) {
                const parts = line.split(/\t+|\s{2,}/)
                    .map(p => p.trim())
                    .filter(p => p);
                
                if (parts.length >= 2) {
                    const noMatch = parts[0].match(/^\d+/);
                    if (noMatch) {
                        extractedNo = parseInt(noMatch[0]);
                        companyName = parts[1];  // Only company name
                    }
                }
            }
        } else {
            // ===== MODE MANUAL =====
            companyName = line.trim();
            companyName = companyName.replace(/^\d+[\.\)\s]+/, '').trim();
            extractedNo = currentNo;
        }
    }
}
```

---

## 🧪 Testing Guide

### Test Case 1: SPSE Mode - Standard Format

**Steps:**
1. Page load → SPSE mode selected (default)
2. Paste SPSE data
3. Click "Extract Data Perusahaan"

**Input:**
```
1	PT. TRIKON MITRA ABADI  	2 Oktober 2025		Kualifikasi
2	PT. BERMUDA KONSULTAN  	30 September 2025		Kualifikasi
```

**Expected:**
- ✅ 2 companies extracted
- ✅ No dates in names
- ✅ No status in names
- ✅ Numbering: 1, 2

---

### Test Case 2: Manual Mode - Simple List

**Steps:**
1. Click "Isi Per Baris"
2. Type company names (one per line)
3. Click "Extract Data Perusahaan"

**Input:**
```
PT. TRIKON MITRA ABADI
PT. BERMUDA KONSULTAN
CV. KARYA MANDIRI
```

**Expected:**
- ✅ 3 companies extracted
- ✅ Auto-numbering: 1, 2, 3
- ✅ Clean names

---

### Test Case 3: Manual Mode - Numbered List (Auto-Remove)

**Steps:**
1. Select "Isi Per Baris"
2. Type with manual numbers
3. Click "Extract Data Perusahaan"

**Input:**
```
1. PT. TRIKON MITRA ABADI
2. PT. BERMUDA KONSULTAN
3) CV. KARYA MANDIRI
4 PT GLOBAL PROFEX SYNERGY
```

**Expected:**
- ✅ 4 companies extracted
- ✅ Leading numbers removed
- ✅ Re-numbered: 1, 2, 3, 4
- ✅ Clean names

---

### Test Case 4: UI Toggle

**Steps:**
1. Page load → Verify SPSE mode UI
2. Click "Isi Per Baris" → Verify Manual mode UI
3. Click "Copy dari SPSE" → Verify SPSE mode UI

**SPSE Mode Checklist:**
- ✅ "Copy dari SPSE" button selected
- ✅ Blue info box visible
- ✅ Green info box hidden
- ✅ Label: "Paste Data dari SPSE"
- ✅ Placeholder: SPSE format example

**Manual Mode Checklist:**
- ✅ "Isi Per Baris" button selected
- ✅ Green info box visible
- ✅ Blue info box hidden
- ✅ Label: "Nama Perusahaan (1 Baris = 1 Perusahaan)"
- ✅ Placeholder: Manual format example

---

## 📊 Comparison

| Aspect | SPSE Mode | Manual Mode |
|--------|-----------|-------------|
| **Icon** | 📋 Copy | ⌨️ Keyboard |
| **Info Color** | Blue | Green |
| **Label** | "Paste Data dari SPSE" | "Nama Perusahaan (1 Baris...)" |
| **Detection** | TAB or 2+ spaces | N/A |
| **Number** | Extract from input | Auto-increment |
| **Name** | `parts[1]` only | Entire line |
| **Cleanup** | Filter date/status | Remove leading number |
| **Use Case** | SPSE copy-paste | Manual typing |

---

## ✅ Benefits

### User Experience

1. **Clear Choice**: Radio button makes mode selection obvious
2. **Contextual Help**: Info box changes based on selected mode
3. **No Confusion**: Separate instructions for each mode
4. **Flexible**: Choose workflow that suits them
5. **Error Prevention**: Mode-specific validation

### Code Quality

1. **Separation of Concerns**: Each mode has its own logic
2. **Maintainable**: Easy to debug specific mode
3. **Extensible**: Can add 3rd mode easily
4. **Clean**: Less if-else spaghetti
5. **Testable**: Test each mode independently

---

## 📝 Summary

**Feature:** Dual-mode input selection with radio buttons

**Implementation:**
- HTML: ~60 lines (radio buttons + 2 info boxes)
- JavaScript: ~40 lines (toggle function + parsing)
- Total: ~100 lines

**Impact:**
- ✅ Better UX (clear mode selection)
- ✅ Contextual help (dynamic info)
- ✅ Flexible workflow (SPSE or manual)
- ✅ Clean code (separate logic)
- ✅ Production-ready

**Files Modified:**
- `templates/persiapan_pembuktian.html`

**Documentation:**
- `INPUT_MODE_SELECTION.md` (this file)

---

**Date:** October 19, 2025  
**Status:** ✅ Complete and Production-Ready  
**Version:** 2.0 (Dual Mode with Radio Buttons)
