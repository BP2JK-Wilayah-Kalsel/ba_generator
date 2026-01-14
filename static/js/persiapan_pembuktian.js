// ===== GLOBAL VARIABLES =====
let masterFolderValidated = false;
let parsedCompanies = [];
let companiesWithDetails = [];
let pokjaMembers = [];

let requiredFiles = [
    {
        name: '09.no-1-BA Pembuktian.docx',
        type: 'BA',
        description: 'Template Berita Acara Pembuktian'
    },
    {
        name: '09.no-3-Lamp Kerja Sejenis.xlsx',
        type: 'Excel',
        description: 'Template Lampiran Pengalaman Sejenis'
    },
    {
        name: '09.no-4-Daftar Hadir Pembuktian.docx',
        type: 'Daftar Hadir',
        description: 'Template Daftar Hadir Pembuktian'
    }
];

// ===== POKJA MANAGEMENT FUNCTIONS =====

// Load POKJA members from CSV
async function loadPokjaMembers() {
    try {
        const response = await fetch('/static/pokja_members.csv');
        const csvText = await response.text();

        const lines = csvText.split('\n');
        pokjaMembers = [];

        // Skip header
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Handle both quoted and unquoted CSV fields
            const fields = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];

            if (fields.length >= 4) {
                const nama = fields[0].replace(/^"|"$/g, '').trim();
                const nip = fields[1].replace(/^"|"$/g, '').trim();
                const email = fields[2].replace(/^"|"$/g, '').trim();
                const group = fields[3].replace(/^"|"$/g, '').trim().toLowerCase();

                // Only load POKJA members
                if (group === 'pokja') {
                    pokjaMembers.push({ nama, nip, email, group });
                }
            }
        }

        console.log('✅ POKJA members loaded:', pokjaMembers.length);
        initializePokjaSelectors();

    } catch (error) {
        console.error('Error loading POKJA members:', error);
        alert('⚠️ Gagal load data anggota POKJA. Pastikan file pokja_members.csv ada di folder static/');
    }
}

// Initialize POKJA selectors
function initializePokjaSelectors() {
    const ketuaSelect = document.getElementById('ketua_pokja');
    const sekreSelect = document.getElementById('sekre_pokja');
    const anggota3Select = document.getElementById('anggota3_select');
    const anggota4Select = document.getElementById('anggota4_select');
    const anggota5Select = document.getElementById('anggota5_select');

    if (!ketuaSelect) return;

    // Clear existing options
    [ketuaSelect, sekreSelect, anggota3Select, anggota4Select, anggota5Select].forEach(select => {
        if (select) {
            select.innerHTML = '<option value="">-- Pilih --</option>';
        }
    });

    // Populate with POKJA members
    pokjaMembers.forEach((member) => {
        const value = JSON.stringify(member);

        [ketuaSelect, sekreSelect, anggota3Select, anggota4Select, anggota5Select].forEach(select => {
            if (select) {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = member.nama;
                select.appendChild(option);
            }
        });
    });

    // Attach change listeners
    [ketuaSelect, sekreSelect, anggota3Select, anggota4Select, anggota5Select].forEach(select => {
        if (select) {
            select.addEventListener('change', updatePokjaTable);
        }
    });

    // Initialize empty table
    updatePokjaTable();
}

// Update POKJA table
function updatePokjaTable() {
    const ketuaValue = document.getElementById('ketua_pokja')?.value;
    const sekreValue = document.getElementById('sekre_pokja')?.value;
    const anggota3Value = document.getElementById('anggota3_select')?.value;
    const anggota4Value = document.getElementById('anggota4_select')?.value;
    const anggota5Value = document.getElementById('anggota5_select')?.value;

    const tableBody = document.getElementById('pokja_members_table');
    if (!tableBody) return;

    let tableHTML = '';
    let memberCount = 1;

    // Add Ketua
    if (ketuaValue) {
        try {
            const ketua = JSON.parse(ketuaValue);
            tableHTML += createPokjaTableRow(memberCount++, 'Ketua', ketua, 'ketua', ketuaValue);
        } catch (e) {
            console.error('Error parsing ketua data:', e);
        }
    }

    // Add Sekretaris
    if (sekreValue && sekreValue !== ketuaValue) {
        try {
            const sekre = JSON.parse(sekreValue);
            tableHTML += createPokjaTableRow(memberCount++, 'Sekretaris', sekre, 'sekre', sekreValue);
        } catch (e) {
            console.error('Error parsing sekre data:', e);
        }
    }

    // Add Anggota 3-5
    [
        { value: anggota3Value, role: 'Anggota 3', key: 'anggota3' },
        { value: anggota4Value, role: 'Anggota 4', key: 'anggota4' },
        { value: anggota5Value, role: 'Anggota 5', key: 'anggota5' }
    ].forEach(({ value, role, key }) => {
        if (value && value !== ketuaValue && value !== sekreValue) {
            try {
                const anggota = JSON.parse(value);
                tableHTML += createPokjaTableRow(memberCount++, role, anggota, key, value);
            } catch (e) {
                console.error(`Error parsing ${role} data:`, e);
            }
        }
    });

    if (tableHTML === '') {
        tableHTML = `
                    <tr>
                        <td colspan="6" class="text-center text-muted py-4">
                            <i class="fas fa-users fa-2x mb-2 d-block"></i>
                            Pilih Ketua, Sekretaris, dan Anggota untuk menampilkan tabel
                        </td>
                    </tr>
                `;
    }

    tableBody.innerHTML = tableHTML;
}

// Create POKJA table row
function createPokjaTableRow(no, role, member, roleKey, memberValue) {
    const badgeClass = role === 'Ketua' ? 'bg-primary' : role === 'Sekretaris' ? 'bg-info' : 'bg-secondary';

    return `
                <tr>
                    <td class="text-center align-middle fw-bold">${no}</td>
                    <td class="text-center align-middle">
                        <span class="badge ${badgeClass}">${role}</span>
                    </td>
                    <td class="align-middle">
                        ${member.nama}
                        <input type="hidden" name="${roleKey}_pokja" value="${member.nama}">
                    </td>
                    <td class="align-middle">
                        ${member.nip}
                        <input type="hidden" name="nip_${roleKey}_pokja" value="${member.nip}">
                    </td>
                    <td class="align-middle">
                        ${member.email !== '-' ? member.email : '<span class="text-muted">-</span>'}
                        <input type="hidden" name="email_${roleKey}_pokja" value="${member.email}">
                    </td>
                    <td class="text-center align-middle">
                        <button type="button" class="btn btn-outline-danger btn-sm" onclick="removePokjaMemberFromRole('${roleKey}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </td>
                </tr>
            `;
}

// Remove POKJA member from specific role
function removePokjaMemberFromRole(roleKey) {
    const selectId = roleKey === 'ketua' ? 'ketua_pokja' :
        roleKey === 'sekre' ? 'sekre_pokja' :
            roleKey === 'anggota3' ? 'anggota3_select' :
                roleKey === 'anggota4' ? 'anggota4_select' :
                    'anggota5_select';

    const select = document.getElementById(selectId);
    if (select) {
        select.value = '';
        updatePokjaTable();
    }
}

// ===== SPSE DATA FETCH FUNCTION =====

// Fetch data pengumuman from SPSE INAPROC website
async function fetchDataSPSE() {
    // Get kode tender from main form
    const kodeTender = document.getElementById('kode_tender').value.trim();

    if (!kodeTender) {
        showToast('Harap isi Kode Tender terlebih dahulu', 'warning');
        document.getElementById('kode_tender').focus();
        return;
    }

    // Show loading state
    const button = event.target.closest('button');
    const originalHTML = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengambil data...';

    try {
        const response = await fetch('/api/crawl_spse_pengumuman', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                kode_tender: kodeTender
            })
        });

        const result = await response.json();

        if (result.success && result.data) {
            const data = result.data;

            // Fill form fields with fetched data
            if (data.nama_paket) {
                document.getElementById('nama_paket').value = data.nama_paket;
            }

            if (data.nilai_pagu) {
                document.getElementById('nilai_pagu').value = data.nilai_pagu;
                // Trigger terbilang update
                updateTerbilangPagu();
            }

            if (data.nilai_hps) {
                document.getElementById('nilai_hps').value = data.nilai_hps;
                // Trigger terbilang update
                updateTerbilangHPS();
            }

            if (data.klpd) {
                document.getElementById('klpd').value = data.klpd;
            }

            if (data.jenis_pengadaan) {
                document.getElementById('jenis_pengadaan').value = data.jenis_pengadaan;
            }

            if (data.metode_pengadaan) {
                document.getElementById('metode_pengadaan').value = data.metode_pengadaan;
            }

            showToast('Berhasil mengambil data dari SPSE!', 'success');
        } else {
            showToast('Gagal: ' + (result.error || 'Terjadi kesalahan'), 'danger');
        }
    } catch (error) {
        console.error('Error fetching from SPSE:', error);
        showToast('Error: ' + error.message, 'danger');
    } finally {
        // Restore button
        button.disabled = false;
        button.innerHTML = originalHTML;
    }
}

// ===== BASIC INFO FUNCTIONS =====

// Toggle Balai delete
function toggleBalaiDelete() {
    const deleteFlag = document.getElementById('balai_delete_flag');
    const deleteBtn = document.getElementById('balai_delete_btn');
    const balaiInput = document.getElementById('balai');
    const deleteHint = document.getElementById('balai_delete_hint');

    if (deleteFlag.value === 'false') {
        deleteFlag.value = 'true';
        deleteBtn.classList.remove('btn-outline-danger');
        deleteBtn.classList.add('btn-danger');
        deleteBtn.innerHTML = '<i class="fas fa-undo"></i>';
        deleteBtn.title = 'Batalkan penghapusan';
        balaiInput.disabled = true;
        balaiInput.style.backgroundColor = '#ffebee';
        if (deleteHint) deleteHint.style.display = 'block';
    } else {
        deleteFlag.value = 'false';
        deleteBtn.classList.remove('btn-danger');
        deleteBtn.classList.add('btn-outline-danger');
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = 'Hapus keyword "balai" dari dokumen';
        balaiInput.disabled = false;
        balaiInput.style.backgroundColor = '';
        if (deleteHint) deleteHint.style.display = 'none';
    }
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Terbilang function (Indonesian number to words)
// Fungsi terbilang dengan parameter capitalize
function terbilang(num, capitalize = true) {
    const bilangan = capitalize
        ? ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas']
        : ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];

    const belas = capitalize ? ' Belas' : ' belas';
    const puluh = capitalize ? ' Puluh ' : ' puluh ';
    const seratus = capitalize ? 'Seratus ' : 'seratus ';
    const ratus = capitalize ? ' Ratus ' : ' ratus ';
    const seribu = capitalize ? 'Seribu ' : 'seribu ';
    const ribu = capitalize ? ' Ribu ' : ' ribu ';
    const juta = capitalize ? ' Juta ' : ' juta ';
    const miliar = capitalize ? ' Miliar ' : ' miliar ';
    const triliun = capitalize ? ' Triliun ' : ' triliun ';

    if (num < 12) return bilangan[num];
    if (num < 20) return terbilang(num - 10, capitalize) + belas;
    if (num < 100) return terbilang(Math.floor(num / 10), capitalize) + puluh + terbilang(num % 10, capitalize);
    if (num < 200) return seratus + terbilang(num - 100, capitalize);
    if (num < 1000) return terbilang(Math.floor(num / 100), capitalize) + ratus + terbilang(num % 100, capitalize);
    if (num < 2000) return seribu + terbilang(num - 1000, capitalize);
    if (num < 1000000) return terbilang(Math.floor(num / 1000), capitalize) + ribu + terbilang(num % 1000, capitalize);
    if (num < 1000000000) return terbilang(Math.floor(num / 1000000), capitalize) + juta + terbilang(num % 1000000, capitalize);
    if (num < 1000000000000) return terbilang(Math.floor(num / 1000000000), capitalize) + miliar + terbilang(num % 1000000000, capitalize);
    return terbilang(Math.floor(num / 1000000000000), capitalize) + triliun + terbilang(num % 1000000000000, capitalize);
}

// Update terbilang Pagu (lowercase)
function updateTerbilangPagu() {
    const amount = parseInt(document.getElementById('nilai_pagu').value) || 0;
    if (amount > 0) {
        const terbilangText = terbilang(amount, false).trim() + ' rupiah';
        document.getElementById('terbilang_pagu').value = terbilangText;
    } else {
        document.getElementById('terbilang_pagu').value = '';
    }
}

// Update terbilang HPS (lowercase)
function updateTerbilangHPS() {
    const amount = parseInt(document.getElementById('nilai_hps').value) || 0;
    if (amount > 0) {
        const terbilangText = terbilang(amount, false).trim() + ' rupiah';
        document.getElementById('terbilang_hps').value = terbilangText;
    } else {
        document.getElementById('terbilang_hps').value = '';
    }
}

// Format date to Indonesian
function formatDateIndonesian(dateString) {
    if (!dateString) return '';

    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    const date = new Date(dateString);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
}

// ===== KEYWORDS PREVIEW FUNCTION =====

function previewKeywords() {
    const keywords = collectAllKeywords();

    let content = '<div class="keyword-categories">';

    // Basic Info
    content += '<h6 class="text-primary border-bottom pb-2"><i class="fas fa-info-circle me-2"></i>Informasi Dasar</h6>';
    Object.entries(keywords).forEach(([key, value]) => {
        if (!key.includes('pokja') && !key.includes('kso') && !key.includes('pengalaman') && !key.includes('leadfirm') && !key.includes('anggota') && !key.includes('nama_kso')) {
            content += `<div class="mb-1"><code class="text-success">{${key}}</code>: <span class="text-dark">${value || '<em class="text-muted">kosong</em>'}</span></div>`;
        }
    });

    // Pengalaman Info
    content += '<h6 class="text-primary border-bottom pb-2 mt-3"><i class="fas fa-briefcase me-2"></i>Data Pengalaman</h6>';
    ['pengalaman_sejenis', 'X_tahun_sejenis', 'pengalaman_beda_jenis', 'X_tahun_beda_jenis', 'note_pengalaman'].forEach(key => {
        if (keywords[key] !== undefined) {
            content += `<div class="mb-1"><code class="text-success">{${key}}</code>: <span class="text-dark">${keywords[key] || '<em class="text-muted">kosong</em>'}</span></div>`;
        }
    });

    // KSO Placeholders
    content += '<h6 class="text-primary border-bottom pb-2 mt-3"><i class="fas fa-handshake me-2"></i>Placeholder KSO & Perusahaan</h6>';
    content += `<div class="alert alert-warning mb-2"><small><i class="fas fa-info-circle me-1"></i>Placeholder berikut akan diisi per-perusahaan saat generate</small></div>`;
    content += `<div class="mb-1"><code class="text-success">{no}</code>: <span class="text-dark">Nomor urut perusahaan (01, 02, 03, dst.)</span></div>`;
    content += `<div class="mb-1"><code class="text-success">{nama_kso}</code>: <span class="text-dark">Nama resmi KSO (diisi per perusahaan)</span></div>`;
    content += `<div class="mb-1"><code class="text-success">{leadfirm}</code>: <span class="text-dark">Nama lead firm (perusahaan utama)</span></div>`;
    content += `<div class="mb-1"><code class="text-success">{kso_anggota2}</code>: <span class="text-dark">Anggota KSO pertama</span></div>`;
    content += `<div class="mb-1"><code class="text-success">{kso_anggota3}</code>: <span class="text-dark">Anggota KSO kedua</span></div>`;
    content += `<div class="mb-1"><code class="text-success">{kso_anggota4}</code>: <span class="text-dark">Anggota KSO ketiga (jika ada)</span></div>`;
    content += `<div class="mb-1"><code class="text-success">{kso_anggota5}</code>: <span class="text-dark">Anggota KSO keempat (jika ada)</span></div>`;

    // POKJA Info
    content += '<h6 class="text-primary border-bottom pb-2 mt-3"><i class="fas fa-users me-2"></i>Anggota POKJA</h6>';
    Object.entries(keywords).forEach(([key, value]) => {
        if (key.includes('pokja')) {
            content += `<div class="mb-1"><code class="text-success">{${key}}</code>: <span class="text-dark">${value || '<em class="text-muted">kosong</em>'}</span></div>`;
        }
    });

    content += '</div>';

    document.getElementById('keywords_preview_content').innerHTML = content;
    new bootstrap.Modal(document.getElementById('keywordsModal')).show();
}

// Collect all keywords
function collectAllKeywords() {
    const keywords = {};

    // Basic information
    keywords.nomor_sk_pokja = document.getElementById('nomor_sk_pokja')?.value || '';
    keywords.tanggal_sk_pokja = formatDateIndonesian(document.getElementById('tanggal_sk_pokja')?.value || '');
    keywords.kode_pokja = document.getElementById('kode_pokja')?.value || '';
    keywords.tahun_anggaran = document.getElementById('tahun_anggaran')?.value || '';
    keywords.kode_tender = document.getElementById('kode_tender')?.value || '';
    keywords.nama_paket = document.getElementById('nama_paket')?.value || '';
    keywords.klpd = document.getElementById('klpd')?.value || '';
    keywords.unit_organisasi = document.getElementById('unit_organisasi')?.value || '';
    keywords.balai = document.getElementById('balai')?.value || '';
    keywords.satuan_kerja = document.getElementById('satuan_kerja')?.value || '';
    keywords.kegiatan = document.getElementById('kegiatan')?.value || '';
    keywords.jenis_pengadaan = document.getElementById('jenis_pengadaan')?.value || '';
    keywords.metode_pengadaan = document.getElementById('metode_pengadaan')?.value || '';
    keywords.sumber_dana = document.getElementById('sumber_dana')?.value || '';

    // Pokja Pemilihan
    keywords.pokja_pemilihan = document.getElementById('pokja_pemilihan')?.value || '';

    // Values - dengan format rupiah dan terbilang
    const nilaiPagu = parseInt(document.getElementById('nilai_pagu')?.value || '0');
    const nilaiHps = parseInt(document.getElementById('nilai_hps')?.value || '0');
    keywords.nilai_pagu = formatCurrency(nilaiPagu);
    keywords.terbilang_pagu = document.getElementById('terbilang_pagu')?.value || (terbilang(nilaiPagu, false).trim() + ' rupiah');
    keywords.nilai_hps = formatCurrency(nilaiHps);
    keywords.terbilang_hps = document.getElementById('terbilang_hps')?.value || (terbilang(nilaiHps, false).trim() + ' rupiah');

    // POKJA members
    const ketuaData = document.getElementById('ketua_pokja')?.value || '';
    if (ketuaData) {
        try {
            const ketua = JSON.parse(ketuaData);
            keywords.ketua_pokja = ketua.nama || '';
            keywords.nip_ketua_pokja = ketua.nip || '';
            keywords.email_ketua_pokja = ketua.email || '';
        } catch (e) {
            keywords.ketua_pokja = '';
            keywords.nip_ketua_pokja = '';
            keywords.email_ketua_pokja = '';
        }
    }

    const sekreData = document.getElementById('sekre_pokja')?.value || '';
    if (sekreData) {
        try {
            const sekre = JSON.parse(sekreData);
            keywords.sekre_pokja = sekre.nama || '';
            keywords.nip_sekre_pokja = sekre.nip || '';
            keywords.email_sekre_pokja = sekre.email || '';
        } catch (e) {
            keywords.sekre_pokja = '';
            keywords.nip_sekre_pokja = '';
            keywords.email_sekre_pokja = '';
        }
    }

    // Anggota 3-5
    for (let i = 3; i <= 5; i++) {
        const selectId = `anggota${i}_select`;
        const anggotaData = document.getElementById(selectId)?.value || '';
        if (anggotaData) {
            try {
                const anggota = JSON.parse(anggotaData);
                keywords[`anggota${i}_pokja`] = anggota.nama || '';
                keywords[`nip_anggota${i}_pokja`] = anggota.nip || '';
                keywords[`email_anggota${i}_pokja`] = anggota.email || '';
            } catch (e) {
                keywords[`anggota${i}_pokja`] = '';
                keywords[`nip_anggota${i}_pokja`] = '';
                keywords[`email_anggota${i}_pokja`] = '';
            }
        } else {
            keywords[`anggota${i}_pokja`] = '';
            keywords[`nip_anggota${i}_pokja`] = '';
            keywords[`email_anggota${i}_pokja`] = '';
        }
    }

    // Pengalaman
    keywords.pengalaman_sejenis = document.getElementById('pengalaman_sejenis')?.value || '0';
    keywords.X_tahun_sejenis = document.getElementById('tahun_sejenis')?.value || '10';
    keywords.pengalaman_beda_jenis = document.getElementById('pengalaman_beda_jenis')?.value || '0';
    keywords.X_tahun_beda_jenis = document.getElementById('tahun_beda_jenis')?.value || '10';
    keywords.note_pengalaman = document.getElementById('note_pengalaman')?.value || '';

    return keywords;
}

// ===== SAVE/LOAD FUNCTIONS (Based on mature BA POKJA system) =====

// Get all form data
function getAllFormData() {
    const data = {};
    const form = document.getElementById('pembuktianForm');
    const elements = form.querySelectorAll('input, select, textarea');
    elements.forEach(el => {
        const key = el.name || el.id;
        if (!key) return;
        if (el.type === 'checkbox') {
            data[key] = el.checked;
        } else {
            data[key] = el.value;
        }
    });

    // Save POKJA selections (for restore)
    data.pokja_ketua_selection = document.getElementById('ketua_pokja')?.value || '';
    data.pokja_sekre_selection = document.getElementById('sekre_pokja')?.value || '';
    data.pokja_anggota3_selection = document.getElementById('anggota3_pokja')?.value || '';
    data.pokja_anggota4_selection = document.getElementById('anggota4_pokja')?.value || '';
    data.pokja_anggota5_selection = document.getElementById('anggota5_pokja')?.value || '';

    // Save companies with details
    data._companies = companiesWithDetails;

    // Save master folder path
    data._masterFolder = document.getElementById('masterFolderPath')?.value || '';

    // Metadata
    data._metadata = {
        company_count: companiesWithDetails ? companiesWithDetails.length : 0,
        has_master_folder: !!data._masterFolder
    };

    return data;
}

// Set all form data
function setAllFormData(data) {
    if (!data) return;

    // Set basic form fields
    Object.keys(data).forEach(key => {
        if (key.startsWith('_') || key.includes('_selection')) {
            return; // Skip metadata and selection fields
        }

        const element = document.querySelector(`[name="${key}"], #${key}`);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = data[key] === 'on' || data[key] === true;
            } else {
                element.value = data[key];
            }
        }
    });

    // Restore POKJA selections
    if (data.pokja_ketua_selection) {
        document.getElementById('ketua_pokja').value = data.pokja_ketua_selection;
    }
    if (data.pokja_sekre_selection) {
        document.getElementById('sekre_pokja').value = data.pokja_sekre_selection;
    }
    if (data.pokja_anggota3_selection !== undefined) {
        const el = document.getElementById('anggota3_pokja');
        if (el) el.value = data.pokja_anggota3_selection || '';
    }
    if (data.pokja_anggota4_selection !== undefined) {
        const el = document.getElementById('anggota4_pokja');
        if (el) el.value = data.pokja_anggota4_selection || '';
    }
    if (data.pokja_anggota5_selection !== undefined) {
        const el = document.getElementById('anggota5_pokja');
        if (el) el.value = data.pokja_anggota5_selection || '';
    }

    // Restore master folder
    if (data._masterFolder) {
        document.getElementById('masterFolderPath').value = data._masterFolder;
    }

    // Restore companies
    if (data._companies) {
        companiesWithDetails = data._companies;
        if (companiesWithDetails.length > 0) {
            generateCompanyDetailCards();

            // Restore KSO data including namaKSO and ksoText
            companiesWithDetails.forEach((company, index) => {
                // Restore nama_kso
                if (company.namaKSO) {
                    const namaKSOInput = document.getElementById(`nama_kso_${index}`);
                    if (namaKSOInput) {
                        namaKSOInput.value = company.namaKSO;
                    }
                }

                // Restore KSO text (textarea)
                if (company.ksoText) {
                    const ksoTextarea = document.getElementById(`kso_text_${index}`);
                    if (ksoTextarea) {
                        ksoTextarea.value = company.ksoText;
                        // Trigger update to refresh badge
                        updateKSOText(index, company.ksoText);
                    }
                }
            });

            document.getElementById('companyDetailsSection').style.display = 'block';
            document.getElementById('companyDetailsCount').textContent = companiesWithDetails.length;
        }
    }

    // Update UI
    updatePokjaTable();
    updatePengalamanSummary();
    updatePreview();
}

// Save to localStorage
function saveToLocal() {
    try {
        const data = getAllFormData();
        localStorage.setItem('ba_pembuktian_defaults', JSON.stringify(data));

        // Show success message with details
        let message = 'Data berhasil disimpan ke localStorage';
        if (data._metadata && data._metadata.company_count > 0) {
            message += ` (termasuk ${data._metadata.company_count} perusahaan)`;
        }
        showToast(message, 'success');

        // Update saved list
        updateSavedDefaultsList();
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        showToast('Gagal menyimpan data: ' + error.message, 'error');
    }
}

// Load from localStorage
function loadFromLocal() {
    try {
        const data = localStorage.getItem('ba_pembuktian_defaults');
        if (data) {
            const parsedData = JSON.parse(data);
            setAllFormData(parsedData);

            // Show success message with details
            let message = 'Data berhasil dimuat dari localStorage';
            if (parsedData._metadata && parsedData._metadata.company_count > 0) {
                message += ` (termasuk ${parsedData._metadata.company_count} perusahaan)`;
            }
            showToast(message, 'success');
        } else {
            showToast('Tidak ada data tersimpan di localStorage', 'warning');
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        showToast('Gagal memuat data: ' + error.message, 'error');
    }
}

// Export to JSON file
function exportDefaults() {
    try {
        const data = getAllFormData();
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `isian_Pembuktian_defaults_${timestamp}.json`;

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Show success message with details
        let message = 'Data berhasil diekspor ke file: ' + filename;
        if (data._metadata && data._metadata.company_count > 0) {
            message += ` (termasuk ${data._metadata.company_count} perusahaan)`;
        }
        showToast(message, 'success');
    } catch (error) {
        console.error('Error exporting defaults:', error);
        showToast('Gagal mengekspor data: ' + error.message, 'error');
    }
}

// Import from JSON file
function importDefaultsFromFile(file) {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json')) {
        showToast('File harus berformat JSON', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);
            setAllFormData(data);

            // Show success message with details
            let message = 'Data berhasil diimport dari file: ' + file.name;
            if (data._metadata && data._metadata.company_count > 0) {
                message += ` (termasuk ${data._metadata.company_count} perusahaan)`;
            }
            showToast(message, 'success');

            // Clear the file input
            document.getElementById('importDefaultsInput').value = '';
        } catch (error) {
            console.error('Error importing defaults:', error);
            showToast('Gagal mengimport data: File JSON tidak valid', 'error');
        }
    };
    reader.readAsText(file);
}

// Update saved defaults list
function updateSavedDefaultsList() {
    const select = document.querySelector('#savedDefaultsList');
    if (select) {
        // Clear existing options except the first one
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }

        // Add localStorage option if data exists
        const localData = localStorage.getItem('ba_pembuktian_defaults');
        if (localData) {
            const option = document.createElement('option');
            option.value = 'localStorage';
            option.textContent = 'Data localStorage (terbaru)';
            select.appendChild(option);
        }
    }
}

// Load selected default
function loadSelectedDefault() {
    const select = document.querySelector('#savedDefaultsList');
    if (select && select.value === 'localStorage') {
        loadFromLocal();
        select.value = ''; // Reset selection
    }
}

// ===== COMPANY MANAGEMENT FUNCTIONS =====
// Note: parsedCompanies and companiesWithDetails already declared in global variables section

// Parse company data from paste area
function parseCompanyData() {
    const pasteArea = document.getElementById('pasteArea');
    const text = pasteArea.value.trim();

    if (!text) {
        alert('⚠ Paste area kosong! Silakan paste data terlebih dahulu.');
        return;
    }

    // Get selected input mode
    const inputMode = document.querySelector('input[name="inputMode"]:checked').value;

    // Split by lines
    const lines = text.split('\n');
    const companies = [];
    let currentNo = 1;

    for (let line of lines) {
        // Skip empty lines
        if (!line.trim()) continue;

        // Skip lines with "Tambahan" only
        if (line.trim().toLowerCase() === 'tambahan') continue;

        let companyName = '';
        let extractedNo = currentNo;

        if (inputMode === 'spse') {
            // ===== MODE SPSE: Parse SPSE format with TAB/date/status =====
            // Example: "1	PT. TRIKON MITRA ABADI  	2 Oktober 2025		Kualifikasi"
            if (line.includes('\t') || /\s{2,}/.test(line)) {
                // Split by TAB or 2+ spaces, trim and filter empty
                const parts = line.split(/\t+|\s{2,}/).map(p => p.trim()).filter(p => p);

                if (parts.length >= 2) {
                    // First part: number
                    const potentialNo = parts[0];
                    const noMatch = potentialNo.match(/^\d+/);
                    if (noMatch) {
                        extractedNo = parseInt(noMatch[0]);
                        // Second part: company name (ignore the rest - date, status)
                        companyName = parts[1];
                    } else {
                        // If first part is not number, treat as company name
                        companyName = parts[0];
                    }
                } else if (parts.length === 1) {
                    companyName = parts[0];
                }
            } else {
                // Fallback: Simple line
                companyName = line.trim();
                extractedNo = currentNo;
            }
        } else {
            // ===== MODE MANUAL: Simple list (1 line = 1 company) =====
            // Just take the line as company name, ignore any numbers
            companyName = line.trim();

            // Remove leading number if exists (e.g., "1. PT. ABC" → "PT. ABC")
            companyName = companyName.replace(/^\d+[\.\)\s]+/, '').trim();

            extractedNo = currentNo;
        }

        // Skip if company name is empty or just "Tambahan"
        if (!companyName || companyName.toLowerCase() === 'tambahan') continue;

        // Clean up company name (remove extra spaces, normalize)
        companyName = companyName.replace(/\s+/g, ' ').trim();

        // Validate company name (at least 2 characters)
        if (companyName.length < 2) continue;

        companies.push({
            no: extractedNo,
            name: companyName,
            originalLine: line
        });

        currentNo = extractedNo + 1;
    }

    if (companies.length === 0) {
        const modeText = inputMode === 'spse'
            ? 'Mode SPSE: Paste data dari tabel SPSE (dengan TAB, date, status)'
            : 'Mode Manual: Tulis 1 nama perusahaan per baris';

        alert('⚠ Tidak ada data perusahaan yang berhasil di-extract!\n\n' + modeText);
        return;
    }

    // Store parsed data
    parsedCompanies = companies;

    // Display results
    displayParsedCompanies(companies);
}

// Display parsed companies
function displayParsedCompanies(companies) {
    const parsedResults = document.getElementById('parsedResults');
    const parsedCount = document.getElementById('parsedCount');
    const parsedList = document.getElementById('parsedCompanyList');

    // Update count
    parsedCount.textContent = companies.length;

    // Generate table rows
    let html = '';
    companies.forEach((company, index) => {
        html += `
                    <tr>
                        <td><strong>${company.no}</strong></td>
                        <td>${company.name}</td>
                        <td>
                            <button type="button" class="btn btn-sm btn-outline-danger" 
                                    onclick="removeCompany(${index})">
                                <i class="fas fa-times"></i>
                            </button>
                        </td>
                    </tr>
                `;
    });

    parsedList.innerHTML = html;
    parsedResults.style.display = 'block';
}

// Remove company from parsed list
function removeCompany(index) {
    parsedCompanies.splice(index, 1);

    if (parsedCompanies.length === 0) {
        document.getElementById('parsedResults').style.display = 'none';
        alert('ℹ Semua perusahaan telah dihapus. Silakan parse ulang data.');
    } else {
        displayParsedCompanies(parsedCompanies);
    }
}

// Proceed to company details form
function proceedToDetails() {
    if (parsedCompanies.length === 0) {
        alert('⚠ Tidak ada data perusahaan yang dipilih!');
        return;
    }

    // Initialize companies with details
    companiesWithDetails = parsedCompanies.map(company => ({
        no: company.no,
        name: company.name,
        namaKSO: '',  // Nama resmi KSO (berbeda dari lead firm/anggota)
        ksoText: ''   // Textarea untuk anggota KSO (1 baris = 1 anggota)
    }));

    // Generate company detail cards
    generateCompanyDetailCards();

    // Show company details section
    document.getElementById('companyDetailsSection').style.display = 'block';
    document.getElementById('companyDetailsCount').textContent = companiesWithDetails.length;

    // Update preview
    updatePreview();

    // Scroll to details section
    document.getElementById('companyDetailsSection').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Generate company detail cards
function generateCompanyDetailCards() {
    const container = document.getElementById('companyDetailsContainer');
    container.innerHTML = '';

    companiesWithDetails.forEach((company, index) => {
        const cardHtml = `
                    <div class="card shadow-sm mb-3" id="company_${index}">
                        <!-- Compact Header -->
                        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                            <h6 class="mb-0">
                                <i class="fas fa-building me-2"></i>${company.no}. ${company.name}
                            </h6>
                            <span class="badge bg-white text-primary" id="kso_badge_header_${index}">0 Anggota</span>
                        </div>

                        <div class="card-body">
                            <!-- Preview Buttons - Compact -->
                            <div class="mb-3">
                                <label class="small text-muted mb-1">
                                    <i class="fas fa-eye me-1"></i>Preview Dokumen:
                                </label>
                                <div class="btn-group w-100" role="group">
                                    <button type="button" class="btn btn-sm btn-outline-primary" onclick="previewPembuktianDoc(${index}, 'ba_pembuktian')">
                                        <i class="fas fa-file-word"></i> BA
                                    </button>
                                    <button type="button" class="btn btn-sm btn-outline-success" onclick="previewPembuktianDoc(${index}, 'excel_sejenis')">
                                        <i class="fas fa-file-excel"></i> Excel
                                    </button>
                                    <button type="button" class="btn btn-sm btn-outline-info" onclick="previewPembuktianDoc(${index}, 'daftar_hadir')">
                                        <i class="fas fa-file-word"></i> Daftar Hadir
                                    </button>
                                </div>
                            </div>

                            <!-- Nama KSO - Compact -->
                            <div class="mb-3">
                                <label class="form-label small">
                                    <i class="fas fa-building-flag me-1"></i>Nama KSO 
                                    <code class="text-muted ms-1">{nama_kso}</code>
                                </label>
                                <input type="text" class="form-control form-control-sm" id="nama_kso_${index}" 
                                       placeholder="Contoh: KSO PT. ABC - CV. DEF"
                                       oninput="updateKSONama(${index}, this.value)">
                            </div>

                            <!-- Anggota KSO - Compact & Clear -->
                            <div class="mb-2">
                                <label class="form-label small">
                                    <i class="fas fa-users me-1"></i>Anggota KSO (Opsional)
                                    <span class="badge bg-info ms-2" id="kso_badge_footer_${index}">0 Anggota</span>
                                </label>
                                <div class="alert alert-light py-2 mb-2 small">
                                    <i class="fas fa-info-circle me-1"></i>
                                    Lead firm: <strong>${company.name}</strong> (otomatis)<br>
                                    Tulis <strong>1 baris = 1 anggota</strong> selain lead firm
                                </div>
                                <textarea class="form-control form-control-sm" id="kso_text_${index}" rows="2"
                                          placeholder="Contoh:\nPT. Konstruksi Jaya\nCV. Mandiri"
                                          oninput="updateKSOText(${index}, this.value)"></textarea>
                            </div>
                        </div>
                    </div>
                `;
        container.insertAdjacentHTML('beforeend', cardHtml);
    });
}

// Update KSO Text (textarea untuk anggota KSO)
function updateKSOText(companyIndex, value) {
    companiesWithDetails[companyIndex].ksoText = value;

    // Parse lines to count anggota
    const lines = value.split('\n').filter(line => line.trim() !== '');
    const ksoCount = lines.length;

    // Update both badges (header and footer)
    const headerBadge = document.getElementById(`kso_badge_header_${companyIndex}`);
    const footerBadge = document.getElementById(`kso_badge_footer_${companyIndex}`);

    if (headerBadge) {
        headerBadge.textContent = `${ksoCount} Anggota`;
    }

    if (footerBadge) {
        footerBadge.textContent = `${ksoCount} Anggota`;
    }

    updatePreview();
}

// Update Nama KSO (nama resmi KSO yang berbeda dari anggota)
function updateKSONama(companyIndex, value) {
    companiesWithDetails[companyIndex].namaKSO = value;
    updatePreview();
}

// Clear paste area
function clearPasteArea() {
    document.getElementById('pasteArea').value = '';
    document.getElementById('parsedResults').style.display = 'none';
    parsedCompanies = [];
}

// Select master folder (Updated to match BA POKJA Konsultan logic)
async function selectMasterFolder() {
    const folderPath = prompt('Masukkan path folder master data:',
        '.\\Master Folder\\Master Pembuktian');

    if (!folderPath) return;

    document.getElementById('masterFolderPath').value = folderPath;

    // Auto-validate folder immediately
    showToast('Memvalidasi folder...', 'info');

    try {
        const response = await fetch('/api/validate_master_pembuktian', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ folder_path: folderPath })
        });

        const data = await response.json();

        if (data.success) {
            showValidationResults(data);
            updateValidationBadge(data);
            showToast(`${data.files.filter(f => f.found).length}/${data.files.length} dokumen ditemukan`, 'success');
        } else {
            showValidationError(data.error || 'Gagal memvalidasi folder');
            showToast('Gagal memvalidasi folder: ' + (data.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        showValidationError('Error: ' + error.message);
        showToast('Error: ' + error.message, 'error');
    }
}

// Update validation badge status (like BA POKJA Konsultan)
function updateValidationBadge(data) {
    const validationStatusBadge = document.getElementById('validationStatus');
    const documentCount = document.getElementById('documentCount');

    const foundFiles = data.files.filter(f => f.found).length;
    const totalFiles = data.files.length;

    // Update document count
    documentCount.textContent = `${foundFiles}/${totalFiles} dokumen`;

    // Update badge style
    if (foundFiles === totalFiles) {
        validationStatusBadge.className = 'badge bg-success me-2';
        validationStatusBadge.textContent = 'Lengkap';
        masterFolderValidated = true;
    } else if (foundFiles > 0) {
        validationStatusBadge.className = 'badge bg-warning me-2';
        validationStatusBadge.textContent = 'Sebagian';
        masterFolderValidated = false;
    } else {
        validationStatusBadge.className = 'badge bg-danger me-2';
        validationStatusBadge.textContent = 'Kosong';
        masterFolderValidated = false;
    }
}

// Show validation results (Updated to hide alert box, show only badge & file list)
function showValidationResults(data) {
    const fileListSection = document.getElementById('fileListSection');
    const fileList = document.getElementById('fileList');

    const allValid = data.files.every(f => f.found);
    masterFolderValidated = allValid;

    // Show file list
    fileListSection.style.display = 'block';
    fileList.innerHTML = '';

    data.files.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = `list-group-item file-item ${file.found ? 'valid' : 'missing'}`;

        const icon = file.found ? 'fa-check-circle' : 'fa-times-circle';
        const statusBadge = file.found
            ? '<span class="validation-badge bg-success text-white">✓ Ditemukan</span>'
            : '<span class="validation-badge bg-danger text-white">✗ Tidak Ditemukan</span>';

        fileItem.innerHTML = `
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="d-flex align-items-start">
                            <i class="fas ${icon} icon-status me-3 mt-1"></i>
                            <div>
                                <h6 class="mb-1">${file.name}</h6>
                                <small class="text-muted">${file.description}</small>
                            </div>
                        </div>
                        ${statusBadge}
                    </div>
                `;

        fileList.appendChild(fileItem);
    });
}

// Show validation error (Updated to use badge only)
function showValidationError(message) {
    const validationStatusBadge = document.getElementById('validationStatus');
    const documentCount = document.getElementById('documentCount');

    // Update badge to error state
    validationStatusBadge.className = 'badge bg-danger me-2';
    validationStatusBadge.textContent = 'Error';

    // Reset document count
    documentCount.textContent = '0/3 dokumen';

    masterFolderValidated = false;

    // Hide file list section
    document.getElementById('fileListSection').style.display = 'none';
}

// Update pengalaman summary
function updatePengalamanSummary() {
    const sejenis = parseInt(document.getElementById('pengalaman_sejenis').value) || 0;
    const tahunSejenis = parseInt(document.getElementById('tahun_sejenis').value) || 10;
    const bedaJenis = parseInt(document.getElementById('pengalaman_beda_jenis').value) || 0;
    const tahunBedaJenis = parseInt(document.getElementById('tahun_beda_jenis').value) || 10;

    const summary = `<strong>${sejenis}</strong> pengalaman sejenis dalam <strong>${tahunSejenis}</strong> tahun + <strong>${bedaJenis}</strong> pengalaman beda jenis dalam <strong>${tahunBedaJenis}</strong> tahun`;

    document.getElementById('pengalamanSummary').innerHTML = summary;
    updatePreview();
}

// Update folder preview
function updatePreview() {
    let preview = `📁 Output Pembuktian/\n`;

    if (companiesWithDetails.length === 0) {
        preview += `└── (Belum ada perusahaan yang di-extract)\n`;
    } else {
        companiesWithDetails.forEach((company, index) => {
            const isLast = index === companiesWithDetails.length - 1;
            const prefix = isLast ? '└──' : '├──';
            const subPrefix = isLast ? '    ' : '│   ';

            // Format nomor dengan leading zero (01, 02, 03, dst)
            const formattedNo = String(company.no).padStart(2, '0');

            // Folder name dengan format: 01- PT. Name, 02- CV. Name
            preview += `${prefix} 📁 ${formattedNo}- ${company.name}\n`;

            // Show 3 master files
            preview += `${subPrefix}├── 📄 09.${formattedNo}-1-BA Pembuktian.docx\n`;
            preview += `${subPrefix}├── 📊 09.${formattedNo}-2-Lamp Kerja Sejenis.xlsx\n`;
            preview += `${subPrefix}└── 📄 09.${formattedNo}-3-Daftar Hadir Pembuktian.docx\n`;
        });
    }

    document.getElementById('folderPreview').textContent = preview;
}

// ===== EVENT LISTENERS =====

// Toggle input mode (SPSE vs Manual)
function toggleInputMode() {
    const mode = document.querySelector('input[name="inputMode"]:checked').value;
    const pasteAreaLabel = document.getElementById('pasteAreaLabel');
    const pasteArea = document.getElementById('pasteArea');
    const spseModeInfo = document.getElementById('spseModeInfo');
    const manualModeInfo = document.getElementById('manualModeInfo');

    if (mode === 'spse') {
        // SPSE Mode
        pasteAreaLabel.innerHTML = '<i class="fas fa-paste me-2"></i>Paste Data dari SPSE';
        pasteArea.placeholder = 'Paste data dari SPSE di sini...\n\nContoh:\n1\tPT. TRIKON MITRA ABADI  \t2 Oktober 2025\t\tKualifikasi\n2\tPT. BERMUDA KONSULTAN  \t30 September 2025\t\tKualifikasi\n3\tPT GLOBAL PROFEX SYNERGY  \t1 Oktober 2025\t\tKualifikasi';
        spseModeInfo.style.display = 'block';
        manualModeInfo.style.display = 'none';
    } else {
        // Manual Mode
        pasteAreaLabel.innerHTML = '<i class="fas fa-keyboard me-2"></i>Nama Perusahaan (1 Baris = 1 Perusahaan)';
        pasteArea.placeholder = 'Tulis nama perusahaan per baris...\n\nContoh:\nPT. TRIKON MITRA ABADI\nPT. BERMUDA KONSULTAN\nCV. KARYA MANDIRI\nPT GLOBAL PROFEX SYNERGY';
        spseModeInfo.style.display = 'none';
        manualModeInfo.style.display = 'block';
    }
}

// Auto-update Nama Pokja Pemilihan
function updatePokjaPemilihan() {
    const kodePokja = document.getElementById('kode_pokja')?.value || '';
    const tahunAnggaran = document.getElementById('tahun_anggaran')?.value || '';
    const pokjaPemilihanField = document.getElementById('pokja_pemilihan');

    if (kodePokja && tahunAnggaran) {
        pokjaPemilihanField.value = `Kelompok Kerja Pemilihan ${kodePokja} BP2JK Wilayah Kalimantan Selatan Tahun Anggaran ${tahunAnggaran}`;
    } else {
        pokjaPemilihanField.value = '';
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function () {
    // Load POKJA members from CSV first
    loadPokjaMembers();

    // Load saved defaults list (unified system)
    updateSavedDefaultsList();

    // Input mode toggle
    document.querySelectorAll('input[name="inputMode"]').forEach(radio => {
        radio.addEventListener('change', toggleInputMode);
    });

    // Auto-update Pokja Pemilihan
    document.getElementById('kode_pokja')?.addEventListener('input', updatePokjaPemilihan);
    document.getElementById('tahun_anggaran')?.addEventListener('input', updatePokjaPemilihan);

    // Pengalaman inputs
    document.getElementById('pengalaman_sejenis').addEventListener('input', updatePengalamanSummary);
    document.getElementById('tahun_sejenis').addEventListener('input', updatePengalamanSummary);
    document.getElementById('pengalaman_beda_jenis').addEventListener('input', updatePengalamanSummary);
    document.getElementById('tahun_beda_jenis').addEventListener('input', updatePengalamanSummary);

    // Initial preview
    updatePreview();
    updatePengalamanSummary();
    updatePokjaPemilihan();  // Initial update
});

// Handle form submission
document.getElementById('pembuktianForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const masterFolder = document.getElementById('masterFolderPath').value;
    const sejenis = parseInt(document.getElementById('pengalaman_sejenis').value) || 0;
    const tahunSejenis = parseInt(document.getElementById('tahun_sejenis').value) || 10;
    const bedaJenis = parseInt(document.getElementById('pengalaman_beda_jenis').value) || 0;
    const tahunBedaJenis = parseInt(document.getElementById('tahun_beda_jenis').value) || 10;

    // Validation
    if (companiesWithDetails.length === 0) {
        alert('❌ Belum ada perusahaan yang di-extract!\n\nSilakan paste dan extract data perusahaan terlebih dahulu.');
        return;
    }

    if (!masterFolder) {
        alert('❌ Folder master data harus dipilih!');
        return;
    }

    if (!masterFolderValidated) {
        alert('❌ Folder master data belum divalidasi atau tidak lengkap!\n\nPastikan folder berisi 3 file:\n- 09.no-1-BA Pembuktian.docx\n- 09.no-3-Lamp Kerja Sejenis.xlsx\n- 09.no-4-Daftar Hadir Pembuktian.docx');
        return;
    }

    // Collect keywords
    const keywords = collectAllKeywords();

    // Prepare data for backend
    const formData = {
        companies: companiesWithDetails.map(company => {
            // Parse KSO text into array (1 line = 1 anggota)
            const ksoLines = (company.ksoText || '').split('\n')
                .map(line => line.trim())
                .filter(line => line !== '');

            return {
                no: company.no,
                name: company.name,
                namaKSO: company.namaKSO || '',  // Nama resmi KSO
                kso: ksoLines  // Array of KSO members
            };
        }),
        pengalaman: {
            sejenis: sejenis,
            tahun_sejenis: tahunSejenis,
            beda_jenis: bedaJenis,
            tahun_beda_jenis: tahunBedaJenis
        },
        keywords: keywords,  // Add keywords to backend payload
        master_folder: masterFolder
    };

    console.log('Form Data:', formData);

    // Show loading overlay
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('show');
    }

    // Show loading state on button
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sedang Memproses...';

    try {
        // Send to backend for processing
        const response = await fetch('/api/generate_pembuktian_folders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            // Try to get error details
            let errorText = '';
            try { errorText = await response.text(); } catch (e) { /* ignore */ }
            throw new Error(errorText || `HTTP ${response.status}`);
        }

        const result = await response.json();

        // Hide loading overlay
        if (loadingOverlay) {
            loadingOverlay.classList.remove('show');
        }

        if (result.success) {
            // Show detailed results modal
            showResults(result);
        } else {
            alert(`❌ Error: ${result.error || 'Gagal memproses data'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        // Provide clearer message for network and CORS issues
        const msg = (error && error.message === 'Failed to fetch')
            ? 'Koneksi ke server gagal (Failed to fetch). Pastikan server berjalan di http://localhost:5001 dan tidak diblokir firewall.'
            : ('❌ Terjadi kesalahan saat memproses data!\n\n' + (error?.message || 'Unknown error'));
        alert(msg);

        // Hide loading overlay
        if (loadingOverlay) {
            loadingOverlay.classList.remove('show');
        }
    } finally {
        // Restore button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
});

// Show toast notification
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '3000';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toastId = 'toast_' + Date.now();
    const toastHtml = `
                <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="true" data-bs-delay="4000">
                    <div class="toast-header bg-${type === 'error' ? 'danger' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'primary'} text-white">
                        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
                        <strong class="me-auto">
                            ${type === 'error' ? 'Error' : type === 'success' ? 'Berhasil' : type === 'warning' ? 'Peringatan' : 'Info'}
                        </strong>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
                    </div>
                    <div class="toast-body">
                        ${message}
                    </div>
                </div>
            `;

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);

    // Show toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();

    // Remove toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function () {
        toastElement.remove();
    });
}

// ===== RESULTS DISPLAY FUNCTION =====
function showResults(data) {
    let content = '<div class="results-content">';

    // Success summary header
    if (data.message) {
        content += `
                    <div class="alert alert-success mb-4">
                        <h5 class="alert-heading"><i class="fas fa-check-circle me-2"></i>Pemrosesan Selesai!</h5>
                        <p class="mb-0">${data.message}</p>
                    </div>
                `;
    }

    // Process files information
    if (data.files && data.files.length > 0) {
        content += '<h5 class="mb-3"><i class="fas fa-folder-open me-2"></i>Folder & Dokumen yang Diproses:</h5>';

        data.files.forEach(file => {
            content += `
                        <div class="card mb-3">
                            <div class="card-header bg-success text-white">
                                <h6 class="mb-0">
                                    <i class="fas fa-file-excel me-2"></i>
                                    ${file.filename || 'File Processed'}
                                </h6>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <strong>Total Replacements: ${file.replacements || 0}</strong>
                                    </div>
                                    <div class="col-md-6 text-end">
                                        <small class="text-muted">Processed successfully</small>
                                    </div>
                                </div>
                    `;

            // Show keyword details if available
            if (file.keyword_details && Object.keys(file.keyword_details).length > 0) {
                content += `
                            <div class="mt-3">
                                <h6>Detail Keywords yang Diganti:</h6>
                                <div class="table-responsive">
                                    <table class="table table-sm table-striped">
                                        <thead class="table-dark">
                                            <tr>
                                                <th width="30%">Keyword</th>
                                                <th width="50%">Value yang Diganti</th>
                                                <th width="20%" class="text-center">Jumlah Replace</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                        `;

                // Sort keywords by replacement count (descending)
                const sortedKeywords = Object.entries(file.keyword_details).sort((a, b) => b[1].count - a[1].count);

                sortedKeywords.forEach(([keyword, details]) => {
                    const displayValue = details.value || '<em class="text-muted">kosong</em>';
                    const badgeColor = details.count > 10 ? 'bg-danger' : details.count > 5 ? 'bg-warning' : 'bg-primary';

                    content += `
                                <tr>
                                    <td><code class="text-primary">{${keyword}}</code></td>
                                    <td>
                                        <span class="fw-semibold">"${displayValue}"</span>
                                        <br><small class="text-muted">Diganti dari placeholder keyword</small>
                                    </td>
                                    <td class="text-center">
                                        <span class="badge ${badgeColor} fs-6">${details.count}x</span>
                                    </td>
                                </tr>
                            `;
                });

                content += `
                                        </tbody>
                                    </table>
                                </div>
                                
                                <!-- Summary Stats -->
                                <div class="mt-3 p-3 bg-light rounded">
                                    <div class="row text-center">
                                        <div class="col-md-4">
                                            <div class="border-end">
                                                <h5 class="text-primary mb-1">${Object.keys(file.keyword_details).length}</h5>
                                                <small class="text-muted">Total Keywords</small>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="border-end">
                                                <h5 class="text-success mb-1">${file.replacements}</h5>
                                                <small class="text-muted">Total Replacements</small>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <h5 class="text-info mb-1">${Math.round(file.replacements / Object.keys(file.keyword_details).length * 100) / 100}</h5>
                                            <small class="text-muted">Avg per Keyword</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
            }

            content += `
                            </div>
                        </div>
                    `;
        });

        // Download button
        if (data.download_url) {
            content += `
                        <div class="mt-4 text-center">
                            <a href="${data.download_url}" class="btn btn-success btn-lg">
                                <i class="fas fa-download me-2"></i>Download Semua Hasil (ZIP)
                            </a>
                        </div>
                    `;
        }
    }

    // Company summary
    if (data.companies_processed) {
        content += `
                    <div class="alert alert-info mt-4">
                        <h6><i class="fas fa-building me-2"></i>Ringkasan Pemrosesan:</h6>
                        <ul class="mb-0">
                            <li><strong>${data.companies_processed}</strong> folder perusahaan dibuat</li>
                            <li>Setiap folder berisi <strong>3 dokumen master</strong></li>
                            <li>Excel auto-generated dengan <strong>${data.pengalaman?.sejenis || 0} rows sejenis</strong> dan <strong>${data.pengalaman?.beda_jenis || 0} rows beda jenis</strong></li>
                        </ul>
                    </div>
                `;
    }

    // Failed files (if any)
    if (data.failed_files && data.failed_files.length > 0) {
        content += '<h5 class="mt-4 text-danger"><i class="fas fa-exclamation-triangle me-2"></i>File yang Gagal Diproses:</h5>';

        data.failed_files.forEach(file => {
            content += `
                        <div class="card mb-2 border-danger">
                            <div class="card-header bg-danger text-white">
                                <h6 class="mb-0">
                                    <i class="fas fa-exclamation-triangle me-2"></i>
                                    ${file.filename}
                                </h6>
                            </div>
                            <div class="card-body">
                                <div class="alert alert-danger mb-0">
                                    <strong>Error:</strong> ${file.error}
                                </div>
                            </div>
                        </div>
                    `;
        });
    }

    content += '</div>';

    // Show modal
    document.getElementById('results_content').innerHTML = content;
    new bootstrap.Modal(document.getElementById('resultsModal')).show();
}

// Preview Pembuktian Document
async function previewPembuktianDoc(companyIndex, docType) {
    const masterFolder = document.getElementById('masterFolderPath').value;

    if (!masterFolder) {
        showToast('Pilih dan validasi master folder terlebih dahulu', 'warning');
        return;
    }

    const company = companiesWithDetails[companyIndex];
    if (!company) {
        showToast('Data perusahaan tidak ditemukan', 'error');
        return;
    }

    // Determine file to preview
    let docCode, docTitle, isExcel = false, filePath;
    if (docType === 'ba_pembuktian') {
        docCode = '09.no-1-BA Pembuktian';
        docTitle = 'BA Pembuktian';
    } else if (docType === 'excel_sejenis') {
        isExcel = true;
        docTitle = 'Lampiran Kerja Sejenis';
        // Path to Excel in Master Pembuktian folder
        filePath = `${masterFolder}/09.no-3-Lamp Kerja Sejenis.xlsx`;
    } else if (docType === 'daftar_hadir') {
        docCode = '09.no-4-Daftar Hadir Pembuktian';
        docTitle = 'Daftar Hadir Pembuktian';
    }

    // Collect keywords
    const keywords = collectAllKeywordsPembuktian(company, companyIndex);

    // Show modal and loading
    const modal = new bootstrap.Modal(document.getElementById('previewModalPembuktian'));
    modal.show();

    document.getElementById('previewTitlePembuktian').textContent = `${docTitle} - ${company.name}`;
    document.getElementById('previewLoadingPembuktian').style.display = 'block';
    document.getElementById('previewContentPembuktian').style.display = 'none';
    document.getElementById('previewWarningsPembuktian').style.display = 'none';
    document.getElementById('previewPlaceholdersPembuktian').style.display = 'none';

    try {
        // Prepare request body based on file type
        let requestBody;
        if (isExcel) {
            // Parse ksoText to extract anggota KSO
            const ksoLines = (company.ksoText || '').split('\n').filter(line => line.trim() !== '');
            const kso_anggota2 = ksoLines[0] || '';  // Baris 1
            const kso_anggota3 = ksoLines[1] || '';  // Baris 2

            console.log('[DEBUG] Preview Excel - KSO Data:');
            console.log('  ksoText:', company.ksoText);
            console.log('  kso_anggota2:', kso_anggota2);
            console.log('  kso_anggota3:', kso_anggota3);

            // For Excel: send company_data and pengalaman_data for full processing
            requestBody = {
                file_path: filePath,
                keywords: keywords,
                company_data: {
                    no: companyIndex + 1,
                    leadfirm: company.name,
                    nama_kso: company.namaKSO || '',
                    kso_anggota2: kso_anggota2,
                    kso_anggota3: kso_anggota3
                },
                pengalaman_data: {
                    sejenis: parseInt(document.getElementById('pengalaman_sejenis')?.value) || 7,
                    tahun_sejenis: parseInt(document.getElementById('tahun_sejenis')?.value) || 10,
                    beda_jenis: parseInt(document.getElementById('pengalaman_beda_jenis')?.value) || 4,
                    tahun_beda_jenis: parseInt(document.getElementById('tahun_beda_jenis')?.value) || 4
                }
            };
        } else {
            // For Word: only keywords needed
            requestBody = {
                doc_code: docCode,
                keywords: keywords,
                master_folder: masterFolder
            };
        }

        // Route to appropriate endpoint
        const endpoint = isExcel ? '/api/preview_excel' : '/api/preview_document';

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        document.getElementById('previewLoadingPembuktian').style.display = 'none';

        if (data.success) {
            document.getElementById('previewContentPembuktian').innerHTML = data.html;
            document.getElementById('previewContentPembuktian').style.display = 'block';

            // Handle warnings (Word documents only)
            if (data.warnings) {
                const importantWarnings = data.warnings.filter(w =>
                    !w.includes('Unrecognised paragraph style') &&
                    !w.includes('Unrecognised character style')
                );

                if (importantWarnings.length > 0) {
                    const warningsHtml = importantWarnings.map(w =>
                        `<div class="alert alert-warning py-1 px-2 mb-1 small">${w}</div>`
                    ).join('');
                    document.getElementById('previewWarningsPembuktian').innerHTML = warningsHtml;
                    document.getElementById('previewWarningsPembuktian').style.display = 'block';
                }
            }

            if (data.remaining_placeholders && data.remaining_placeholders.length > 0) {
                const placeholdersHtml = data.remaining_placeholders.map(p =>
                    `<span class="badge bg-warning text-dark me-1 mb-1">{${p}}</span>`
                ).join('');
                document.getElementById('previewPlaceholdersPembuktian').innerHTML =
                    `<strong>Placeholder belum terisi:</strong><br>${placeholdersHtml}`;
                document.getElementById('previewPlaceholdersPembuktian').style.display = 'block';
            }
        } else {
            let errorHtml = `<div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle me-2"></i>${data.error || 'Gagal memuat preview'}
                    </div>`;

            // Show traceback for debugging
            if (data.traceback) {
                errorHtml += `<details class="mt-2">
                            <summary class="text-muted small">Debug Info</summary>
                            <pre class="bg-light p-2 mt-2 small">${data.traceback}</pre>
                        </details>`;
            }

            document.getElementById('previewContentPembuktian').innerHTML = errorHtml;
            document.getElementById('previewContentPembuktian').style.display = 'block';
        }
    } catch (error) {
        console.error('Error previewing document:', error);
        document.getElementById('previewLoadingPembuktian').style.display = 'none';
        document.getElementById('previewContentPembuktian').innerHTML =
            `<div class="alert alert-danger"><i class="fas fa-exclamation-triangle me-2"></i>Error: ${error.message}</div>`;
        document.getElementById('previewContentPembuktian').style.display = 'block';
    }
}

// Helper function to format currency for preview/generate
function formatCurrencyJS(amount) {
    if (!amount || amount === 0) {
        return 'Rp0,00';
    }
    const numAmount = parseInt(amount);
    return 'Rp' + numAmount.toLocaleString('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Collect all keywords for pembuktian preview
function collectAllKeywordsPembuktian(company, companyIndex) {
    const keywords = {};

    // Get global keywords from form
    const formData = new FormData(document.getElementById('pembuktianForm'));
    for (let [key, value] of formData.entries()) {
        keywords[key] = value;
    }

    // Format nilai_pagu and nilai_hps to Rupiah with ,00
    if (keywords['nilai_pagu']) {
        keywords['nilai_pagu'] = formatCurrencyJS(keywords['nilai_pagu']);
    }
    if (keywords['nilai_hps']) {
        keywords['nilai_hps'] = formatCurrencyJS(keywords['nilai_hps']);
    }

    // Add company-specific keywords
    const formattedNo = String(company.no).padStart(2, '0');
    keywords['no'] = formattedNo;
    keywords['nama_kso'] = company.namaKSO || '';
    keywords['leadfirm'] = company.name;

    // Parse KSO members
    const ksoLines = (company.ksoText || '').split('\n').filter(line => line.trim() !== '');
    keywords['kso_anggota2'] = ksoLines[0] || '';
    keywords['kso_anggota3'] = ksoLines[1] || '';
    keywords['kso_anggota4'] = ksoLines[2] || '';
    keywords['kso_anggota5'] = ksoLines[3] || '';

    return keywords;
}

// ===== END OF SCRIPT =====