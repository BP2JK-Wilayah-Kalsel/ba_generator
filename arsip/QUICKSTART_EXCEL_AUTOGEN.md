# 🚀 Quick Start: Excel Auto-Generate Feature

## ✨ Apa yang Baru?

Sistem sekarang **otomatis generate baris** di Excel sesuai jumlah pengalaman yang Anda input!

---

## 📝 Cara Pakai (3 Langkah):

### 1. **Isi Form Pengalaman**

Di bagian "**Ketentuan Pengalaman**", isi:

```
✅ Pengalaman Sejenis: 7        (Jumlah proyek sejenis)
✅ Tahun Sejenis: 10            (Dalam X tahun terakhir)
✅ Pengalaman Beda Jenis: 6     (Jumlah proyek beda jenis)
✅ Tahun Beda Jenis: 10         (Dalam Y tahun terakhir)
✅ Note Pengalaman: [Opsional]  (Reminder untuk POKJA)
```

**Contoh Note:**
> "Lead firm sesuai hasil klarifikasi dari LKPP, bukan dari dokumen penawaran administrasi"

---

### 2. **Add Perusahaan + KSO**

Paste data perusahaan dari Excel seperti biasa. Jika ada KSO, tambahkan di detail perusahaan.

---

### 3. **Generate!**

Klik tombol **"Generate Semua Berita Acara Pokja"**.

Sistem akan:
- ✅ Copy 3 master files ke setiap folder perusahaan
- ✅ **Auto-generate baris** di Excel sesuai input
- ✅ Isi placeholder `{leadfirm}`, `{kso}`, `{note_pengalaman}`
- ✅ Format cells (borders, alignment, etc.)
- ✅ Highlight note dengan background kuning

---

## 📊 Hasil di Excel:

### Structure:

```
┌─────────────────────────────────────────────────┐
│ Lampiran Pembuktian Pengalaman                  │
├─────────────────────────────────────────────────┤
│ No │ Nama Paket │ Tahun │ ... │ KSO/Tidak KSO  │
├─────────────────────────────────────────────────┤
│    10 Tahun Terakhir (Sejenis)                  │  ← Auto-filled
├─────────────────────────────────────────────────┤
│ 1  │            │       │     │                 │  ┐
│ 2  │            │       │     │                 │  │
│ 3  │            │       │     │                 │  │ 7 rows
│ 4  │            │       │     │                 │  │ (auto-generated)
│ 5  │            │       │     │                 │  │
│ 6  │            │       │     │                 │  │
│ 7  │            │       │     │                 │  ┘
├─────────────────────────────────────────────────┤
│         10 TAHUN TERAKHIR                       │  ← Auto-filled
├─────────────────────────────────────────────────┤
│ 1  │            │       │     │                 │  ┐
│ 2  │            │       │     │                 │  │
│ 3  │            │       │     │                 │  │ 6 rows
│ 4  │            │       │     │                 │  │ (auto-generated)
│ 5  │            │       │     │                 │  │
│ 6  │            │       │     │                 │  ┘
├─────────────────────────────────────────────────┤
│    NILAI PENGALAMAN TERTINGGI (NPT)             │
├─────────────────────────────────────────────────┤
│ 1  │            │       │     │                 │
├─────────────────────────────────────────────────┤
│ 🟡 *Hapus note ini sebelum ditunjukkan          │  ← Yellow highlight
│ 🟡 NOTE: Lead firm sesuai hasil klarifikasi...  │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Keuntungan:

| Sebelum | Sesudah |
|---------|---------|
| ❌ Copy-paste manual rows | ✅ Auto-generate sesuai input |
| ❌ Sering salah jumlah | ✅ Selalu tepat sesuai form |
| ❌ Format berantakan | ✅ Format konsisten |
| ❌ Lupa note penting | ✅ Note highlighted kuning |
| ⏱️ ~5 menit per file | ⏱️ 0 detik (instant) |

---

## 🧪 Test Sekarang!

1. Refresh browser (Ctrl+F5)
2. Isi form pengalaman:
   - Sejenis: `7`, Tahun: `10`
   - Beda Jenis: `6`, Tahun: `10`
   - Note: `"Test auto-generate"`
3. Add 1-2 perusahaan
4. Generate!
5. Buka Excel → Check:
   - ✅ Ada 7 baris sejenis
   - ✅ Ada 6 baris beda jenis
   - ✅ Ada 1 baris NPT
   - ✅ Note kuning di bawah
   - ✅ Semua cells ter-format dengan baik

---

## 🔧 Troubleshooting:

**❓ Error: "ModuleNotFoundError: No module named 'openpyxl'"**
- ✅ **Solved!** Already installed dengan `pip install openpyxl`

**❓ Excel cells tidak ter-format?**
- Check apakah template Excel (Master Pembuktian) sudah ada row 7 dengan formatting
- Row 7 digunakan sebagai template untuk copy formatting

**❓ Placeholder tidak diganti?**
- Pastikan template Excel menggunakan placeholder yang benar:
  - `{X_tahun_sejenis}` untuk tahun sejenis
  - `{X_tahun_beda_jenis}` untuk tahun beda jenis
  - `{note_pengalaman}` untuk note
  - `{leadfirm}`, `{kso}`, `{anggota2}`, `{anggota3}` untuk KSO

**❓ Note tidak muncul?**
- Note field opsional, boleh kosong
- Jika isi, note akan muncul di row paling bawah dengan highlight kuning

---

## 📄 Template Excel Requirements:

File: `09.no-3-Lamp Kerja Sejenis.xlsx`

**Minimal structure:**
- Row 6: Header dengan placeholder `{X_tahun_sejenis}`
- Row 7: Template row dengan proper formatting (borders, alignment)
- Cells di row 7 akan di-copy untuk semua generated rows

**Optional placeholders:**
- `{X_tahun_sejenis}` - Will be replaced with tahun sejenis value
- `{X_tahun_beda_jenis}` - Will be replaced with tahun beda jenis value
- `{note_pengalaman}` - Will be replaced with note text
- `{leadfirm}` - Lead firm name
- `{kso}` - KSO members (comma-separated)
- `{anggota2}` - KSO member #2
- `{anggota3}` - KSO member #3

---

## ✅ Ready to Use!

Feature sudah **production-ready**. Silakan test dan gunakan untuk pembuktian berikutnya!

**Happy generating! 🎉**

---

**Created By:** GitHub Copilot  
**Date:** October 19, 2025
