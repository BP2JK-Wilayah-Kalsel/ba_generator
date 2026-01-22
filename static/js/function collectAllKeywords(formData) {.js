function collectAllKeywords(formData) {
    const keywords = {};

    //Data DHP1
    keywords.tanggal_DHP1 = formatDateIndonesian(formData.get('tanggal_DHP1') || '');

    //Data DHP2
    keywords.tanggal_DHP2 = formatDateIndonesian(formData.get('tanggal_DHP2') || '');

    //Data Paket______________________________________________________________
    keywords.nama_paket = formData.get('nama_paket') || '';
    keywords.balai = formData.get('balai') || '';
    keywords.satuan_kerja = formData.get('satuan_kerja') || '';
    keywords.ppk = formData.get('ppk') || '';
    keywords.nama_ppk = formData.get('nama_ppk') || '';
    keywords.jenis_pengadaan = formData.get('jenis_pengadaan') || '';
    keywords.metode_pengadaan = formData.get('metode_pengadaan') || '';
    keywords.tahun_anggaran = formData.get('tahun_anggaran') || '';
    keywords.kode_klasifikasi = formData.get('kode_klasifikasi') || '';
    // Uppercase versions for all text fields
    keywords.satuan_kerja_upper = keywords.satuan_kerja.toUpperCase();
    // Data Nilai Pagu dan HPS
    const nilaiPagu = parseInt(formData.get('nilai_pagu') || '0');
    const nilaiHps = parseInt(formData.get('nilai_hps') || '0');
    keywords.nilai_pagu = formatCurrency(nilaiPagu);
    keywords.terbilang_pagu = terbilang(nilaiPagu, false) + ' rupiah';
    keywords.nilai_hps = formatCurrency(nilaiHps);
    keywords.terbilang_hps = terbilang(nilaiHps, false) + ' rupiah';
    //Data Paket______________________________________________________________

    // Data Pokja dan Timlak______________________________________________________
    keywords.nomor_sk_pokja = formData.get('nomor_sk_pokja') || '';
    keywords.tanggal_sk_pokja = formatDateIndonesian(formData.get('tanggal_sk_pokja') || '');
    keywords.nomor_sk_timlak = formData.get('nomor_sk_timlak') || '';
    keywords.tanggal_sk_timlak = formatDateIndonesian(formData.get('tanggal_sk_timlak') || '');
    keywords.kode_pokja = formData.get('kode_pokja') || '';

    // Extract year from tanggal_sk_pokja
    const tanggalSkPokja = formData.get('tanggal_sk_pokja') || '';
    if (tanggalSkPokja) {
        const dateObj = new Date(tanggalSkPokja);
        keywords.tahun_surat = dateObj.getFullYear().toString();
    } else {
        keywords.tahun_surat = new Date().getFullYear().toString();
    }
    // Nomor dan Tanggal Undangan Rapat
    keywords['nomor_undangan_rapat'] = formData.get('nomor_undangan_rapat') || '';
    keywords['tanggal_undangan_rapat'] = formatDateIndonesian(formData.get('tanggal_undangan_rapat') || '');

    // Handle pokja data
    keywords['ketua_pokja'] = formData.get('ketua_pokja') || '';
    keywords['sekre_pokja'] = formData.get('sekre_pokja') || '';
    keywords['anggota_pokja1'] = formData.get('anggota_pokja1') || '';
    keywords['anggota_pokja2'] = formData.get('anggota_pokja2') || '';
    keywords['anggota_pokja3'] = formData.get('anggota_pokja3') || '';

    // Handle timlak
    keywords['ketua_timlak'] = formData.get('ketua_timlak') || '';
    keywords['sekre_timlak'] = formData.get('sekre_timlak') || '';
    keywords['anggota_timlak'] = formData.get('anggota_timlak') || '';

    const tanggalDokumen = formData.get('tanggal_dokumen');
    const dateObj = new Date(tanggalDokumen);
    if (tanggalDokumen) {
        keywords['format_tanggal_timlak'] = tanggalDokumen;
        keywords['tanggal_bulan_tahun_timlak'] = `${dateObj.getDate()} ${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
        keywords['hari_surat_timlak'] = dayNames[dateObj.getDay()];
        keywords['tanggal_sebut_timlak'] = terbilang(dateObj.getDate());
        keywords['bulan_sebut_timlak'] = monthNames[dateObj.getMonth()];
        keywords['tahun_sebut_timlak'] = terbilang(dateObj.getFullYear());
    }

    // Custom variables
    for (let i = 1; i <= customVariableCount; i++) {
        const varName = formData.get(`custom_var_name_${i}`);
        const varValue = formData.get(`custom_var_value_${i}`);
        if (varName && varValue) {
            keywords[varName] = varValue;
        }
    }

    return keywords;
}