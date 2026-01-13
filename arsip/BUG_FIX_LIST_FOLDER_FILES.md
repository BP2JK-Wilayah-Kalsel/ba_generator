# 🐛 Bug Fix: "Gagal memuat daftar file: Unexpected token '<'"

**Date:** October 19, 2025  
**Issue:** Error saat browse folder untuk validasi master data BA Pokja Konsultan  
**Status:** ✅ Fixed

---

## 🔍 Problem Analysis

### Error Message

```
Gagal memuat daftar file: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

### Root Cause

**Missing Backend Endpoint:**
- Frontend memanggil: `/api/list_folder_files`
- Backend hanya punya: `/api/list_folder_files_timlak` ❌

Ketika endpoint tidak ditemukan, server mengembalikan **HTML error page 404** (bukan JSON), sehingga `response.json()` gagal parsing dan menghasilkan error "Unexpected token '<'".

---

## 🔧 Solution

### 1. Frontend - Better Error Handling

**File:** `templates/ba_pokja_konsultan.html` (Lines ~2340-2370)

**Before:**
```javascript
const response = await fetch('/api/list_folder_files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder_path: folderPath })
});

const data = await response.json();  // ❌ Fails if response is HTML
```

**After:**
```javascript
const response = await fetch('/api/list_folder_files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder_path: folderPath })
});

// ✅ Check if response is OK
if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
}

// ✅ Check content type to ensure it's JSON
const contentType = response.headers.get('content-type');
if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error('Non-JSON response received:', text.substring(0, 200));
    throw new Error('Server mengembalikan response yang tidak valid (bukan JSON). Pastikan endpoint /api/list_folder_files tersedia.');
}

const data = await response.json();  // ✅ Safe to parse
```

**Benefits:**
- ✅ Deteksi response HTML vs JSON
- ✅ Error message yang jelas untuk user
- ✅ Console log untuk debugging
- ✅ Prevents cryptic "Unexpected token '<'" error

---

### 2. Backend - Create Missing Endpoint

**File:** `baapp.py` (Lines ~1418-1480)

**Added Endpoint:**
```python
@app.route('/api/list_folder_files', methods=['POST'])
def list_folder_files():
    """Quick listing of Word files in POKJA KONSULTAN folder"""
    try:
        data = request.get_json()
        folder_path = data.get('folder_path', '')
        
        if not folder_path:
            return jsonify({'success': False, 'message': 'Path folder tidak valid'})
        
        if not os.path.exists(folder_path):
            return jsonify({'success': False, 'message': 'Folder tidak ditemukan'})
        
        if not os.path.isdir(folder_path):
            return jsonify({'success': False, 'message': 'Path bukan folder'})
        
        # List all .docx files
        available_files = []
        try:
            for file in os.listdir(folder_path):
                if file.lower().endswith('.docx') and not file.startswith('~'):
                    # Extract document code from filename
                    # Expected format: "XX. Name.docx" or "XX-Name.docx"
                    import re
                    
                    # Match patterns like "00.", "06.", "10.", "22-LHP", "27-1", "27-2"
                    match = re.match(r'^(\d{2})(?:[-\.]|$)', file)
                    if match:
                        code = match.group(1)
                        
                        # Check if there's additional suffix (e.g., "22-LHP", "27-1")
                        suffix_match = re.match(r'^\d{2}[-\.]([A-Za-z0-9]+)', file)
                        if suffix_match:
                            suffix = suffix_match.group(1).lower()
                            code = f"{code}_{suffix}"  # "22_lhp", "27_1", "27_2"
                        
                        format_id = f"format_{code}"
                        
                        available_files.append({
                            'code': code,
                            'format_id': format_id,
                            'filename': file,
                            'exists': True
                        })
        except Exception as e:
            return jsonify({'success': False, 'message': f'Error membaca folder: {str(e)}'})
        
        return jsonify({
            'success': True,
            'folder_path': folder_path,
            'files': available_files,
            'total_files': len(available_files)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})
```

**Features:**
- ✅ Handles POKJA KONSULTAN document codes (00, 06, 10, 11, etc.)
- ✅ Supports suffixes (22-LHP → 22_lhp, 27-1 → 27_1, 27-2 → 27_2)
- ✅ Filters temporary files (starting with ~)
- ✅ Returns structured JSON response
- ✅ Proper error handling

---

## 📊 Endpoint Comparison

### Before Fix

| Template | Endpoint Called | Backend Endpoint | Status |
|----------|----------------|------------------|--------|
| BA Pokja Konsultan | `/api/list_folder_files` | ❌ Not exists | 404 Error |
| BA Timlak Konsultan | `/api/list_folder_files_timlak` | ✅ Exists | Works |

### After Fix

| Template | Endpoint Called | Backend Endpoint | Status |
|----------|----------------|------------------|--------|
| BA Pokja Konsultan | `/api/list_folder_files` | ✅ **Created** | ✅ Works |
| BA Timlak Konsultan | `/api/list_folder_files_timlak` | ✅ Exists | ✅ Works |

---

## 🧪 Testing Guide

### Test Case 1: Browse Master Folder (Success)

**Steps:**
1. Open BA Pokja Konsultan
2. Scroll to "Master Folder Template"
3. Click "Browse Folder"
4. Enter valid path: `C:\...\Master BA Pokja Konsultan`
5. Click OK

**Expected Result:**
```
✅ Success Toast: "X dokumen ditemukan di folder"
✅ Checkboxes updated based on available files
✅ Green checkmarks for available documents
✅ Red crosses for missing documents
```

**Console Output:**
```javascript
Available document codes (normalized): ['00', '06', '10', '11', '22_lhp', '27_1', '27_2', ...]
```

---

### Test Case 2: Browse Non-Existent Folder

**Steps:**
1. Click "Browse Folder"
2. Enter invalid path: `C:\NonExistentFolder`
3. Click OK

**Expected Result:**
```
❌ Error Toast: "Folder tidak ditemukan"
```

---

### Test Case 3: Browse Non-Folder Path

**Steps:**
1. Click "Browse Folder"
2. Enter file path (not folder): `C:\...\file.docx`
3. Click OK

**Expected Result:**
```
❌ Error Toast: "Path bukan folder"
```

---

### Test Case 4: Network Error / Server Down

**Steps:**
1. Stop Flask server
2. Click "Browse Folder"
3. Enter valid path
4. Click OK

**Expected Result (Before Fix):**
```
❌ Error Toast: "Gagal memuat daftar file: Unexpected token '<'"
```

**Expected Result (After Fix):**
```
❌ Error Toast: "Gagal memuat daftar file: Failed to fetch"
```

---

## 📋 Document Code Patterns

### Standard Codes (2-digit)

```
00. Cover.docx                    → code: "00"
06. BA Pemberian Penjelasan.docx  → code: "06"
10. BA Hasil Evaluasi.docx        → code: "10"
11. BA Penetapan Daftar Pendek.docx → code: "11"
```

### Codes with Suffix

```
22-LHP. Laporan Hasil Pelelangan.docx  → code: "22_lhp"
27-1. Surat Penetapan (Metode 1).docx  → code: "27_1"
27-2. Surat Penetapan (Metode 2).docx  → code: "27_2"
```

**Regex Pattern:**
```javascript
/^(\d{2})(?:[-\.]|$)/     // Match "XX." or "XX-" or "XX" at start
/^\d{2}[-\.]([A-Za-z0-9]+)/ // Match suffix after "XX-" or "XX."
```

---

## ✅ Verification Checklist

### Frontend
- ✅ Check `response.ok` before parsing
- ✅ Check `content-type` header for JSON
- ✅ Log non-JSON responses to console
- ✅ Show clear error message to user
- ✅ Handle network errors gracefully

### Backend
- ✅ Endpoint `/api/list_folder_files` created
- ✅ Handles POKJA KONSULTAN document codes
- ✅ Supports suffix patterns (22-LHP, 27-1, 27-2)
- ✅ Returns valid JSON response
- ✅ Proper error handling for invalid paths

### Integration
- ✅ Frontend calls correct endpoint
- ✅ Backend returns expected JSON structure
- ✅ Checkboxes updated based on response
- ✅ Toast notifications show correct messages

---

## 🎯 Impact

**Before:**
```
User clicks "Browse Folder"
  ↓
Frontend: fetch('/api/list_folder_files')  ❌ Endpoint not found
  ↓
Server: Returns HTML 404 page
  ↓
Frontend: response.json()  ❌ Fails with "Unexpected token '<'"
  ↓
User sees: "Gagal memuat daftar file: Unexpected token '<'"  😕
```

**After:**
```
User clicks "Browse Folder"
  ↓
Frontend: fetch('/api/list_folder_files')  ✅ Endpoint exists
  ↓
Server: Returns JSON { success: true, files: [...] }
  ↓
Frontend: Parse JSON successfully  ✅
  ↓
User sees: "X dokumen ditemukan di folder"  😊
  ↓
Checkboxes updated with green/red indicators  ✅
```

---

## 📝 Summary

**Bug:** Missing backend endpoint caused cryptic error message

**Root Cause:**
- Frontend called `/api/list_folder_files`
- Backend only had `/api/list_folder_files_timlak`
- 404 HTML response → JSON parse error

**Fix:**
1. Created `/api/list_folder_files` endpoint for POKJA KONSULTAN
2. Added better error handling in frontend (check response type)
3. Clear error messages for users

**Files Modified:**
- `templates/ba_pokja_konsultan.html` (~20 lines)
- `baapp.py` (~60 lines)

**Result:**
- ✅ Browse folder works correctly
- ✅ Checkboxes update based on available files
- ✅ Clear error messages for users
- ✅ Better debugging via console logs

---

**Status:** ✅ Fixed and Production-Ready  
**Date:** October 19, 2025
