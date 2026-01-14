import re
from typing import Dict, Any, Optional, Tuple

from datetime import datetime
import json
import os
import time
from config import DefaultConfig
from typing import List

DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

# Document type mapping untuk nomor urut surat (shared constant)
DOCUMENT_TYPES = {
    '00': 'Cover',
    '06': 'Berita Acara Pemberian Penjelasan Kualifikasi',
    '10': 'Berita Acara Hasil Evaluasi Kualifikasi',
    '11': 'Berita Acara Penetapan Daftar Pendek',
    '12': 'Pengumuman Daftar Pendek',
    '13': 'Berita Acara Jawab Sanggah PrakualIFIKASI',
    '14': 'Berita Acara Pemberian Penjelasan Seleksi',
    '17': 'Berita Acara Hasil Evaluasi Administrasi Dan Teknis',
    '19': 'Berita Acara Hasil Evaluasi Biaya',
    '20': 'Berita Acara Kombinasi Teknis Dan Biaya',
    '21': 'Surat Klarifikasi Personel',
    '22': 'Berita Acara Klarifikasi Penetapan Pemenang',
    '22-LHP': 'Berita Acara Hasil Penelitian',
    '24': 'Berita Acara Penetapan Pemenang',
    '25': 'Berita Acara Pengumuman Pemenang',
    '26': 'Berita Acara Jawab Sanggah Seleksi',
    '27': 'Berita Acara Klarifikasi Dan Negosiasi Teknis Dan Biaya',
    '27-2': 'Daftar Hadir Klarifikasi Dan Negosiasi',
    '28': 'Berita Acara Hasil Pemilihan',
    '29': 'Surat Penyampaian BAHP',
    '96': 'Surat pernyataan Klarifikasi personil dan paket 1 dan 2',
    '97': 'Berita Acara Seleksi Ulang',
    '99': 'TTD Pokja',
}


def terbilang(angka: int, capitalize_each_word: bool = False) -> str:
    """Convert integer to Indonesian words.

    Args:
        angka: number to convert (int)
        capitalize_each_word: if True, title-case each word

    Returns:
        Indonesian words as string
    """
    if angka == 0:
        result = "nol"
        return result.title() if capitalize_each_word else result

    satuan = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan"]
    belasan = ["sepuluh", "sebelas", "dua belas", "tiga belas", "empat belas", "lima belas",
               "enam belas", "tujuh belas", "delapan belas", "sembilan belas"]
    puluhan = ["", "", "dua puluh", "tiga puluh", "empat puluh", "lima puluh",
               "enam puluh", "tujuh puluh", "delapan puluh", "sembilan puluh"]

    def konversi_ratusan(n: int) -> str:
        hasil = ""
        if n >= 100:
            if n >= 200:
                hasil += satuan[n // 100] + " ratus "
            else:
                hasil += "seratus "
            n %= 100

        if n >= 20:
            hasil += puluhan[n // 10] + " "
            n %= 10
        elif n >= 10:
            hasil += belasan[n - 10] + " "
            n = 0

        if n > 0:
            hasil += satuan[n] + " "

        return hasil.strip()

    def konversi_ribuan(n: int) -> str:
        if n == 0:
            return ""
        elif n == 1:
            return "seribu "
        else:
            return konversi_ratusan(n) + " ribu "

    def konversi_jutaan(n: int) -> str:
        if n == 0:
            return ""
        elif n == 1:
            return "satu juta "
        else:
            return konversi_ratusan(n) + " juta "

    def konversi_miliaran(n: int) -> str:
        if n == 0:
            return ""
        elif n == 1:
            return "satu miliar "
        else:
            return konversi_ratusan(n) + " miliar "

    def konversi_triliunan(n: int) -> str:
        if n == 0:
            return ""
        elif n == 1:
            return "satu triliun "
        else:
            return konversi_ratusan(n) + " triliun "

    hasil = ""

    if angka >= 1000000000000:
        triliun = angka // 1000000000000
        hasil += konversi_triliunan(triliun)
        angka %= 1000000000000

    if angka >= 1000000000:
        miliar = angka // 1000000000
        hasil += konversi_miliaran(miliar)
        angka %= 1000000000

    if angka >= 1000000:
        juta = angka // 1000000
        hasil += konversi_jutaan(juta)
        angka %= 1000000

    if angka >= 1000:
        ribu = angka // 1000
        hasil += konversi_ribuan(ribu)
        angka %= 1000

    if angka > 0:
        hasil += konversi_ratusan(angka) + " "

    result = hasil.strip()
    return result.title() if capitalize_each_word else result


def format_currency(amount: int) -> str:
    """Format integer into Indonesian Rupiah string e.g. Rp 1.234,00"""
    if amount == 0:
        return "Rp 0,00"
    formatted = f"Rp {amount:,.2f}".replace(',', 'TEMP').replace('.', ',').replace('TEMP', '.')
    return formatted


def replace_keywords_in_text(text: str, keywords: Dict[str, Any], keyword_details: Optional[Dict[str, Any]] = None) -> Tuple[str, int]:
    """Replace placeholders like {key} in `text` with provided `keywords` values.

    Returns tuple (new_text, replacements_count)
    """
    if keyword_details is None:
        keyword_details = {}

    if not keywords:
        return text, 0

    # Build regex pattern using escaped keys
    pattern = re.compile(r"\{(" + "|".join(re.escape(key) for key in keywords.keys()) + r")\}")
    replacements_count = 0

    def replacer(match: re.Match) -> str:
        nonlocal replacements_count
        key = match.group(1)
        value = str(keywords.get(key, match.group(0)))
        if key in keyword_details:
            keyword_details[key]['count'] += 1
        else:
            keyword_details[key] = {'value': value, 'count': 1}
        replacements_count += 1
        return value

    new_text = pattern.sub(replacer, text)
    return new_text, replacements_count


def format_date_indonesian(date_string: str) -> str:
    if not date_string:
        return ''
    try:
        date_obj = datetime.strptime(date_string, '%Y-%m-%d')
        day = date_obj.day
        month = MONTH_NAMES[date_obj.month - 1]
        year = date_obj.year
        return f"{day} {month} {year}"
    except Exception:
        return date_string


PROCESSED_FILES_DIR = DefaultConfig.PROCESSED_FILES_DIR


def clean_old_processed_files() -> None:
    """Remove files older than one hour from processed results directory."""
    try:
        os.makedirs(PROCESSED_FILES_DIR, exist_ok=True)
        current_time = time.time()
        one_hour = 3600
        for filename in os.listdir(PROCESSED_FILES_DIR):
            filepath = os.path.join(PROCESSED_FILES_DIR, filename)
            if os.path.isfile(filepath):
                file_age = current_time - os.path.getmtime(filepath)
                if file_age > one_hour:
                    try:
                        os.remove(filepath)
                    except Exception:
                        pass
    except Exception:
        pass


def generate_date_keywords(date_string: str, doc_num: str) -> Dict[str, str]:
    """Generate derived date keywords for a document number."""
    keywords: Dict[str, str] = {}
    if not date_string:
        return keywords
    try:
        if '/' in date_string:
            day, month, year = date_string.split('/')
            date_obj = datetime(int(year), int(month), int(day))
        else:
            date_obj = datetime.strptime(date_string, '%Y-%m-%d')

        keywords[f'format_tanggal_{doc_num}'] = date_string
        keywords[f'tanggal_bulan_tahun_{doc_num}'] = f"{date_obj.day} {MONTH_NAMES[date_obj.month - 1]} {date_obj.year}"
        keywords[f'hari_surat_{doc_num}'] = DAY_NAMES[date_obj.weekday()]
        keywords[f'tanggal_sebut_{doc_num}'] = terbilang(date_obj.day, True)
        keywords[f'bulan_sebut_{doc_num}'] = MONTH_NAMES[date_obj.month - 1]
        keywords[f'tahun_sebut_{doc_num}'] = terbilang(date_obj.year, True)
    except Exception:
        pass
    return keywords


def generate_comprehensive_keywords(form_data: Any) -> Dict[str, Any]:
    """Generate a comprehensive keywords dict from form data (migrated from legacy baapp)."""
    keywords: Dict[str, Any] = {}

    # Basic information
    keywords['nomor_sk_pokja'] = form_data.get('nomor_sk_pokja', '')
    keywords['tanggal_sk_pokja'] = format_date_indonesian(form_data.get('tanggal_sk_pokja', ''))
    keywords['nomor_sk_timlak'] = form_data.get('nomor_sk_timlak', '')
    keywords['tanggal_sk_timlak'] = format_date_indonesian(form_data.get('tanggal_sk_timlak', ''))
    keywords['kode_pokja'] = form_data.get('kode_pokja', '')
    keywords['tahun_surat'] = form_data.get('tahun_surat', '')
    keywords['tahun_anggaran'] = form_data.get('tahun_anggaran', '')
    keywords['kode_tender'] = form_data.get('kode_tender', '')
    keywords['nama_paket'] = form_data.get('nama_paket', '')
    keywords['klpd'] = form_data.get('klpd', '')
    keywords['unit_organisasi'] = form_data.get('unit_organisasi', '')
    keywords['balai'] = form_data.get('balai', '')
    keywords['satuan_kerja'] = form_data.get('satuan_kerja', '')
    keywords['kegiatan'] = form_data.get('kegiatan', '')
    keywords['jenis_pengadaan'] = form_data.get('jenis_pengadaan', '')
    keywords['metode_pengadaan'] = form_data.get('metode_pengadaan', '')
    keywords['sumber_dana'] = form_data.get('sumber_dana', '')

    # Numeric values
    try:
        nilai_pagu = int(form_data.get('nilai_pagu', '0') or '0')
        nilai_hps = int(form_data.get('nilai_hps', '0') or '0')
    except Exception:
        nilai_pagu = nilai_hps = 0

    keywords['nilai_pagu'] = format_currency(nilai_pagu)
    keywords['terbilang_pagu'] = (terbilang(nilai_pagu, False) + ' Rupiah') if nilai_pagu > 0 else ''
    keywords['nilai_hps'] = format_currency(nilai_hps)
    keywords['terbilang_hps'] = (terbilang(nilai_hps, False) + ' Rupiah') if nilai_hps > 0 else ''

    keywords['pokja_pemilihan'] = f"Kelompok Kerja Pemilihan {keywords.get('kode_pokja','')} BP2JK Wilayah Kalimantan Selatan Tahun Anggaran {keywords.get('tahun_anggaran','')}"

    # Ketua and Sekre handling
    ketua_data = form_data.get('ketua_pokja', '')
    if ketua_data:
        try:
            ketua_obj = json.loads(ketua_data)
            keywords['ketua_pokja'] = ketua_obj.get('nama', '')
            keywords['nip_ketua_pokja'] = ketua_obj.get('nip', '')
            keywords['email_ketua_pokja'] = ketua_obj.get('email', '')
        except (json.JSONDecodeError, TypeError):
            keywords['ketua_pokja'] = ketua_data
            keywords['nip_ketua_pokja'] = form_data.get('nip_ketua_pokja', '')
            keywords['email_ketua_pokja'] = form_data.get('email_ketua_pokja', '')
    else:
        keywords['ketua_pokja'] = ''
        keywords['nip_ketua_pokja'] = ''
        keywords['email_ketua_pokja'] = ''

    sekre_data = form_data.get('sekre_pokja', '')
    if sekre_data:
        try:
            sekre_obj = json.loads(sekre_data)
            keywords['sekre_pokja'] = sekre_obj.get('nama', '')
            keywords['nip_sekre_pokja'] = sekre_obj.get('nip', '')
            keywords['email_sekre_pokja'] = sekre_obj.get('email', '')
        except (json.JSONDecodeError, TypeError):
            keywords['sekre_pokja'] = sekre_data
            keywords['nip_sekre_pokja'] = form_data.get('nip_sekre_pokja', '')
            keywords['email_sekre_pokja'] = form_data.get('email_sekre_pokja', '')
    else:
        keywords['sekre_pokja'] = ''
        keywords['nip_sekre_pokja'] = ''
        keywords['email_sekre_pokja'] = ''

    # Anggota slots
    for i in range(3, 8):
        keywords[f'anggota{i}_pokja'] = ''
        keywords[f'nip_anggota{i}_pokja'] = ''
        keywords[f'email_anggota{i}_pokja'] = ''

    anggota_selections: List[str] = []
    if hasattr(form_data, 'getlist'):
        anggota_selections = form_data.getlist('anggota_pokja')
    else:
        raw = form_data.get('anggota_pokja', [])
        if isinstance(raw, list):
            anggota_selections = raw
        elif raw:
            anggota_selections = [raw]

    anggota_index = 3
    for anggota_data in anggota_selections:
        if anggota_index > 7:
            break
        if anggota_data:
            try:
                anggota_obj = json.loads(anggota_data)
                keywords[f'anggota{anggota_index}_pokja'] = anggota_obj.get('nama', '')
                keywords[f'nip_anggota{anggota_index}_pokja'] = anggota_obj.get('nip', '')
                keywords[f'email_anggota{anggota_index}_pokja'] = anggota_obj.get('email', '')
            except (json.JSONDecodeError, TypeError):
                keywords[f'anggota{anggota_index}_pokja'] = anggota_data
                keywords[f'nip_anggota{anggota_index}_pokja'] = form_data.get(f'nip_anggota{anggota_index}_pokja', '')
                keywords[f'email_anggota{anggota_index}_pokja'] = form_data.get(f'email_anggota{anggota_index}_pokja', '')
            anggota_index += 1

    for i in range(3, 8):
        if not keywords[f'anggota{i}_pokja']:
            keywords[f'anggota{i}_pokja'] = form_data.get(f'anggota{i}_pokja', '')
            keywords[f'nip_anggota{i}_pokja'] = form_data.get(f'nip_anggota{i}_pokja', '')
            keywords[f'email_anggota{i}_pokja'] = form_data.get(f'email_anggota{i}_pokja', '')

    # Generate date-derived keywords
    doc_numbers = ['00', '06', '10', '11', '12', '13', '14', '17', '19', '20', '21', '22', '22-LHP', '24', '25', '26', '27', '27-2', '28', '29', '96', '97', '99']
    for doc_num in doc_numbers:
        date_key = f'format_tanggal_{doc_num}'
        date_value = form_data.get(date_key, '')
        if date_value:
            date_keywords = generate_date_keywords(date_value, doc_num)
            keywords.update(date_keywords)

    return keywords


def generate_keywords_from_form(form_data: Any) -> Dict[str, Any]:
    """Legacy simple keyword generator used by the basic "process_keywords" endpoint."""
    keywords: Dict[str, Any] = {}
    keywords['kode_pokja'] = form_data.get('kode_pokja', '')
    keywords['tahun'] = form_data.get('tahun', '')
    keywords['nama_paket'] = form_data.get('nama_paket', '')
    keywords['klpd'] = form_data.get('klpd', '')
    keywords['satuan_kerja'] = form_data.get('satuan_kerja', '')

    doc_type = form_data.get('document_type', '')
    keywords['nomor_surat'] = f"PB0301-Bp2jk17/POKJA-{keywords.get('kode_pokja','')}/{keywords.get('tahun','')}/{doc_type}"

    for key, value in form_data.items():
        if key.startswith('custom_var_name_'):
            var_index = key.replace('custom_var_name_', '')
            var_value_key = f'custom_var_value_{var_index}'
            var_name = value
            var_value = form_data.get(var_value_key, '')
            if var_name and var_value:
                keywords[var_name] = var_value

    return keywords
