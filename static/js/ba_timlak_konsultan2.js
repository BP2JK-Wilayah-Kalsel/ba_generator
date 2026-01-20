let customVariableCount = 0;

// Indonesian day and month names
const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

// Initialize form
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMContentLoaded - Initializing BA TIMLAK app...');
    // Load members from CSV
    loadMembersFromCSV();

    // Auto-fill default values
    updateDefaultValues();
    console.log('DOMContentLoaded - Initialization complete');

    // Add event listeners
    document.getElementById('kode_pokja').addEventListener('input', updateDefaultValues);
    document.getElementById('tahun_anggaran').addEventListener('input', updateDefaultValues);
    const tglSk = document.getElementById('tanggal_sk_pokja');
    if (tglSk) tglSk.addEventListener('change', updateDefaultValues);
});

// Global variables for members
let pokjaMembers = [];
let timlakMembers = [];



// Load members from CSV
async function loadMembersFromCSV() {
    try {
        const response = await fetch('/static/pokja_members.csv');
        if (!response.ok) {
            throw new Error('Failed to load CSV');
        }
        const csvText = await response.text();
        const lines = csvText.split('\n').filter(line => line.trim());

        // Skip header
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Parse CSV line (handle quoted fields)
            const fields = [];
            let current = '';
            let inQuotes = false;

            for (let char of line) {
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    fields.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            fields.push(current.trim());

            if (fields.length >= 4) {
                const member = {
                    nama: fields[0].replace(/^"|"$/g, ''),
                    nip: fields[1].replace(/^"|"$/g, ''),
                    email: fields[2].replace(/^"|"$/g, ''),
                    group: fields[3].replace(/^"|"$/g, '').toLowerCase()
                };

                if (member.group === 'pokja') {
                    pokjaMembers.push(member);
                } else if (member.group === 'timlak') {
                    timlakMembers.push(member);
                }
            }
        }

        // Initialize selectors after loading
        console.log(`✅ CSV loaded: ${pokjaMembers.length} POKJA members, ${timlakMembers.length} TIMLAK members`);
        initializePokjaSelectors();
        initializeTimlakSelectors();
        initializePokjaTable();
        initializeTimlakTable();



    } catch (error) {
        console.error('❌ Error loading CSV:', error);
        console.log('📋 Using empty lists as fallback');
        // Fallback to empty lists if CSV fails
        pokjaMembers = [];
        timlakMembers = [];
        initializePokjaSelectors();
        initializeTimlakSelectors();
        initializePokjaTable();
        initializeTimlakTable();
    }
}

// Update default values
function updateDefaultValues() {
    const kodePokja = document.getElementById('kode_pokja').value;
    // Ambil tahun dari tanggal_sk_pokja jika ada, jika tidak pakai tahun berjalan
    let tahun = '';
    const tglSkEl = document.getElementById('tanggal_sk_pokja');
    if (tglSkEl && tglSkEl.value) {
        const d = new Date(tglSkEl.value);
        if (!isNaN(d.getTime())) tahun = d.getFullYear().toString();
    }
    if (!tahun) tahun = new Date().getFullYear().toString();

    // Update TIMLAK document table placeholders
    if (kodePokja && tahun) {
        // Update TIMLAK documents
        const timlakDocs = ['DH', '01', '02', '03', '04', '05', '06', '07', '08'];
        timlakDocs.forEach(num => {
            const input = document.querySelector(`input[name="nomor_timlak_${num}"]`);
            if (input && input.placeholder) {
                // Keep existing placeholder pattern
                input.placeholder = input.placeholder.replace(/{kode_pokja}/g, kodePokja).replace(/{tahun}/g, tahun);
            }
        });
    }
}

// Initialize POKJA selectors with CSV members
function initializePokjaSelectors() {
    const ketuaSelect = document.getElementById('ketua_pokja');
    const sekreSelect = document.getElementById('sekre_pokja');
    const anggota3 = document.getElementById('anggota3_select');
    const anggota4 = document.getElementById('anggota4_select');
    const anggota5 = document.getElementById('anggota5_select');

    // Clear existing options
    ketuaSelect.innerHTML = '<option value="">-- Pilih Ketua --</option>';
    sekreSelect.innerHTML = '<option value="">-- Pilih Sekretaris --</option>';
    anggota3.innerHTML = '<option value="">-- Pilih Anggota 3 --</option>';
    anggota4.innerHTML = '<option value="">-- Pilih Anggota 4 --</option>';
    anggota5.innerHTML = '<option value="">-- Pilih Anggota 5 --</option>';

    // Populate with POKJA members
    pokjaMembers.forEach((member) => {
        const value = JSON.stringify(member);

        // Add to all selects
        [ketuaSelect, sekreSelect, anggota3, anggota4, anggota5].forEach(select => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = member.nama;
            select.appendChild(option);
        });
    });

    // Attach change listeners for table update
    ketuaSelect.addEventListener('change', updatePokjaTable);
    sekreSelect.addEventListener('change', updatePokjaTable);
    anggota3.addEventListener('change', updatePokjaTable);
    anggota4.addEventListener('change', updatePokjaTable);
    anggota5.addEventListener('change', updatePokjaTable);
}

// Initialize TIMLAK selectors with CSV members
function initializeTimlakSelectors() {
    const ketuaSelect = document.getElementById('ketua_timlak');
    const sekreSelect = document.getElementById('sekre_timlak');
    const anggotaSelect = document.getElementById('anggota_timlak');

    if (!ketuaSelect || !sekreSelect || !anggotaSelect) {
        console.error('TIMLAK selectors not found');
        return;
    }

    // Clear existing options
    ketuaSelect.innerHTML = '<option value="">-- Pilih Ketua TIMLAK --</option>';
    sekreSelect.innerHTML = '<option value="">-- Pilih Sekretaris TIMLAK --</option>';
    anggotaSelect.innerHTML = '<option value="">-- Pilih Anggota TIMLAK --</option>';

    // Populate with TIMLAK members
    timlakMembers.forEach((member) => {
        const value = JSON.stringify(member);

        // Add to all selects
        [ketuaSelect, sekreSelect, anggotaSelect].forEach(select => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = member.nama;
            select.appendChild(option);
        });
    });

    // Attach change listeners for table update
    ketuaSelect.addEventListener('change', updateTimlakTable);
    sekreSelect.addEventListener('change', updateTimlakTable);
    anggotaSelect.addEventListener('change', updateTimlakTable);
}

// Initialize empty POKJA table
function initializePokjaTable() {
    const tableBody = document.getElementById('pokja_members_table');
    tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">
                        <i class="fas fa-users fa-2x mb-2 d-block"></i>
                        Pilih Ketua, Sekretaris, dan Anggota untuk menampilkan tabel
                    </td>
                </tr>
            `;
}

// Update POKJA table based on role selections
function updatePokjaTable() {
    const ketuaValue = document.getElementById('ketua_pokja').value;
    const sekreValue = document.getElementById('sekre_pokja').value;
    const anggotaValues = [
        document.getElementById('anggota3_select').value,
        document.getElementById('anggota4_select').value,
        document.getElementById('anggota5_select').value
    ].filter(Boolean);

    const tableBody = document.getElementById('pokja_members_table');
    let tableHTML = '';
    let memberCount = 1;
    let anggotaIndex = 3; // ensure consecutive anggota keys

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

    // Add Anggota
    anggotaValues.forEach((anggotaValue) => {
        if (anggotaValue !== ketuaValue && anggotaValue !== sekreValue) {
            try {
                const anggota = JSON.parse(anggotaValue);
                tableHTML += createPokjaTableRow(memberCount++, `Anggota ${anggotaIndex - 2}`, anggota, `anggota${anggotaIndex}`, anggotaValue);
                anggotaIndex++;
            } catch (e) {
                console.error('Error parsing anggota data:', e);
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
    const badgeClass = role === 'Ketua' ? 'bg-primary' : role === 'Sekretaris' ? 'bg-success' : 'bg-info';

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
                        <button type="button" class="btn btn-outline-danger btn-sm" onclick="removePokjaMemberFromRole('${roleKey}', '${encodeURIComponent(memberValue || '')}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </td>
                </tr>
            `;
}

// Remove member from specific role
function removePokjaMemberFromRole(roleKey, encodedValue = '') {
    if (roleKey === 'ketua') {
        document.getElementById('ketua_pokja').value = '';
    } else if (roleKey === 'sekre') {
        document.getElementById('sekre_pokja').value = '';
    } else if (roleKey === 'anggota3') {
        document.getElementById('anggota3_select').value = '';
    } else if (roleKey === 'anggota4') {
        document.getElementById('anggota4_select').value = '';
    } else if (roleKey === 'anggota5') {
        document.getElementById('anggota5_select').value = '';
    }
    updatePokjaTable();
}

// ===== TIMLAK FUNCTIONS =====

// Initialize empty TIMLAK table
function initializeTimlakTable() {
    const tableBody = document.getElementById('timlak_members_table');
    if (!tableBody) return;

    tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">
                        <i class="fas fa-user-check fa-2x mb-2 d-block"></i>
                        Pilih Ketua, Sekretaris, dan Anggota TIMLAK untuk menampilkan tabel
                    </td>
                </tr>
            `;
}



// Update TIMLAK table based on role selections
function updateTimlakTable() {
    const ketuaValue = document.getElementById('ketua_timlak').value;
    const sekreValue = document.getElementById('sekre_timlak').value;
    const anggotaValue = document.getElementById('anggota_timlak').value;

    const tableBody = document.getElementById('timlak_members_table');
    if (!tableBody) return;

    let tableHTML = '';
    let memberCount = 1;

    // Add Ketua
    if (ketuaValue) {
        try {
            const ketua = JSON.parse(ketuaValue);
            tableHTML += createTimlakTableRow(memberCount++, 'Ketua', ketua, 'ketua', ketuaValue);
        } catch (e) {
            console.error('Error parsing ketua TIMLAK data:', e);
        }
    }

    // Add Sekretaris
    if (sekreValue && sekreValue !== ketuaValue) {
        try {
            const sekre = JSON.parse(sekreValue);
            tableHTML += createTimlakTableRow(memberCount++, 'Sekretaris', sekre, 'sekre', sekreValue);
        } catch (e) {
            console.error('Error parsing sekre TIMLAK data:', e);
        }
    }

    // Add Anggota
    if (anggotaValue && anggotaValue !== ketuaValue && anggotaValue !== sekreValue) {
        try {
            const anggota = JSON.parse(anggotaValue);
            tableHTML += createTimlakTableRow(memberCount++, 'Anggota', anggota, 'anggota', anggotaValue);
        } catch (e) {
            console.error('Error parsing anggota TIMLAK data:', e);
        }
    }

    if (tableHTML === '') {
        tableHTML = `
                    <tr>
                        <td colspan="6" class="text-center text-muted py-4">
                            <i class="fas fa-user-check fa-2x mb-2 d-block"></i>
                            Pilih Ketua, Sekretaris, dan Anggota TIMLAK untuk menampilkan tabel
                        </td>
                    </tr>
                `;
    }

    tableBody.innerHTML = tableHTML;

}



// Create TIMLAK table row
function createTimlakTableRow(no, role, member, roleKey, memberValue) {
    const badgeClass = role === 'Ketua' ? 'bg-success' : role === 'Sekretaris' ? 'bg-info' : 'bg-secondary';

    return `
                <tr>
                    <td class="text-center align-middle fw-bold">${no}</td>
                    <td class="text-center align-middle">
                        <span class="badge ${badgeClass}">${role}</span>
                    </td>
                    <td class="align-middle">
                        ${member.nama}
                        <input type="hidden" name="${roleKey}_timlak" value="${member.nama}">
                    </td>
                    <td class="align-middle">
                        ${member.nip}
                        <input type="hidden" name="nip_${roleKey}_timlak" value="${member.nip}">
                    </td>
                    <td class="align-middle">
                        ${member.email !== '-' ? member.email : '<span class="text-muted">-</span>'}
                        <input type="hidden" name="email_${roleKey}_timlak" value="${member.email}">
                    </td>
                    <td class="text-center align-middle">
                        <button type="button" class="btn btn-outline-danger btn-sm" onclick="removeTimlakMemberFromRole('${roleKey}', '${encodeURIComponent(memberValue || '')}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </td>
                </tr>
            `;
}

// Remove member from specific TIMLAK role
function removeTimlakMemberFromRole(roleKey, encodedValue = '') {
    if (roleKey === 'ketua') {
        document.getElementById('ketua_timlak').value = '';
    } else if (roleKey === 'sekre') {
        document.getElementById('sekre_timlak').value = '';
    } else if (roleKey === 'anggota') {
        document.getElementById('anggota_timlak').value = '';
    }
    updateTimlakTable();
}



// Add custom variable
function addCustomVariable() {
    customVariableCount++;
    const variablesDiv = document.getElementById('custom_variables');

    const variableHtml = `
                <div class="custom-variable" id="custom_variable_${customVariableCount}">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h6>Variabel Custom ${customVariableCount}</h6>
                        <button type="button" class="btn btn-danger btn-sm" onclick="removeCustomVariable(${customVariableCount})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-2">
                            <label class="form-label">Nama Variabel (tanpa kurung kurawal)</label>
                            <input type="text" class="form-control" name="custom_var_name_${customVariableCount}" 
                                   placeholder="contoh: nama_kepala_dinas" required>
                        </div>
                        <div class="col-md-6 mb-2">
                            <label class="form-label">Nilai</label>
                            <input type="text" class="form-control" name="custom_var_value_${customVariableCount}" 
                                   placeholder="contoh: Ir. John Doe, M.T." required>
                        </div>
                    </div>
                </div>
            `;

    variablesDiv.insertAdjacentHTML('beforeend', variableHtml);
}

// Remove custom variable
function removeCustomVariable(id) {
    const variable = document.getElementById(`custom_variable_${id}`);
    if (variable) {
        variable.remove();
    }
}



// Generate nomor undangan rapat otomatis
function updateNomorUndanganRapat() {
    const kodePokja = document.getElementById('kode_pokja')?.value || '{kode_pokja}';
    const tahunSekarang = new Date().getFullYear(); // Gunakan tahun sekarang, bukan tahun_anggaran
    const nomorInput = document.getElementById('nomor_undangan_rapat');

    if (nomorInput) {
        const nomorUndangan = `PB0301-Bp2jk17/POKJA-${kodePokja}/${tahunSekarang}/01`;
        nomorInput.value = nomorUndangan;
        nomorInput.setAttribute('placeholder', `Default: PB0301-Bp2jk17/POKJA-${kodePokja}/${tahunSekarang}/01`);
    }
}

// Panggil saat kode_pokja atau tahun_anggaran berubah
document.addEventListener('DOMContentLoaded', function () {
    const kodePokjaInput = document.getElementById('kode_pokja');

    // Initialize nomor undangan rapat langsung saat page load
    updateNomorUndanganRapat();

    if (kodePokjaInput) {
        kodePokjaInput.addEventListener('input', updateNomorUndanganRapat);
    }
});



// No custom anggota picker code needed in the new UI

// Collect all keywords
function collectAllKeywords(formData) {
    const keywords = {};

    // Basic information
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
    keywords.tahun_anggaran = formData.get('tahun_anggaran') || '';
    keywords.nama_paket = formData.get('nama_paket') || '';
    keywords.klpd = formData.get('klpd') || '';
    keywords.unit_organisasi = formData.get('unit_organisasi') || '';
    keywords.balai = formData.get('balai') || '';
    keywords.satuan_kerja = formData.get('satuan_kerja') || '';
    keywords.kegiatan = formData.get('kegiatan') || '';
    keywords.jenis_pengadaan = formData.get('jenis_pengadaan') || '';
    keywords.metode_pengadaan = formData.get('metode_pengadaan') || '';
    keywords.sumber_dana = formData.get('sumber_dana') || '';

    // Uppercase versions for all text fields
    keywords.satuan_kerja_upper = keywords.satuan_kerja.toUpperCase();

    // Values
    const nilaiPagu = parseInt(formData.get('nilai_pagu') || '0');
    const nilaiHps = parseInt(formData.get('nilai_hps') || '0');
    keywords.nilai_pagu = formatCurrency(nilaiPagu);
    keywords.terbilang_pagu = terbilang(nilaiPagu, false) + ' rupiah';
    keywords.nilai_hps = formatCurrency(nilaiHps);
    keywords.terbilang_hps = terbilang(nilaiHps, false) + ' rupiah';

    // Pokja pemilihan
    keywords.pokja_pemilihan = `Kelompok Kerja Pemilihan ${keywords.kode_pokja} BP2JK Wilayah Kalimantan Selatan Tahun Anggaran ${keywords.tahun_anggaran}`;

    // POKJA members - Handle both old and new systems
    // Handle ketua data
    const ketuaData = formData.get('ketua_pokja') || '';
    if (ketuaData) {
        try {
            const ketuaObj = JSON.parse(ketuaData);
            keywords['ketua_pokja'] = ketuaObj.nama || '';
            keywords['nip_ketua_pokja'] = ketuaObj.nip || '';
            keywords['email_ketua_pokja'] = ketuaObj.email || '';
        } catch (e) {
            // Fallback to direct field value
            keywords['ketua_pokja'] = ketuaData;
            keywords['nip_ketua_pokja'] = formData.get('nip_ketua_pokja') || '';
            keywords['email_ketua_pokja'] = formData.get('email_ketua_pokja') || '';
        }
    } else {
        keywords['ketua_pokja'] = '';
        keywords['nip_ketua_pokja'] = '';
        keywords['email_ketua_pokja'] = '';
    }

    // Handle sekre data
    const sekreData = formData.get('sekre_pokja') || '';
    if (sekreData) {
        try {
            const sekreObj = JSON.parse(sekreData);
            keywords['sekre_pokja'] = sekreObj.nama || '';
            keywords['nip_sekre_pokja'] = sekreObj.nip || '';
            keywords['email_sekre_pokja'] = sekreObj.email || '';
        } catch (e) {
            // Fallback to direct field value
            keywords['sekre_pokja'] = sekreData;
            keywords['nip_sekre_pokja'] = formData.get('nip_sekre_pokja') || '';
            keywords['email_sekre_pokja'] = formData.get('email_sekre_pokja') || '';
        }
    } else {
        keywords['sekre_pokja'] = '';
        keywords['nip_sekre_pokja'] = '';
        keywords['email_sekre_pokja'] = '';
    }

    // Initialize all anggota slots
    for (let i = 3; i <= 5; i++) {
        keywords[`anggota${i}_pokja`] = '';
        keywords[`nip_anggota${i}_pokja`] = '';
        keywords[`email_anggota${i}_pokja`] = '';
    }

    // Handle anggota from three selects (3,4,5)
    const anggotaSelectIds = ['anggota3_select', 'anggota4_select', 'anggota5_select'];
    let anggotaIndex = 3;
    anggotaSelectIds.forEach(id => {
        const val = formData.get(id) || '';
        if (!val) { anggotaIndex++; return; }
        try {
            const obj = JSON.parse(val);
            keywords[`anggota${anggotaIndex}_pokja`] = obj.nama || '';
            keywords[`nip_anggota${anggotaIndex}_pokja`] = obj.nip || '';
            keywords[`email_anggota${anggotaIndex}_pokja`] = obj.email || '';
        } catch (e) {
            keywords[`anggota${anggotaIndex}_pokja`] = val;
            keywords[`nip_anggota${anggotaIndex}_pokja`] = formData.get(`nip_anggota${anggotaIndex}_pokja`) || '';
            keywords[`email_anggota${anggotaIndex}_pokja`] = formData.get(`email_anggota${anggotaIndex}_pokja`) || '';
        }
        anggotaIndex++;
    });



    // Also check for direct field inputs (backward compatibility)
    for (let i = 3; i <= 5; i++) {
        if (!keywords[`anggota${i}_pokja`]) {
            keywords[`anggota${i}_pokja`] = formData.get(`anggota${i}_pokja`) || '';
            keywords[`nip_anggota${i}_pokja`] = formData.get(`nip_anggota${i}_pokja`) || '';
            keywords[`email_anggota${i}_pokja`] = formData.get(`email_anggota${i}_pokja`) || '';
        }
    }

    // TIMLAK members - Handle similar to POKJA
    // Handle ketua timlak
    const ketuaTimlakData = formData.get('ketua_timlak') || '';
    if (ketuaTimlakData) {
        try {
            const ketuaObj = JSON.parse(ketuaTimlakData);
            keywords['ketua_timlak'] = ketuaObj.nama || '';
            keywords['nip_ketua_timlak'] = ketuaObj.nip || '';
            keywords['email_ketua_timlak'] = ketuaObj.email || '';
        } catch (e) {
            // Fallback to direct field value
            keywords['ketua_timlak'] = ketuaTimlakData;
            keywords['nip_ketua_timlak'] = formData.get('nip_ketua_timlak') || '';
            keywords['email_ketua_timlak'] = formData.get('email_ketua_timlak') || '';
        }
    } else {
        keywords['ketua_timlak'] = '';
        keywords['nip_ketua_timlak'] = '';
        keywords['email_ketua_timlak'] = '';
    }

    // Handle sekre timlak
    const sekreTimlakData = formData.get('sekre_timlak') || '';
    if (sekreTimlakData) {
        try {
            const sekreObj = JSON.parse(sekreTimlakData);
            keywords['sekre_timlak'] = sekreObj.nama || '';
            keywords['nip_sekre_timlak'] = sekreObj.nip || '';
            keywords['email_sekre_timlak'] = sekreObj.email || '';
        } catch (e) {
            // Fallback to direct field value
            keywords['sekre_timlak'] = sekreTimlakData;
            keywords['nip_sekre_timlak'] = formData.get('nip_sekre_timlak') || '';
            keywords['email_sekre_timlak'] = formData.get('email_sekre_timlak') || '';
        }
    } else {
        keywords['sekre_timlak'] = '';
        keywords['nip_sekre_timlak'] = '';
        keywords['email_sekre_timlak'] = '';
    }

    // Handle anggota timlak
    const anggotaTimlakData = formData.get('anggota_timlak') || '';
    if (anggotaTimlakData) {
        try {
            const anggotaObj = JSON.parse(anggotaTimlakData);
            keywords['anggota_timlak'] = anggotaObj.nama || '';
            keywords['nip_anggota_timlak'] = anggotaObj.nip || '';
            keywords['email_anggota_timlak'] = anggotaObj.email || '';
        } catch (e) {
            // Fallback to direct field value
            keywords['anggota_timlak'] = anggotaTimlakData;
            keywords['nip_anggota_timlak'] = formData.get('nip_anggota_timlak') || '';
            keywords['email_anggota_timlak'] = formData.get('email_anggota_timlak') || '';
        }
    } else {
        keywords['anggota_timlak'] = '';
        keywords['nip_anggota_timlak'] = '';
        keywords['email_anggota_timlak'] = '';
    }

    // Nomor dan Tanggal Undangan Rapat
    keywords['nomor_undangan_rapat'] = formData.get('nomor_undangan_rapat') || '';
    keywords['tanggal_undangan_rapat'] = formatDateIndonesian(formData.get('tanggal_undangan_rapat') || '');

    // Generate additional date formats for undangan_rapat
    const tanggalUndanganRapat = formData.get('tanggal_undangan_rapat') || '';
    if (tanggalUndanganRapat) {
        const dateObj = new Date(tanggalUndanganRapat);
        if (!isNaN(dateObj.getTime())) {
            // {format_tanggal_undangan_rapat} - keep original YYYY-MM-DD
            keywords['format_tanggal_undangan_rapat'] = tanggalUndanganRapat;

            // {tanggal_bulan_tahun_undangan_rapat} - "13 Agustus 2025"
            keywords['tanggal_bulan_tahun_undangan_rapat'] = `${dateObj.getDate()} ${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

            // {hari_undangan_rapat} - "Rabu"
            keywords['hari_undangan_rapat'] = dayNames[dateObj.getDay()];

            // {tanggal_sebut_undangan_rapat} - "Tiga Belas"
            keywords['tanggal_sebut_undangan_rapat'] = terbilang(dateObj.getDate());

            // {bulan_sebut_undangan_rapat} - "Agustus"
            keywords['bulan_sebut_undangan_rapat'] = monthNames[dateObj.getMonth()];

            // {tahun_sebut_undangan_rapat} - "Dua Ribu Dua Puluh Lima"
            keywords['tahun_sebut_undangan_rapat'] = terbilang(dateObj.getFullYear());
        }
    }


    // TIMLAK Document numbers and dates - Generate document-specific date keywords
    const timlakDocNumbers = ['DH', '01', '02', '03', '04', '05', '06', '07', '08'];

    // Default format nomor surat TIMLAK berdasarkan jenis dokumen
    const timlakDefaultFormats = {
        'DH': '', // Daftar Hadir tidak punya nomor surat
        '01': `PB0301-Bp2jk17/POKJA-${keywords.kode_pokja}/${keywords.tahun_surat}/02`,
        '02': `xxxx/MD/Bp2jk17/${keywords.tahun_surat}`,
        '03': `PB.01.01/Cb23.5/xxxx`, // Manual input required
        '04': `PB0301-Bp2jk17/TIMLAK-${keywords.kode_pokja}/${keywords.tahun_surat}/01`,
        '05': `PB0301-Bp2jk17/TIMLAK-${keywords.kode_pokja}/${keywords.tahun_surat}/02`,
        '06': `PB0301-Bp2jk17/xxxx`,
        '07': `xxxx/ND/Bp2jk17/${keywords.tahun_surat}`,
        '08': `PB0301-Bp2jk17/POKJA-${keywords.kode_pokja}/${keywords.tahun_surat}/02.1`
    };

    timlakDocNumbers.forEach(num => {
        const nomorValue = formData.get(`nomor_timlak_${num}`);
        const tanggalValue = formData.get(`format_tanggal_${num}`);

        // {nomor_timlak_XX} - Nomor surat TIMLAK (kecuali DH)
        if (num !== 'DH') {
            keywords[`nomor_timlak_${num}`] = nomorValue || timlakDefaultFormats[num];
        }

        // Generate derivative date keywords from format_tanggal_XX
        if (tanggalValue) {
            const dateObj = new Date(tanggalValue);

            // Untuk DH: gunakan tanggal_DH (tanpa suffix _timlak)
            // Untuk lainnya: gunakan tanggal_timlak_XX
            const datePrefix = num === 'DH' ? 'tanggal' : 'tanggal_timlak';

            // {tanggal_DH} atau {tanggal_timlak_XX} - "13 Agustus 2025"
            keywords[`${datePrefix}_${num}`] = formatDateIndonesian(tanggalValue);

            // Keywords turunan tanggal (hanya untuk non-DH)
            if (num !== 'DH') {
                // {format_tanggal_timlak_XX} - keep original YYYY-MM-DD
                keywords[`format_tanggal_timlak_${num}`] = tanggalValue;

                // {tanggal_bulan_tahun_timlak_XX} - "13 Agustus 2025"
                keywords[`tanggal_bulan_tahun_timlak_${num}`] = `${dateObj.getDate()} ${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

                // {hari_surat_timlak_XX} - "Rabu"
                keywords[`hari_surat_timlak_${num}`] = dayNames[dateObj.getDay()];

                // {tanggal_sebut_timlak_XX} - "Tiga Belas"
                keywords[`tanggal_sebut_timlak_${num}`] = terbilang(dateObj.getDate());

                // {bulan_sebut_timlak_XX} - "Agustus"
                keywords[`bulan_sebut_timlak_${num}`] = monthNames[dateObj.getMonth()];

                // {tahun_sebut_timlak_XX} - "Dua Ribu Dua Puluh Lima"
                keywords[`tahun_sebut_timlak_${num}`] = terbilang(dateObj.getFullYear());
            }
        }
    });

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

// Update terbilang Pagu (lowercase)
function updateTerbilangPagu() {
    const amount = parseInt(document.getElementById('nilai_pagu').value) || 0;
    if (amount > 0) {
        const terbilangText = terbilang(amount, false).trim() + ' Rupiah';
        document.getElementById('terbilang_pagu').value = terbilangText;
    } else {
        document.getElementById('terbilang_pagu').value = '';
    }
}

// Update terbilang HPS (lowercase)
function updateTerbilangHPS() {
    const amount = parseInt(document.getElementById('nilai_hps').value) || 0;
    if (amount > 0) {
        const terbilangText = terbilang(amount, false).trim() + ' Rupiah';
        document.getElementById('terbilang_hps').value = terbilangText;
    } else {
        document.getElementById('terbilang_hps').value = '';
    }
}

// Format date to Indonesian
function formatDateIndonesian(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    } catch (e) {
        return dateString;
    }
}

// Format currency
function formatCurrency(amount) {
    if (amount === 0) return 'Rp0,00';
    return `Rp${amount.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Terbilang function - Indonesian number to text conversion
// Parameter capitalize: true = huruf besar tiap kata (untuk tanggal, tahun), false = huruf kecil (untuk pagu, hps)
function terbilang(num, capitalize = true) {
    if (typeof num !== 'number') {
        num = parseInt(num) || 0;
    }

    if (num === 0) return capitalize ? 'Nol' : 'nol';
    if (num < 0) return (capitalize ? 'Minus ' : 'minus ') + terbilang(-num, capitalize);

    const satuan = capitalize
        ? ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan']
        : ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
    const belasan = capitalize
        ? ['Sepuluh', 'Sebelas', 'Dua Belas', 'Tiga Belas', 'Empat Belas', 'Lima Belas',
            'Enam Belas', 'Tujuh Belas', 'Delapan Belas', 'Sembilan Belas']
        : ['sepuluh', 'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas',
            'enam belas', 'tujuh belas', 'delapan belas', 'sembilan belas'];

    function convertHundreds(n) {
        let result = '';

        if (n >= 100) {
            if (Math.floor(n / 100) === 1) {
                result += (capitalize ? 'Seratus ' : 'seratus ');
            } else {
                result += satuan[Math.floor(n / 100)] + (capitalize ? ' Ratus ' : ' ratus ');
            }
            n %= 100;
        }

        if (n >= 20) {
            result += satuan[Math.floor(n / 10)] + (capitalize ? ' Puluh ' : ' puluh ');
            n %= 10;
            if (n > 0) {
                result += satuan[n] + ' ';
            }
        } else if (n >= 10) {
            result += belasan[n - 10] + ' ';
        } else if (n > 0) {
            result += satuan[n] + ' ';
        }

        return result.trim();
    }

    let result = '';

    // Triliun
    if (num >= 1000000000000) {
        const triliun = Math.floor(num / 1000000000000);
        if (triliun === 1) {
            result += (capitalize ? 'Satu Triliun ' : 'satu triliun ');
        } else {
            result += convertHundreds(triliun) + (capitalize ? ' Triliun ' : ' triliun ');
        }
        num %= 1000000000000;
    }

    // Miliar
    if (num >= 1000000000) {
        const miliar = Math.floor(num / 1000000000);
        if (miliar === 1) {
            result += (capitalize ? 'Satu Miliar ' : 'satu miliar ');
        } else {
            result += convertHundreds(miliar) + (capitalize ? ' Miliar ' : ' miliar ');
        }
        num %= 1000000000;
    }

    // Juta
    if (num >= 1000000) {
        const juta = Math.floor(num / 1000000);
        if (juta === 1) {
            result += (capitalize ? 'Satu Juta ' : 'satu juta ');
        } else {
            result += convertHundreds(juta) + (capitalize ? ' Juta ' : ' juta ');
        }
        num %= 1000000;
    }

    // Ribu
    if (num >= 1000) {
        const ribu = Math.floor(num / 1000);
        if (ribu === 1) {
            result += (capitalize ? 'Seribu ' : 'seribu ');
        } else {
            result += convertHundreds(ribu) + (capitalize ? ' Ribu ' : ' ribu ');
        }
        num %= 1000;
    }

    // Ratusan, puluhan, satuan
    if (num > 0) {
        result += convertHundreds(num);
    }

    return result.trim();
}

// Preview keywords
function previewKeywords() {
    console.log('previewKeywords() called');
    const formData = new FormData(document.getElementById('baForm'));
    const keywords = collectAllKeywords(formData);
    console.log('Keywords collected:', Object.keys(keywords).length);

    let content = '<div class="keyword-categories">';

    // Group keywords by category
    const basicInfo = {};
    const pokjaInfo = {};
    const timlakInfo = {};
    const documentInfo = {};
    const customVars = {};

    Object.entries(keywords).forEach(([key, value]) => {
        // POKJA: ketua_pokja, sekre_pokja, anggota_pokja, nip, email
        if (key.includes('pokja') && (key.includes('ketua') || key.includes('sekre') ||
            key.includes('anggota') || key.includes('nip_') || key.includes('email_'))) {
            pokjaInfo[key] = value;
        }
        // TIMLAK: ketua_timlak, sekre_timlak, anggota_timlak, nip, email, email_timlak (perwakilan)
        else if ((key.includes('timlak') && (key.includes('ketua') || key.includes('sekre') ||
            key.includes('anggota') || key.includes('nip_') || key.includes('email_'))) ||
            key === 'email_timlak') {
            timlakInfo[key] = value;
        }
        // Document Info TIMLAK: nomor_timlak_XX, tanggal_timlak_XX, tanggal_DH, format_tanggal_timlak_XX, 
        // tanggal_bulan_tahun_timlak_XX, hari_surat_timlak_XX, tanggal_sebut_timlak_XX, 
        // bulan_sebut_timlak_XX, tahun_sebut_timlak_XX
        else if (key.startsWith('nomor_timlak_') || key.startsWith('tanggal_timlak_') || key.endsWith('undangan_rapat') ||
            key === 'tanggal_DH' || // Special case: DH hanya punya tanggal
            key.startsWith('format_tanggal_timlak_') || key.startsWith('tanggal_bulan_tahun_timlak_') ||
            key.startsWith('hari_surat_timlak_') || key.startsWith('tanggal_sebut_timlak_') ||
            key.startsWith('bulan_sebut_timlak_') || key.startsWith('tahun_sebut_timlak_')) {
            documentInfo[key] = value;
        }
        // Basic Info: kode, tahun, nama_paket, klpd, unit_organisasi, balai, satuan_kerja, 
        // kegiatan, jenis_pengadaan, metode_pengadaan, sumber_dana, nilai, terbilang, dll
        else if (key.startsWith('nilai_') || key.startsWith('terbilang_') ||
            key === 'kode_pokja' || key === 'tahun_anggaran' || key === 'tahun_surat' ||
            key === 'nama_paket' || key === 'klpd' || key === 'unit_organisasi' ||
            key === 'balai' || key === 'satuan_kerja' || key === 'kegiatan' ||
            key === 'jenis_pengadaan' || key === 'metode_pengadaan' || key === 'sumber_dana' ||
            key === 'nomor_sk_pokja' || key === 'tanggal_sk_pokja' ||
            key === 'nomor_sk_timlak' || key === 'tanggal_sk_timlak' ||
            key === 'pokja_pemilihan') {
            basicInfo[key] = value;
        }
        // Custom Variables: everything else
        else {
            customVars[key] = value;
        }
    });

    // Basic Information Section
    if (Object.keys(basicInfo).length > 0) {
        content += '<div class="mb-4"><h6 class="text-primary border-bottom pb-2"><i class="fas fa-info-circle me-2"></i>Informasi Dasar</h6>';
        Object.entries(basicInfo).forEach(([key, value]) => {
            content += `<div class="mb-1"><code class="text-success">{${key}}</code>: <span class="text-dark">${value || '<em class="text-muted">kosong</em>'}</span></div>`;
        });
        content += '</div>';
    }

    // POKJA Section
    if (Object.keys(pokjaInfo).length > 0) {
        content += '<div class="mb-4"><h6 class="text-primary border-bottom pb-2"><i class="fas fa-users me-2"></i>Anggota POKJA</h6>';
        Object.entries(pokjaInfo).forEach(([key, value]) => {
            content += `<div class="mb-1"><code class="text-success">{${key}}</code>: <span class="text-dark">${value || '<em class="text-muted">kosong</em>'}</span></div>`;
        });
        content += '</div>';
    }

    // TIMLAK Section
    if (Object.keys(timlakInfo).length > 0) {
        content += '<div class="mb-4"><h6 class="text-success border-bottom pb-2"><i class="fas fa-user-check me-2"></i>Anggota TIMLAK</h6>';
        Object.entries(timlakInfo).forEach(([key, value]) => {
            content += `<div class="mb-1"><code class="text-success">{${key}}</code>: <span class="text-dark">${value || '<em class="text-muted">kosong</em>'}</span></div>`;
        });
        content += '</div>';
    }

    // Document Information Section
    if (Object.keys(documentInfo).length > 0) {
        content += '<div class="mb-4"><h6 class="text-primary border-bottom pb-2"><i class="fas fa-file-alt me-2"></i>Nomor & Tanggal Dokumen BA TIMLAK</h6>';
        content += '<details><summary class="text-muted" style="cursor: pointer;">Klik untuk melihat detail dokumen (banyak)</summary>';
        Object.entries(documentInfo).forEach(([key, value]) => {
            content += `<div class="mb-1 ms-3"><code class="text-success">{${key}}</code>: <span class="text-dark">${value || '<em class="text-muted">kosong</em>'}</span></div>`;
        });
        content += '</details></div>';
    }

    // Custom Variables Section
    if (Object.keys(customVars).length > 0) {
        content += '<div class="mb-4"><h6 class="text-primary border-bottom pb-2"><i class="fas fa-code me-2"></i>Variabel Custom & Lainnya</h6>';
        content += '<details><summary class="text-muted" style="cursor: pointer;">Klik untuk melihat detail dokumen (banyak)</summary>';
        Object.entries(customVars).forEach(([key, value]) => {
            content += `<div class="mb-1"><code class="text-success">{${key}}</code>: <span class="text-dark">${value || '<em class="text-muted">kosong</em>'}</span></div>`;
        });
        content += '</div>';
    }

    content += '</div>';

    document.getElementById('keywords_preview_content').innerHTML = content;
    new bootstrap.Modal(document.getElementById('keywordsModal')).show();
}

// Handle form submission
document.getElementById('baForm').addEventListener('submit', function (e) {
    console.log('Form submit handler called');
    e.preventDefault();

    const formData = new FormData(this);
    const keywords = collectAllKeywords(formData);
    formData.append('keywords', JSON.stringify(keywords));
    formData.append('deleted_documents', JSON.stringify([]));
    formData.append('selected_documents', JSON.stringify([]));
    formData.append('keywords_to_delete_rows', JSON.stringify([]));

    // Show loading
    document.getElementById('loadingOverlay').style.display = 'flex';

    // Submit to backend
    fetch('/process_comprehensive', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('loadingOverlay').style.display = 'none';

            if (data.success) {
                showResults(data);
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            document.getElementById('loadingOverlay').style.display = 'none';
            alert('Error: ' + error);
        });
});

// Show results
function showResults(data) {
    let content = '<div class="results-content">';

    if (data.files && data.files.length > 0) {
        content += '<h5>Dokumen berhasil diproses:</h5>';

        data.files.forEach(file => {
            content += `
                <div class="card mb-3">
                    <div class="card-header bg-success text-white">
                    <h6 class="mb-0">
                        <i class="fas fa-file-word me-2"></i>
                        ${file.filename}
                    </h6>
                    </div>
                    <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                        <strong>Total Replacements: ${file.replacements}</strong>
                        </div>
                        <div class="col-md-6 text-end">
                        <small class="text-muted">Processed successfully</small>
                        </div>
                    </div>
                `;

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

        content += '<div class="mt-3 text-center">';
        content += '<a href="/download_results" class="btn btn-success btn-lg"><i class="fas fa-download me-2"></i> Download Semua Hasil</a>';
        content += '</div>';
    }

    if (data.failed_files && data.failed_files.length > 0) {
        content += '<h5 class="mt-4 text-danger">File yang gagal diproses:</h5>';

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

    document.getElementById('results_content').innerHTML = content;
    new bootstrap.Modal(document.getElementById('resultsModal')).show();
}







