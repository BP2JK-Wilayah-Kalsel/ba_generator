# BA Generator - Sistem Generator Berita Acara Terintegrasi

## 📋 Informasi Program

**Pengembang:** Muhammad Rayhan Kurniawan, S.Kom. | Yusup Hidayat, S.T.
**Instansi:** Kementerian Pekerjaan Umum  
**Tahun:** 2025-2026
**Versi:** 1.0.1

---

## 📖 Deskripsi

BA Generator adalah aplikasi berbasis web untuk mengotomatisasi pembuatan Berita Acara (BA) dalam proses pengadaan barang dan jasa. Aplikasi ini dikembangkan sebagai bagian dari Program Aktualisasi Latsar CPNS 2025 dan dimasukkan kedalam SIKANTAN.

### ✨ Fitur Utama

1. **Generator BA Pokja Konsultan**
   - Generate multiple dokumen sekaligus
   - Auto-fill data dari SPSE
   - Template nomor surat otomatis
   - Preview dokumen sebelum generate

2. **Generator BA Timlak Konsultan**
   - Support multiple jenis dokumen
   - Nomor surat dengan template
   - Preview nomor surat otomatis
   - Nomor undangan rapat auto-generate

3. **Persiapan Pembuktian Kualifikasi**
   - Generate checklist pembuktian
   - Import data dari Excel
   - Auto-format dokumen

4. **Fitur Tambahan**
   - Save/Load data form
   - Export hasil ke folder terpisah
   - Preview HTML sebelum generate
   - Replace hyperlink otomatis
   - Uppercase keyword variants

---

## 🚀 Cara Menggunakan

### Akses URL

1. **Double-click** file `BA Generator.exe`
2. Browser akan terbuka otomatis di `http://127.0.0.1:5000`
3. Pilih menu yang diinginkan dari halaman utama

### Menu Utama

#### 1️⃣ BA Pokja Konsultan
Untuk generate dokumen BA Pokja:

1. Klik tombol **"Pilih Master Folder"** → Pilih `Master BA Pokja Konsultan`
2. Isi data dengan 2 cara:
   - **Otomatis:** Isi Kode Tender → Klik **"Ambil data SPSE"**
   - **Manual:** Isi semua field satu per satu
3. Centang dokumen yang ingin di-generate
4. Klik **"Generate Semua Dokumen"**
5. File hasil ada di folder `processed_results/`

**Fitur Khusus:**
- 📥 **Ambil data SPSE:** Auto-fill nama paket, nilai pagu/HPS, KLPD, dll
- 💾 **Save/Load:** Simpan data form untuk digunakan lagi
- 👁️ **Preview:** Lihat hasil dokumen sebelum generate

#### 2️⃣ BA Timlak Konsultan
Untuk generate dokumen BA Timlak:

1. Klik **"Pilih Master Folder"** → Pilih `Master BA Timlak Konsultan`
2. Isi data dasar (SK, Paket Pekerjaan, dll)
3. Input nomor surat (beberapa punya template otomatis):
   - **Memo Dinas:** Isi 4 digit → Auto jadi `xxxx/MD/Bp2jk17/{tahun}`
   - **Nota Dinas:** Isi 4 digit → Auto jadi `xxxx/ND/Bp2jk17/{tahun}`
   - **Catatan Pemeriksaan:** Isi 4 digit → Auto jadi `PB0301-Bp2jk17/xxxx`
4. Nomor Undangan Rapat otomatis ter-generate
5. Centang dokumen yang ingin dibuat
6. Klik **"Generate Semua Dokumen"**

**Fitur Khusus:**
- 📄 **Preview Nomor:** Lihat preview nomor surat di bawah input
- 🔄 **Template Otomatis:** Beberapa nomor auto-format

#### 3️⃣ Persiapan Pembuktian
Untuk generate checklist pembuktian:

1. Klik **"Pilih Master Folder"** → Pilih `Master Pembuktian`
2. Isi data atau import dari Excel
3. Klik **"Generate Dokumen"**

---

## 🎯 Keywords yang Tersedia

### Keywords Dasar
- `{nomor_sk_pokja}`, `{tanggal_sk_pokja}`, `{kode_pokja}`
- `{nama_paket}`, `{klpd}`, `{satuan_kerja}`, `{kegiatan}`
- `{nilai_pagu}`, `{nilai_hps}`, `{terbilang_pagu}`, `{terbilang_hps}`
- `{jenis_pengadaan}`, `{metode_pengadaan}`, `{sumber_dana}`

### Keywords Uppercase (Versi Huruf Besar)
Tambahkan suffix `_upper` untuk versi uppercase:
- `{satuan_kerja_upper}` → HURUF BESAR
- `{nama_paket_upper}` → HURUF BESAR
- `{ketua_pokja_upper}` → HURUF BESAR
- Dan semua field text lainnya

### Keywords Anggota
- Pokja: `{ketua_pokja}`, `{sekre_pokja}`, `{anggota3_pokja}`, dll
- Timlak: `{ketua_timlak}`, `{sekre_timlak}`, `{anggota_timlak}`
- Email: `{email_ketua_pokja}`, `{email_sekre_timlak}`, dll

### Keywords Tanggal
Untuk setiap tanggal, tersedia format:
- `{format_tanggal_01}` → 2025-11-03
- `{tanggal_bulan_tahun_01}` → 3 November 2025
- `{hari_surat_01}` → Minggu
- `{tanggal_sebut_01}` → Tiga
- `{bulan_sebut_01}` → November
- `{tahun_sebut_01}` → Dua Ribu Dua Puluh Lima

---

## 🔧 Troubleshooting

### Tombol "Ambil data SPSE" error
- Pastikan ada koneksi internet
- Cek Kode Tender sudah benar (contoh: 10094973000)
- Tunggu beberapa saat, server SPSE mungkin lambat

### Preview dokumen tidak muncul
- Pastikan Master Folder sudah dipilih dan valid
- Pastikan file template .docx ada di Master Folder
- Check apakah ada keyword yang belum diisi

### File hasil tidak muncul
- Check folder `processed_results/`
- Pastikan tidak ada error saat generate
- Coba buka Console log untuk detail error

### Hyperlink email tidak berubah
- Sudah fixed di versi ini
- Mailto address akan auto-update sesuai keyword
- Restart aplikasi jika masih bermasalah

---

## 🔄 Auto-Clean Processed Results

Aplikasi akan otomatis **menghapus file lama** di folder `processed_results/` setiap kali generate dokumen baru, untuk menghindari penumpukan file.

---

## 📞 Dukungan

Jika ada pertanyaan atau kendala:
1. Baca file `CARA_PENGGUNAAN.txt` untuk panduan singkat
2. Check console log untuk error detail
3. Hubungi pengembang melalui instansi terkait

---

## 📜 Lisensi & Copyright

© 2026 SIKANTAN - BP2JK Wilayah Kalimantan Selatan
Kementerian Pekerjaan Umum

---

## 🎓 Tentang Program Aktualisasi

Program ini merupakan hasil implementasi dari Program Aktualisasi Latsar CPNS 2025, yang bertujuan untuk:

1. **Meningkatkan Efisiensi:** Otomatisasi proses pembuatan BA menghemat waktu hingga 80%
2. **Mengurangi Kesalahan:** Standardisasi format dan auto-fill mengurangi human error
3. **Integrasi Data:** Koneksi ke SPSE untuk akurasi data
4. **Dokumentasi Terstruktur:** Hasil tersimpan rapi dan mudah diakses

**Nilai-Nilai ASN yang Diterapkan:**
- **Berorientasi Pelayanan:** Mempermudah proses administrasi pengadaan
- **Akuntabel:** Dokumentasi lengkap dan traceable
- **Kompeten:** Penguasaan teknologi untuk solusi inovatif
- **Harmonis:** Kolaborasi antar unit dalam satu sistem
- **Loyal:** Dedikasi untuk kemajuan instansi
- **Adaptif:** Solusi yang dapat disesuaikan dengan kebutuhan
- **Kolaboratif:** Memfasilitasi kerja tim yang lebih baik

---

**Terima kasih telah menggunakan BA Generator!**

*Semoga bermanfaat untuk kemajuan pelayanan publik.*