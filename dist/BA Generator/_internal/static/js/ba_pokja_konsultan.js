// Extracted from templates/ba_pokja_konsultan.html
// Full inline script preserved verbatim to maintain behavior.

let pokjaMemberCount = 0;
let customVariableCount = 0;
let deletedDocuments = new Set();

// Global arrays for members
let pokjaMembers = [];

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

            // Parse CSV line (handle quoted fields properly)
            const fields = [];
            let current = '';
            let inQuotes = false;

            for (let j = 0; j < line.length; j++) {
                const char = line[j];

                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    // Clean up field: remove quotes and trim
                    let field = current.trim();
                    if (field.startsWith('"') && field.endsWith('"')) {
                        field = field.slice(1, -1);
                    }
                    fields.push(field);
                    current = '';
                } else {
                    current += char;
                }
            }

            // Don't forget the last field
            let lastField = current.trim();
            if (lastField.startsWith('"') && lastField.endsWith('"')) {
                lastField = lastField.slice(1, -1);
            }
            fields.push(lastField);

            // Validate and create member object
            if (fields.length >= 4) {
                const member = {
                    nama: fields[0].trim(),
                    nip: fields[1].trim(),
                    email: fields[2].trim() || '-',
                    group: fields[3].trim().toLowerCase()
                };

                // Skip if essential fields are empty
                if (!member.nama || !member.nip) continue;

                // Only load POKJA members (ignore TIMLAK in this menu)
                if (member.group === 'pokja') {
                    pokjaMembers.push(member);
                }
            }
        }

        // Initialize selectors after loading
        console.log(`✅ CSV loaded: ${pokjaMembers.length} POKJA members`);
        initializePokjaSelectors();
        initializePokjaTable();

    } catch (error) {
        console.error('❌ Error loading CSV:', error);
        console.log('📋 Using default POKJA members as fallback');
        // Fallback to default members if CSV fails
        initializePokjaSelectors();
        initializePokjaTable();
    }
}

// Initialize POKJA selectors with CSV members
function initializePokjaSelectors() {
    console.log('🔧 Initializing POKJA selectors with', pokjaMembers.length, 'members');

    const ketuaSelect = document.getElementById('ketua_pokja');
    const sekreSelect = document.getElementById('sekre_pokja');
    const anggota3 = document.getElementById('anggota3_select');
    const anggota4 = document.getElementById('anggota4_select');
    const anggota5 = document.getElementById('anggota5_select');

    if (!ketuaSelect || !sekreSelect || !anggota3 || !anggota4 || !anggota5) {
        console.error('❌ POKJA select elements not found!');
        return;
    }

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

    console.log('✅ POKJA selectors initialized with', ketuaSelect.options.length - 1, 'members');
}

// Indonesian day and month names
const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

// Initialize form
document.addEventListener('DOMContentLoaded', function () {
    // Load members from CSV first (this will also initialize selectors and table)
    loadMembersFromCSV();

    // Auto-fill default values
    updateDefaultValues();

    // Add event listeners for auto-update
    document.getElementById('kode_pokja').addEventListener('input', updateDefaultValues);
    document.getElementById('tahun_anggaran').addEventListener('input', updateDefaultValues);
    const tglSk = document.getElementById('tanggal_sk_pokja');
    if (tglSk) tglSk.addEventListener('change', updateDefaultValues);

    // Note: POKJA role change listeners are added in initializePokjaSelectors()
});

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

    // Update default nomor dokumen
    if (kodePokja && tahun) {
        document.getElementById('nomor_dokumen_kualifikasi').placeholder = `PB0301-Bp2jk17/POKJA-${kodePokja}/${tahun}/04`;
        document.getElementById('nomor_dokumen_seleksi').placeholder = `PB0301-Bp2jk17/POKJA-${kodePokja}/${tahun}/05`;

        // Update document table placeholders
        const docNumbers = ['00', '06', '10', '11', '12', '13', '14', '17', '19', '20', '21', '22', '22-LHP', '24', '25', '26', '27', '27-2', '28', '29', '96', '97', '99'];
        docNumbers.forEach(num => {
            const input = document.querySelector(`input[name="nomor_surat_${num}"]`);
            if (input) {
                input.placeholder = `PB0301-Bp2jk17/POKJA-${kodePokja}/${tahun}/${num}`;
            }
        });
    }
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

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Create POKJA table row
function createPokjaTableRow(no, role, member, roleKey, memberValue) {
    const badgeClass = role === 'Ketua' ? 'bg-primary' : role === 'Sekretaris' ? 'bg-success' : 'bg-info';

    // Escape values for HTML attributes
    const escapedNama = escapeHtml(member.nama);
    const escapedNip = escapeHtml(member.nip);
    const escapedEmail = escapeHtml(member.email);

    return `
        <tr>
            <td class="text-center align-middle fw-bold">${no}</td>
            <td class="text-center align-middle">
                <span class="badge ${badgeClass}">${role}</span>
            </td>
            <td class="align-middle">
                ${escapedNama}
                <input type="hidden" name="${roleKey}_pokja" value="${escapedNama}">
            </td>
            <td class="align-middle">
                ${escapedNip}
                <input type="hidden" name="nip_${roleKey}_pokja" value="${escapedNip}">
            </td>
            <td class="align-middle">
                ${member.email !== '-' ? escapedEmail : '<span class="text-muted">-</span>'}
                <input type="hidden" name="email_${roleKey}_pokja" value="${escapedEmail}">
            </td>
            <td class="text-center align-middle">
                <button type="button" class="btn btn-outline-danger btn-sm" onclick="removePokjaMemberFromRole('${roleKey}')">
                    <i class="fas fa-times"></i>
                </button>
            </td>
        </tr>
    `;
}

// Remove member from specific role
function removePokjaMemberFromRole(roleKey) {
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

// Legacy function for compatibility
function addPokjaMember() {
    // Table is pre-initialized, no need to add
    console.log('POKJA table is pre-initialized with 5 members');
}

// Clear POKJA member data (for table format)
function clearPokjaMember(id) {
    document.getElementById(`anggota${id}_pokja`).value = '';
    document.getElementById(`nip_anggota${id}_pokja`).value = '';
    document.getElementById(`email_anggota${id}_pokja`).value = '';
    updatePokjaSelectors();
}

// Legacy function for compatibility
function removePokjaMember(id) {
    clearPokjaMember(id);
}

// Update add button state (not needed for table format)
function updateAddButtonState() {
    // Table format has fixed 5 rows, no add button needed
}

// Update POKJA role selectors
// Legacy function - now replaced by role-based system
function updatePokjaSelectors() {
    // This function is now replaced by the new role-based system
    // Kept for backward compatibility
}

// Toggle Balai delete flag
function toggleBalaiDelete() {
    const deleteFlag = document.getElementById('balai_delete_flag');
    const deleteBtn = document.getElementById('balai_delete_btn');
    const balaiInput = document.getElementById('balai');
    const deleteHint = document.getElementById('balai_delete_hint');

    if (deleteFlag.value === 'false') {
        // Enable delete mode
        deleteFlag.value = 'true';
        deleteBtn.classList.remove('btn-outline-danger');
        deleteBtn.classList.add('btn-danger');
        deleteBtn.innerHTML = '<i class="fas fa-undo"></i>';
        deleteBtn.title = 'Batalkan penghapusan';
        balaiInput.disabled = true;
        balaiInput.style.backgroundColor = '#ffebee';
        balaiInput.value = '';
        deleteHint.style.display = 'block';
        showToast('Baris Balai akan dihapus dari dokumen', 'warning');
    } else {
        // Disable delete mode
        deleteFlag.value = 'false';
        deleteBtn.classList.remove('btn-danger');
        deleteBtn.classList.add('btn-outline-danger');
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.title = 'Hapus baris Balai dari dokumen';
        balaiInput.disabled = false;
        balaiInput.style.backgroundColor = '';
        deleteHint.style.display = 'none';
        showToast('Penghapusan baris Balai dibatalkan', 'info');
    }
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

// Toggle document row (delete/restore)
function toggleDocumentRow(docNum) {
    const row = document.querySelector(`tr[data-doc="${docNum}"]`);
    // Get the DELETE button specifically (not the preview button)
    const button = row.querySelector('button.btn-danger, button.btn-success');

    if (deletedDocuments.has(docNum)) {
        // Restore
        row.style.display = '';
        row.style.opacity = '1';
        button.textContent = 'Delete';
        button.className = 'btn btn-danger btn-sm';
        deletedDocuments.delete(docNum);

        // Enable inputs
        row.querySelectorAll('input').forEach(input => {
            input.disabled = false;
        });
    } else {
        // Delete
        row.style.opacity = '0.5';
        button.textContent = 'Restore';
        button.className = 'btn btn-success btn-sm';
        deletedDocuments.add(docNum);

        // Disable inputs
        row.querySelectorAll('input').forEach(input => {
            input.disabled = true;
            input.value = '';
        });
    }
}

// Update document table based on deletedDocuments state
function updateDocumentTable() {
    document.querySelectorAll('#document_table tr[data-doc]').forEach(row => {
        const docNum = row.getAttribute('data-doc');
        // Get the DELETE button specifically (not the preview button)
        const button = row.querySelector('button.btn-danger, button.btn-success');

        if (deletedDocuments.has(docNum)) {
            // Mark as deleted
            row.style.opacity = '0.5';
            button.textContent = 'Restore';
            button.className = 'btn btn-success btn-sm';

            // Disable inputs
            row.querySelectorAll('input').forEach(input => {
                input.disabled = true;
            });
        } else {
            // Mark as active
            row.style.display = '';
            row.style.opacity = '1';
            button.textContent = 'Delete';
            button.className = 'btn btn-danger btn-sm';

            // Enable inputs
            row.querySelectorAll('input').forEach(input => {
                input.disabled = false;
            });
        }
    });
}

// No custom anggota picker code needed in the new UI

// Preview document with replaced keywords
async function previewDocument(docCode) {
    // Validate master folder selected
    const masterFolder = document.getElementById('masterFolderPath').value;
    if (!masterFolder) {
        showToast('Pilih dan validasi master folder terlebih dahulu', 'error');
        return;
    }

    // Collect keywords
    const formData = new FormData(document.getElementById('baForm'));
    const keywords = collectAllKeywords(formData);

    // Show modal with loading state
    const modal = new bootstrap.Modal(document.getElementById('previewModal'));
    modal.show();
    document.getElementById('previewLoading').style.display = 'block';
    document.getElementById('previewContent').innerHTML = '';
    document.getElementById('previewWarnings').style.display = 'none';
    document.getElementById('previewPlaceholders').style.display = 'none';

    try {
        const response = await fetch('/api/preview_document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                doc_code: docCode,
                keywords: keywords,
                master_folder: masterFolder
            })
        });

        if (!response.ok) {
            let errorText = '';
            try {
                const errorData = await response.json();
                errorText = errorData.error || `HTTP ${response.status}`;
            } catch (e) {
                errorText = await response.text() || `HTTP ${response.status}`;
            }
            throw new Error(errorText);
        }

        const data = await response.json();

        if (data.success) {
            // Hide loading, show content
            document.getElementById('previewLoading').style.display = 'none';
            document.getElementById('previewContent').innerHTML = data.html;

            // Update modal title
            const docRow = document.querySelector(`tr[data-doc="${docCode}"]`);
            const docName = docRow ? docRow.children[2].textContent : 'Dokumen';
            document.getElementById('previewModalTitle').textContent = ` ${docCode} - ${docName}`;

            // Show warnings if any (but filter out minor style warnings)
            if (data.warnings && data.warnings.length > 0) {
                // Filter out minor unrecognised style warnings
                const importantWarnings = data.warnings.filter(w =>
                    !w.includes('Unrecognised paragraph style') &&
                    !w.includes('Unrecognised character style')
                );

                if (importantWarnings.length > 0) {
                    const warningsList = document.getElementById('previewWarningsList');
                    warningsList.innerHTML = importantWarnings.map(w => `<li>${w}</li>`).join('');
                    document.getElementById('previewWarnings').style.display = 'block';
                }

                // Log all warnings to console for debugging
                if (data.warnings.length > importantWarnings.length) {
                    console.log('Minor style warnings (tidak mempengaruhi hasil):',
                        data.warnings.filter(w => !importantWarnings.includes(w)));
                }
            }

            // Show remaining placeholders if any
            if (data.remaining_placeholders && data.remaining_placeholders.length > 0) {
                const placeholdersList = document.getElementById('previewPlaceholdersList');
                placeholdersList.innerHTML =
                    '<span class="badge bg-warning text-dark me-2">' +
                    data.remaining_placeholders.map(p => `{${p}}`).join('</span> <span class="badge bg-warning text-dark me-2">') +
                    '</span>';
                document.getElementById('previewPlaceholders').style.display = 'block';
            }
        } else {
            throw new Error(data.error || 'Unknown error');
        }
    } catch (error) {
        console.error('Preview error:', error);
        document.getElementById('previewLoading').style.display = 'none';
        document.getElementById('previewContent').innerHTML =
            `<div class="alert alert-danger">
                        <h5><i class="fas fa-exclamation-triangle"></i> Error</h5>
                        <p>${error.message}</p>
                        <small>Pastikan dokumen template tersedia di master folder dan format file sudah benar (.docx)</small>
                    </div>`;
    }
}

// Collect all keywords
function collectAllKeywords(formData) {
    const keywords = {};

    // Basic information
    keywords.nomor_sk_pokja = formData.get('nomor_sk_pokja') || '';
    keywords.tanggal_sk_pokja = formatDateIndonesian(formData.get('tanggal_sk_pokja') || '');
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
    keywords.kode_tender = formData.get('kode_tender') || '';
    keywords.nama_paket = formData.get('nama_paket') || '';
    keywords.klpd = formData.get('klpd') || '';
    keywords.unit_organisasi = formData.get('unit_organisasi') || '';
    keywords.balai = formData.get('balai') || '';
    keywords.satuan_kerja = formData.get('satuan_kerja') || '';
    keywords.kegiatan = formData.get('kegiatan') || '';
    keywords.jenis_pengadaan = formData.get('jenis_pengadaan') || '';
    keywords.metode_pengadaan = formData.get('metode_pengadaan') || '';
    keywords.sumber_dana = formData.get('sumber_dana') || '';

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

    // Document numbers and dates - Generate document-specific date keywords
    const docNumbers = ['00', '06', '10', '11', '12', '13', '14', '17', '19', '20', '21', '22', '22-LHP', '24', '25', '26', '27', '27-2', '28', '29', '96', '97', '99'];
    docNumbers.forEach(num => {
        if (!deletedDocuments.has(num)) {
            const nomorValue = formData.get(`nomor_surat_${num}`);
            const tanggalValue = formData.get(`format_tanggal_${num}`);

            keywords[`nomor_surat_${num}`] = nomorValue || `PB0301-Bp2jk17/POKJA-${keywords.kode_pokja}/${keywords.tahun_surat}/${num}`;

            // Generate derivative date keywords from format_tanggal_XX
            if (tanggalValue) {
                const dateObj = new Date(tanggalValue);

                // {format_tanggal_XX} - keep original YYYY-MM-DD
                keywords[`format_tanggal_${num}`] = tanggalValue;

                // {tanggal_bulan_tahun_XX} - "13 Agustus 2025"
                keywords[`tanggal_bulan_tahun_${num}`] = `${dateObj.getDate()} ${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

                // {hari_surat_XX} - "Rabu"
                keywords[`hari_surat_${num}`] = dayNames[dateObj.getDay()];

                // {tanggal_sebut_XX} - "Tiga Belas"
                keywords[`tanggal_sebut_${num}`] = terbilang(dateObj.getDate());

                // {bulan_sebut_XX} - "Agustus"
                keywords[`bulan_sebut_${num}`] = monthNames[dateObj.getMonth()];

                // {tahun_sebut_XX} - "Dua Ribu Dua Puluh Lima"
                keywords[`tahun_sebut_${num}`] = terbilang(dateObj.getFullYear());
            }

            // Legacy support - also keep tanggal_surat_XX for backward compatibility
            keywords[`tanggal_surat_${num}`] = formatDateIndonesian(tanggalValue || '');
        }
    });

    // Kualifikasi and Seleksi numbers
    keywords.nomor_dokumen_kualifikasi = formData.get('nomor_dokumen_kualifikasi') || `PB0301-Bp2jk17/POKJA-${keywords.kode_pokja}/${keywords.tahun_surat}/04`;
    keywords.tanggal_dokumen_kualifikasi = formatDateIndonesian(formData.get('tanggal_dokumen_kualifikasi') || '');
    keywords.nomor_dokumen_seleksi = formData.get('nomor_dokumen_seleksi') || `PB0301-Bp2jk17/POKJA-${keywords.kode_pokja}/${keywords.tahun_surat}/05`;
    keywords.tanggal_dokumen_seleksi = formatDateIndonesian(formData.get('tanggal_dokumen_seleksi') || '');

    // Custom variables
    for (let i = 1; i <= customVariableCount; i++) {
        const varName = formData.get(`custom_var_name_${i}`);
        const varValue = formData.get(`custom_var_value_${i}`);
        if (varName && varValue) {
            keywords[varName] = varValue;
        }
    }

    // Schedule keywords (jadwal_awal_X and jadwal_akhir_X)
    if (scheduleData && scheduleData.length > 0) {
        scheduleData.forEach(item => {
            if (item.placeholderName) {
                // jadwal_awal_X - mulai date in Indonesian format (original from table)
                keywords[`jadwal_awal_${item.placeholderName}`] = item.mulai;

                // jadwal_akhir_X - sampai date in Indonesian format (original from table)
                keywords[`jadwal_akhir_${item.placeholderName}`] = item.sampai;

                // ISO format for programmatic use
                if (item.mulaiDate) {
                    keywords[`jadwal_awal_${item.placeholderName}_iso`] = item.mulaiDate;
                }
                if (item.sampaiDate) {
                    keywords[`jadwal_akhir_${item.placeholderName}_iso`] = item.sampaiDate;
                }

                // Formatted date without time (e.g., "29 Juli 2025")
                // {tanggal_awal_X} and {tanggal_akhir_X}
                if (item.mulaiDate) {
                    const mulaiDateObj = new Date(item.mulaiDate);
                    keywords[`tanggal_awal_${item.placeholderName}`] =
                        `${mulaiDateObj.getDate()} ${monthNames[mulaiDateObj.getMonth()]} ${mulaiDateObj.getFullYear()}`;
                }
                if (item.sampaiDate) {
                    const sampaiDateObj = new Date(item.sampaiDate);
                    keywords[`tanggal_akhir_${item.placeholderName}`] =
                        `${sampaiDateObj.getDate()} ${monthNames[sampaiDateObj.getMonth()]} ${sampaiDateObj.getFullYear()}`;
                }
            }
        });
    }

    return keywords;
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
function terbilang(num, capitalize = true) {
    if (typeof num !== 'number') {
        num = parseInt(num) || 0;
    }

    if (num === 0) return capitalize ? 'Nol' : 'nol';
    if (num < 0) return (capitalize ? 'Minus ' : 'minus ') + terbilang(-num, capitalize);

    // Conditional arrays based on capitalize parameter
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
    const formData = new FormData(document.getElementById('baForm'));
    const keywords = collectAllKeywords(formData);

    let content = '<div class="keyword-categories">';

    // Group keywords by category
    const basicInfo = {};
    const pokjaInfo = {};
    const documentInfo = {};
    const scheduleInfo = {};
    const customVars = {};

    Object.entries(keywords).forEach(([key, value]) => {
        // POKJA: ketua, sekre, anggota, nip, email
        if (key.includes('pokja') || key.includes('ketua') || key.includes('sekre') ||
            key.includes('anggota') || key.includes('nip_') || key.includes('email_')) {
            pokjaInfo[key] = value;
        }
        // Schedule: jadwal_awal, jadwal_akhir, tanggal_awal, tanggal_akhir (tapi BUKAN tanggal_surat_XX)
        else if ((key.includes('jadwal_') || key.startsWith('tanggal_awal_') || key.startsWith('tanggal_akhir_')) &&
            !key.startsWith('tanggal_surat_') && !key.startsWith('tanggal_bulan_tahun_') &&
            !key.startsWith('tanggal_sebut_')) {
            scheduleInfo[key] = value;
        }
        // Document Info: nomor_surat_XX, tanggal_surat_XX, format_tanggal_XX, hari_surat_XX, 
        // tanggal_bulan_tahun_XX, tanggal_sebut_XX, bulan_sebut_XX, tahun_sebut_XX
        else if (key.startsWith('nomor_surat_') || key.startsWith('tanggal_surat_') ||
            key.startsWith('format_tanggal_') || key.startsWith('hari_surat_') ||
            key.startsWith('tanggal_bulan_tahun_') || key.startsWith('tanggal_sebut_') ||
            key.startsWith('bulan_sebut_') || key.startsWith('tahun_sebut_')) {
            documentInfo[key] = value;
        }
        // Basic Info: kode, tahun, nama_paket, klpd, unit_organisasi, balai, satuan_kerja, 
        // kegiatan, jenis_pengadaan, metode_pengadaan, sumber_dana, nilai, terbilang, dll
        else if (key.startsWith('nilai_') || key.startsWith('terbilang_') ||
            key === 'kode_pokja' || key === 'tahun_anggaran' || key === 'tahun_surat' ||
            key === 'nama_paket' || key === 'klpd' || key === 'unit_organisasi' ||
            key === 'balai' || key === 'satuan_kerja' || key === 'kegiatan' ||
            key === 'jenis_pengadaan' || key === 'metode_pengadaan' || key === 'sumber_dana' ||
            key === 'kode_tender' || key === 'nomor_sk_pokja' || key === 'tanggal_sk_pokja') {
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
        content += '<div class="mb-4"><h6 class="text-primary border-bottom pb-2"><i class="fas fa-users me-2"></i>POKJA</h6>';
        Object.entries(pokjaInfo).forEach(([key, value]) => {
            content += `<div class="mb-1"><code class="text-success">{${key}}</code>: <span class="text-dark">${value || '<em class="text-muted">kosong</em>'}</span></div>`;
        });
        content += '</div>';
    }

    // Schedule Section (Jadwal Tahapan)
    if (Object.keys(scheduleInfo).length > 0) {
        content += '<div class="mb-4"><h6 class="text-primary border-bottom pb-2"><i class="fas fa-calendar-alt me-2"></i>Jadwal Tahapan</h6>';
        content += '<small class="text-muted d-block mb-2">Format: jadwal_awal_X (dengan waktu), tanggal_awal_X (tanpa waktu), jadwal_awal_X_iso (ISO format)</small>';
        content += '<details><summary class="text-muted" style="cursor: pointer;">Klik untuk melihat detail dokumen (banyak)</summary>';

        // Group by placeholder name
        const scheduleGroups = {};
        Object.entries(scheduleInfo).forEach(([key, value]) => {
            // Extract placeholder name (e.g., "prakualifikasi" from "jadwal_awal_prakualifikasi")
            const match = key.match(/^(jadwal_awal_|jadwal_akhir_|tanggal_awal_|tanggal_akhir_)(.+?)(_iso)?$/);
            if (match) {
                const placeholderName = match[2];
                if (!scheduleGroups[placeholderName]) {
                    scheduleGroups[placeholderName] = {};
                }
                scheduleGroups[placeholderName][key] = value;
            }
        });

        // Display grouped by placeholder name
        Object.entries(scheduleGroups).forEach(([placeholderName, items]) => {
            content += `<div class="mb-3 p-2 bg-light rounded"><strong class="text-uppercase">${placeholderName}</strong>`;
            Object.entries(items).forEach(([key, value]) => {
                content += `<div class="ms-3 mb-1"><code class="text-success">{${key}}</code>: <span class="text-dark">${value || '<em class="text-muted">kosong</em>'}</span></div>`;
            });
            content += '</div>';
        });
        content += '</div>';
    }

    // Document Information Section
    if (Object.keys(documentInfo).length > 0) {
        content += '<div class="mb-4"><h6 class="text-primary border-bottom pb-2"><i class="fas fa-file-alt me-2"></i>Informasi Dokumen</h6>';
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
    e.preventDefault();

    // Validate master folder selection
    if (!masterFolderData || !masterFolderData.documents) {
        showToast('Pilih dan validasi master folder terlebih dahulu', 'error');
        return;
    }

    const availableDocs = masterFolderData.documents.filter(doc => doc.available);
    if (availableDocs.length === 0) {
        showToast('Tidak ada dokumen yang tersedia di master folder', 'error');
        return;
    }

    // Collect selected documents
    const selectedDocuments = collectSelectedDocuments();

    console.log('DEBUG - Selected documents:', selectedDocuments);
    console.log('DEBUG - Available documents:', availableDocs.map(d => d.id));

    // Validate at least one document is selected
    if (selectedDocuments.length === 0) {
        showToast('Pilih minimal 1 dokumen untuk diproses (centang checkbox)', 'warning');
        return;
    }

    const formData = new FormData(this);
    const keywords = collectAllKeywords(formData);
    formData.append('keywords', JSON.stringify(keywords));
    formData.append('deleted_documents', JSON.stringify([...deletedDocuments]));
    formData.append('selected_documents', JSON.stringify(selectedDocuments));
    formData.append('master_folder_data', JSON.stringify(masterFolderData));

    // Add keywords to delete rows (if balai delete is enabled)
    const keywordsToDeleteRows = [];
    if (document.getElementById('balai_delete_flag').value === 'true') {
        keywordsToDeleteRows.push('balai');
    }
    formData.append('keywords_to_delete_rows', JSON.stringify(keywordsToDeleteRows));

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
                showResults(data, keywords);
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
function showResults(data, keywords) {
    let content = '<div class="results-content">';

    if (data.files && data.files.length > 0) {
        content += '<div class="text-center mb-4">';
        content += '<h5>Dokumen berhasil diproses:</h5>';
        content += '<a href="/download_results" class="btn btn-success btn-lg mb-3"><i class="fas fa-download me-2"></i> Download Semua Hasil</a>';
        content += '</div>';

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
        // Add query parameters for zip naming
        const kodePokja = keywords && keywords.kode_pokja ? keywords.kode_pokja : '';
        const namaPaket = keywords && keywords.nama_paket ? keywords.nama_paket : '';
        const downloadUrl = `/download_results?kode_pokja=${encodeURIComponent(kodePokja)}&nama_paket=${encodeURIComponent(namaPaket)}`;
        content += `<a href="${downloadUrl}" class="btn btn-success btn-lg"><i class="fas fa-download me-2"></i> Download Semua Hasil</a>`;
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

// Gather all form data for save/export
function getAllFormData() {
    const data = {};
    const form = document.getElementById('baForm');
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

    // Save POKJA selections (as JSON string values from selects)
    data.pokja_ketua_selection = document.getElementById('ketua_pokja')?.value || '';
    data.pokja_sekre_selection = document.getElementById('sekre_pokja')?.value || '';
    data.pokja_anggota3_selection = document.getElementById('anggota3_select')?.value || '';
    data.pokja_anggota4_selection = document.getElementById('anggota4_select')?.value || '';
    data.pokja_anggota5_selection = document.getElementById('anggota5_select')?.value || '';

    // Save custom variables map
    const customVars = {};
    document.querySelectorAll('#custom_variables .custom-variable').forEach((container, idx) => {
        const nameInput = container.querySelector('input[name^="custom_var_name_"]');
        const valueInput = container.querySelector('input[name^="custom_var_value_"]');
        const name = nameInput?.value?.trim();
        const value = valueInput?.value ?? '';
        if (name) customVars[name] = value;
    });
    data.custom_variables = customVars;

    // Save deleted documents
    data.deleted_documents = Array.from(deletedDocuments);

    // Save schedule data (jadwal tahapan)
    if (scheduleData && scheduleData.length > 0) {
        data.schedule_data = scheduleData;
    }

    // Metadata
    data._metadata = {
        custom_variable_count: Object.keys(customVars).length,
        schedule_count: scheduleData ? scheduleData.length : 0
    };

    return data;
}

// Set all form data
function setAllFormData(data) {
    if (!data) return;

    // Set basic form fields
    Object.keys(data).forEach(key => {
        if (key.startsWith('_') || key === 'custom_variables' || key === 'deleted_documents' || key === 'document_selections') {
            return; // Skip metadata and special fields
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

    // Restore custom variables
    if (data.custom_variables) {
        // Clear existing custom variables first
        document.querySelectorAll('[id^="custom_var_container_"]').forEach(container => {
            container.remove();
        });
        customVariableCount = 0;

        // Add custom variables
        Object.keys(data.custom_variables).forEach(varName => {
            addCustomVariable();
            const lastIndex = customVariableCount;
            document.getElementById(`custom_var_name_${lastIndex}`).value = varName;
            document.getElementById(`custom_var_value_${lastIndex}`).value = data.custom_variables[varName];
        });
    }

    // Restore deleted documents
    if (data.deleted_documents) {
        deletedDocuments = new Set(data.deleted_documents);
        updateDocumentTable();
    }

    // Restore schedule data (jadwal tahapan)
    if (data.schedule_data && Array.isArray(data.schedule_data)) {
        scheduleData = data.schedule_data;

        // Show summary if schedule data exists
        if (scheduleData.length > 0) {
            document.getElementById('jadwalCount').textContent = scheduleData.length;
            document.getElementById('jadwalSummary').style.display = 'block';

            // IMPORTANT: Generate preview so user can edit mapping
            // This populates the preview area in the modal
            displaySchedulePreview();

            console.log('Schedule data restored:', scheduleData.length, 'items');
        }
    }

    // Restore document selections
    if (data.document_selections) {
        data.document_selections.forEach(doc => {
            const checkbox = document.querySelector(`input[value="${doc.code}"]`);
            if (checkbox) {
                checkbox.checked = doc.checked;
            }
        });
    }

    // Restore POKJA selections
    if (data.pokja_ketua_selection) {
        document.getElementById('ketua_pokja').value = data.pokja_ketua_selection;
    }
    if (data.pokja_sekre_selection) {
        document.getElementById('sekre_pokja').value = data.pokja_sekre_selection;
    }
    if (data.pokja_anggota3_selection !== undefined) {
        const el = document.getElementById('anggota3_select');
        if (el) el.value = data.pokja_anggota3_selection || '';
    }
    if (data.pokja_anggota4_selection !== undefined) {
        const el = document.getElementById('anggota4_select');
        if (el) el.value = data.pokja_anggota4_selection || '';
    }
    if (data.pokja_anggota5_selection !== undefined) {
        const el = document.getElementById('anggota5_select');
        if (el) el.value = data.pokja_anggota5_selection || '';
    }

    // Update POKJA table
    updatePokjaTable();

    // Update metadata counters if available
    if (data._metadata) {
        if (data._metadata.pokja_member_count !== undefined) {
            pokjaMemberCount = Math.min(data._metadata.pokja_member_count, 5);
        }
        customVariableCount = data._metadata.custom_variable_count || 0;
    }
}

// Master Folder Functions
let masterFolderData = null;
let availableDocuments = []; // Store available documents from quick listing

async function selectMasterFolder() {
    const folderPath = prompt('Masukkan path folder master template:', '.\\Master Folder\\Master BA Pokja Konsultan');

    if (!folderPath) return;

    document.getElementById('masterFolderPath').value = folderPath;

    // Auto-validate folder immediately
    showToast('Memvalidasi folder...', 'info');

    try {
        const response = await fetch('/api/validate_master_pokja_konsultan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ folder_path: folderPath })
        });

        const data = await response.json();

        if (data.success) {
            masterFolderData = data;
            updateValidationStatus(data);
            showDocumentList(data.documents);
            showSelectedDocumentsSection(data);
            showToast(`${data.total_available}/${data.total_expected} dokumen ditemukan`, 'success');
        } else {
            showToast('Gagal memvalidasi folder: ' + (data.message || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Error validating folder:', error);
        showToast('Error: ' + error.message, 'error');
    }
}

function updateCheckboxAvailability(availableFiles) {
    // Get list of available document codes from files
    // Files have codes like "00", "06", "22-lhp", "27-1", "27-2"
    const availableCodes = availableFiles.map(f => {
        // Normalize the code: replace hyphens with underscores to match checkbox values
        return f.code.toLowerCase().replace(/-/g, '_');
    });

    console.log('Available document codes (normalized):', availableCodes);

    // Update each checkbox based on availability
    document.querySelectorAll('.doc-checkbox').forEach(checkbox => {
        const docValue = checkbox.value.toLowerCase(); // This is like "00", "06", "22_lhp", "27_2"
        const row = checkbox.closest('tr');

        // Check if this document code is in available list
        const isAvailable = availableCodes.includes(docValue);

        if (isAvailable) {
            // Document exists - enable checkbox
            checkbox.disabled = false;
            row.style.opacity = '1';
            row.style.backgroundColor = '';
            row.title = 'Dokumen tersedia di folder';
        }
        //else {
        // Document doesn't exist - disable checkbox and uncheck
        //  checkbox.disabled = true;
        //  checkbox.checked = false;
        //  row.style.opacity = '0.6';
        //  row.style.backgroundColor = '#f8f9fa';
        //  row.title = 'Dokumen tidak tersedia di folder';
        //}
    });

    // Update counter and select all checkbox state
    toggleAllDocuments(document.getElementById('selectAllDocs').checked);

    // Show summary
    const totalDocs = document.querySelectorAll('.doc-checkbox').length;
    const availableDocs = document.querySelectorAll('.doc-checkbox:not(:disabled)').length;
    const unavailableDocs = totalDocs - availableDocs;

    console.log(`Total: ${totalDocs}, Available: ${availableDocs}, Unavailable: ${unavailableDocs}`);
}

// Checkbox management functions
function toggleAllDocuments(checked) {
    // Only toggle enabled checkboxes
    document.querySelectorAll('.doc-checkbox:not(:disabled)').forEach(cb => {
        cb.checked = checked;
    });
}

function collectSelectedDocuments() {
    // Collect only checked and enabled checkboxes
    const checkboxes = document.querySelectorAll('.doc-checkbox:checked:not(:disabled)');
    return Array.from(checkboxes).map(cb => cb.value);
}

function validateMasterFolder() {
    const folderPath = document.getElementById('masterFolderPath').value;
    if (!folderPath) {
        showToast('Pilih folder terlebih dahulu', 'error');
        return;
    }

    // Show loading
    const validateBtn = document.getElementById('validateBtn');
    const originalText = validateBtn.innerHTML;
    validateBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Validating...';
    validateBtn.disabled = true;

    fetch('/api/validate_master_pokja_konsultan', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ folder_path: folderPath })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                masterFolderData = data;
                updateValidationStatus(data);
                showDocumentList(data.documents);
                showSelectedDocumentsSection(data);
                showToast(`Validasi berhasil: ${data.total_available}/${data.total_expected} dokumen ditemukan`, 'success');
            } else {
                throw new Error(data.message);
            }
        })
        .catch(error => {
            console.error('Error validating folder:', error);
            showToast('Gagal memvalidasi folder: ' + error.message, 'error');
        })
        .finally(() => {
            validateBtn.innerHTML = originalText;
            validateBtn.disabled = false;
        });
}

function updateValidationStatus(data) {
    const statusElement = document.getElementById('validationStatus');
    const countElement = document.getElementById('documentCount');

    countElement.textContent = `${data.total_available}/${data.total_expected} dokumen`;

    if (data.total_available === data.total_expected) {
        statusElement.className = 'badge bg-success';
        statusElement.textContent = 'Lengkap';
    } else if (data.total_available > 0) {
        statusElement.className = 'badge bg-warning';
        statusElement.textContent = 'Sebagian';
    } else {
        statusElement.className = 'badge bg-danger';
        statusElement.textContent = 'Kosong';
    }
}

function showDocumentList(documents) {
    const documentGrid = document.getElementById('documentGrid');
    const documentList = document.getElementById('documentList');

    documentGrid.innerHTML = '';

    documents.forEach(doc => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-2';

        const statusIcon = doc.available ?
            '<i class="fas fa-check-circle text-success me-2"></i>' :
            '<i class="fas fa-times-circle text-danger me-2"></i>';

        col.innerHTML = `
                    <div class="card border-0 ${doc.available ? 'bg-light-success' : 'bg-light-danger'}" style="font-size: 0.85rem;">
                        <div class="card-body py-2 px-3">
                            <div class="d-flex align-items-center">
                                ${statusIcon}
                                <div class="flex-grow-1">
                                    <div class="fw-semibold">${doc.type}</div>
                                    <small class="text-muted">${doc.name}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

        documentGrid.appendChild(col);
    });

    documentList.style.display = 'block';
}

function showSelectedDocumentsSection(data) {
    const section = document.getElementById('selectedDocumentsSection');
    const folderPathSpan = document.getElementById('selectedFolderPath');
    const documentsList = document.getElementById('selectedDocumentsList');

    folderPathSpan.textContent = data.folder_path;
}

// Save to localStorage
function saveToLocal() {
    try {
        const data = getAllFormData();
        localStorage.setItem('ba_pokja_konsultan_defaults', JSON.stringify(data));

        // Show success message with details
        let message = 'Data berhasil disimpan ke localStorage';
        if (data._metadata && data._metadata.schedule_count > 0) {
            message += ` (termasuk ${data._metadata.schedule_count} jadwal tahapan)`;
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
        const data = localStorage.getItem('ba_pokja_konsultan_defaults');
        if (data) {
            const parsedData = JSON.parse(data);
            setAllFormData(parsedData);

            // Show success message with details
            let message = 'Data berhasil dimuat dari localStorage';
            if (parsedData._metadata && parsedData._metadata.schedule_count > 0) {
                message += ` (termasuk ${parsedData._metadata.schedule_count} jadwal tahapan)`;
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
        const filename = `isian_BA_Pokja_Konsultan_defaults_${timestamp}.json`;

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Show success message with details
        let message = 'Data berhasil diekspor ke file: ' + filename;
        if (data._metadata && data._metadata.schedule_count > 0) {
            message += ` (termasuk ${data._metadata.schedule_count} jadwal tahapan)`;
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
            console.log('📥 Importing data from file:', file.name);
            console.log('📋 POKJA selections in file:', {
                ketua: data.pokja_ketua_selection ? 'Yes' : 'No',
                sekre: data.pokja_sekre_selection ? 'Yes' : 'No',
                anggota3: data.pokja_anggota3_selection ? 'Yes' : 'No',
                anggota4: data.pokja_anggota4_selection ? 'Yes' : 'No',
                anggota5: data.pokja_anggota5_selection ? 'Yes' : 'No'
            });

            setAllFormData(data);

            // Show success message with details
            let message = 'Data berhasil diimport dari file: ' + file.name;
            if (data._metadata && data._metadata.schedule_count > 0) {
                message += ` (termasuk ${data._metadata.schedule_count} jadwal tahapan)`;
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
        const localData = localStorage.getItem('ba_pokja_konsultan_defaults');
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

// Initialize defaults panel
document.addEventListener('DOMContentLoaded', function () {
    updateSavedDefaultsList();
});

// ========== JADWAL FUNCTIONS ==========

// Store schedule data globally
let scheduleData = [];

// Default mapping: schedule phase name pattern -> document number(s)
// Based on standard procurement workflow
// Format: 'pattern': 'docNum' atau 'pattern': ['docNum1', 'docNum2']
const defaultScheduleMapping = {
    // Doc 06 - BA Pemberian Penjelasan Kualifikasi
    'penjelasan.*dokumen.*prakualifikasi': '06',

    // Doc 10 - BA Hasil Evaluasi Kualifikasi
    'evaluasi.*dokumen.*kualifikasi': '10',

    // Doc 11 - BA Penetapan Daftar Pendek
    'penetapan.*hasil.*kualifikasi': '11',

    // Doc 12 - Pengumuman Daftar Pendek
    'pengumuman.*hasil.*prakualifikasi': '12',

    // Doc 13 - BA Jawab Sanggah Prakualifikasi
    'masa.*sanggah.*prakualifikasi': '13',

    // Doc 14 - BA Pemberian Penjelasan Seleksi
    'pemberian.*penjelasan': '14',

    // Doc 17 - BA Hasil Evaluasi Admin Dan Teknis
    'administrasi.*dan.*teknis': '17',

    // Doc 19 & 20 - BA Evaluasi Biaya (multiple docs)
    'harga': ['19', '20'],

    // Doc 22 & 24 - BA Penetapan Pemenang (multiple docs)
    'penetapan.*pemenang': ['22', '24'],

    // Doc 25 - BA Pengumuman Pemenang
    'pengumuman.*pemenang': '25',

    // Doc 26 - BA Jawab Sanggah Seleksi
    'masa.*sanggah(?!.*prakualifikasi)': '26',

    // Doc 27, 28, 29 - BA Klarifikasi Dan Negosiasi (multiple docs)
    'klarifikasi.*dan.*negosiasi': ['27', '27-2', '28', '29'],
};

// Default date type for each document (awal or akhir)
// If not specified here, defaults to 'akhir'
const defaultDateType = {
    '00': 'awal',     // Cover - tanggal awal
    '06': 'akhir',    // BA Penjelasan Kualifikasi
    '10': 'akhir',    // BA Evaluasi Kualifikasi
    '11': 'akhir',    // BA Penetapan Daftar Pendek
    '12': 'akhir',    // Pengumuman Daftar Pendek
    '13': 'akhir',    // BA Sanggah Prakualifikasi
    '14': 'akhir',    // BA Penjelasan Seleksi
    '17': 'akhir',    // BA Evaluasi Admin
    '19': 'akhir',    // BA Evaluasi Biaya
    '20': 'akhir',    // BA Kombinasi
    '21': 'akhir',    // Surat Klarifikasi
    '22': 'akhir',    // BA Klarifikasi Penetapan
    '22-LHP': 'akhir', // LHP
    '24': 'akhir',    // BA Penetapan Pemenang
    '25': 'akhir',    // BA Pengumuman Pemenang
    '26': 'akhir',    // BA Sanggah Seleksi
    '27': 'akhir',    // BA Klarifikasi Negosiasi
    '27-2': 'akhir',  // Daftar Hadir
    '28': 'akhir',    // BA Hasil Pemilihan
    '29': 'akhir',    // Surat Pengiriman
    '96': 'awal',     // Surat pernyataan
    '97': 'akhir',    // BA Seleksi Gagal
    '99': 'awal',     // TTD Pokja
};

// Function to suggest document number(s) based on phase name
// Returns array of document numbers
function suggestDocNumber(phaseName) {
    if (!phaseName) return [];

    const lowerPhase = phaseName.toLowerCase();

    // Check each pattern in order (more specific patterns first)
    for (const [pattern, docNum] of Object.entries(defaultScheduleMapping)) {
        const regex = new RegExp(pattern, 'i');
        if (regex.test(lowerPhase)) {
            // Return as array, whether it's single or multiple
            return Array.isArray(docNum) ? docNum : [docNum];
        }
    }

    return []; // No match found
}

// Parse Indonesian date: "20 Agustus 2025 17:00" -> "2025-08-20"
function parseIndonesianDate(dateStr) {
    const monthMap = {
        'januari': '01', 'februari': '02', 'maret': '03', 'april': '04',
        'mei': '05', 'juni': '06', 'juli': '07', 'agustus': '08',
        'september': '09', 'oktober': '10', 'november': '11', 'desember': '12'
    };

    try {
        // Extract date part (remove time if exists)
        const datePart = dateStr.split(/\s+\d{2}:/)[0].trim();

        // Parse "20 Agustus 2025"
        const parts = datePart.split(/\s+/);
        if (parts.length < 3) return '';

        const day = parts[0].padStart(2, '0');
        const month = monthMap[parts[1].toLowerCase()] || '';
        const year = parts[2];

        if (!month) return '';
        return `${year}-${month}-${day}`;
    } catch (e) {
        return '';
    }
}

// Sanitize phase name to create placeholder
function sanitizePlaceholderName(phaseName) {
    return phaseName
        .toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove special chars
        .replace(/\s+/g, '_')     // Replace spaces with underscore
        .replace(/_+/g, '_')      // Replace multiple underscores with single
        .replace(/^_|_$/g, '');   // Remove leading/trailing underscores
}

// Fetch jadwal from SPSE INAPROC website
async function fetchFromSPSE() {
    // Get kode tender from main form
    const kodeTender = document.getElementById('kode_tender').value.trim();

    if (!kodeTender) {
        showToast('Harap isi Kode Tender di form utama terlebih dahulu', 'warning');
        // Scroll to kode tender field
        document.getElementById('kode_tender').scrollIntoView({ behavior: 'smooth', block: 'center' });
        document.getElementById('kode_tender').focus();
        return;
    }

    // Show loading state
    const button = event.target.closest('button');
    const originalHTML = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching...';

    try {
        const response = await fetch('/api/crawl_spse_jadwal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                kode_tender: kodeTender
            })
        });

        const data = await response.json();

        if (data.success) {
            // Put formatted text into textarea
            document.getElementById('jadwalPasteArea').value = data.formatted_text;

            // Auto-parse the table
            parseScheduleTable();

            showToast(`Berhasil fetch ${data.total_tahapan} tahapan dari SPSE`, 'success');
        } else {
            showToast('Gagal: ' + (data.error || 'Terjadi kesalahan'), 'danger');
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

// Parse schedule table from paste
function parseScheduleTable() {
    const textarea = document.getElementById('jadwalPasteArea');
    const text = textarea.value.trim();

    if (!text) {
        showToast('Harap paste tabel jadwal terlebih dahulu', 'warning');
        return;
    }

    const lines = text.split('\n');
    const parsed = [];

    for (let line of lines) {
        // Skip empty lines
        if (!line.trim()) continue;

        // Split by tab or multiple spaces
        const cols = line.split(/\t+|\s{2,}/).filter(col => col.trim());

        // Need at least 5 columns: No, Tahap, Mulai, Sampai, Perubahan
        if (cols.length < 4) continue;

        const no = cols[0].trim();
        const tahap = cols[1].trim();
        const mulai = cols[2].trim();
        const sampai = cols[3].trim();
        const perubahan = cols[4] ? cols[4].trim() : '';

        // Skip header row
        if (no.toLowerCase() === 'no' || tahap.toLowerCase() === 'tahap') continue;

        // Generate placeholder name
        const placeholderName = sanitizePlaceholderName(tahap);

        // Parse dates
        const mulaiDate = parseIndonesianDate(mulai);
        const sampaiDate = parseIndonesianDate(sampai);

        parsed.push({
            no: no,
            tahap: tahap,
            mulai: mulai,
            mulaiDate: mulaiDate,
            sampai: sampai,
            sampaiDate: sampaiDate,
            perubahan: perubahan,
            placeholderName: placeholderName
        });
    }

    if (parsed.length === 0) {
        showToast('Tidak ada data yang valid. Pastikan format tabel benar (5 kolom).', 'warning');
        return;
    }

    // Store globally
    scheduleData = parsed;

    // Show preview
    displaySchedulePreview();

    showToast(`Berhasil parse ${parsed.length} tahapan`, 'success');
}

// Display schedule preview in modal
function displaySchedulePreview() {
    const previewDiv = document.getElementById('jadwalPreview');

    let html = `
                <h6 class="mb-3"><i class="fas fa-calendar-alt"></i> Preview Jadwal Tahapan</h6>
                <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
                    <table class="table table-sm table-bordered">
                        <thead class="table-light sticky-top">
                            <tr>
                                <th style="width: 50px;">No</th>
                                <th style="width: 250px;">Tahap</th>
                                <th style="width: 180px;">Placeholder</th>
                                <th style="width: 130px;">Mulai</th>
                                <th style="width: 130px;">Sampai</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

    scheduleData.forEach((item, idx) => {
        html += `
                    <tr>
                        <td class="text-center">${item.no}</td>
                        <td><small>${item.tahap}</small></td>
                        <td>
                            <input type="text" class="form-control form-control-sm" 
                                   id="placeholder_${idx}" 
                                   value="${item.placeholderName}" 
                                   onchange="updatePlaceholderName(${idx}, this.value)">
                        </td>
                        <td><small class="${item.mulaiDate ? 'text-success' : 'text-danger'}">${item.mulai}</small></td>
                        <td><small class="${item.sampaiDate ? 'text-success' : 'text-danger'}">${item.sampai}</small></td>
                    </tr>
                `;
    });

    html += `
                        </tbody>
                    </table>
                </div>
                
                <hr class="my-4">
                
                <!-- Document Mapping Table -->
                <h6 class="mb-3"><i class="fas fa-link"></i> Mapping Dokumen ke Tahapan</h6>
                <div class="alert alert-info mb-3">
                    <i class="fas fa-info-circle"></i> 
                    <small>Pilih tahapan yang akan mengisi tanggal dokumen. Beberapa dokumen sudah dipilih otomatis.</small>
                </div>
                <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                    <table class="table table-sm table-bordered">
                        <thead class="table-light sticky-top">
                            <tr>
                                <th style="width: 80px;">Doc No</th>
                                <th style="width: 300px;">Nama Dokumen</th>
                                <th style="width: 250px;">Tahapan</th>
                                <th style="width: 120px;">Tanggal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${generateDocumentMappingRows()}
                        </tbody>
                    </table>
                </div>
                
                <div class="mt-3 text-end">
                    <button type="button" class="btn btn-success" onclick="applySchedule()">
                        <i class="fas fa-check"></i> Terapkan Jadwal
                    </button>
                </div>
            `;

    previewDiv.innerHTML = html;
}

// Generate document number options for dropdown with default selection
function generateDocNumberOptions(selectedDoc = '') {
    const docInfo = {
        '00': 'Cover',
        '06': 'Berita Acara Pemberian Penjelasan Kualifikasi',
        '10': 'Berita Acara Hasil Evaluasi Kualifikasi',
        '11': 'Berita Acara Penetapan Daftar Pendek',
        '12': 'Pengumuman Daftar Pendek',
        '13': 'Berita Acara Jawab Sanggah Prakualifikasi',
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
        '29': 'Surat Pengiriman BAHP',
        '96': 'Surat pernyataan klarifikasi personil dan paket 1 dan 2',
        '97': 'Berita Acara Seleksi Gagal',
        '99': 'TTD Pokja'
    };

    const docNumbers = ['00', '06', '10', '11', '12', '13', '14', '17', '19', '20', '21', '22', '22-LHP', '24', '25', '26', '27', '27-2', '28', '29', '96', '97', '99'];
    return docNumbers.map(num => {
        const selected = (num === selectedDoc) ? 'selected' : '';
        const name = docInfo[num] || 'Unknown';
        return `<option value="${num}" ${selected}>${num} - ${name}</option>`;
    }).join('');
}

// Get document info
function getDocumentInfo() {
    return {
        '00': 'Cover',
        '06': 'Berita Acara Pemberian Penjelasan Kualifikasi',
        '10': 'Berita Acara Hasil Evaluasi Kualifikasi',
        '11': 'Berita Acara Penetapan Daftar Pendek',
        '12': 'Pengumuman Daftar Pendek',
        '13': 'Berita Acara Jawab Sanggah Prakualifikasi',
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
        '29': 'Surat Pengiriman BAHP',
        '96': 'Surat pernyataan klarifikasi personil dan paket 1 dan 2',
        '97': 'Berita Acara Seleksi Gagal',
        '99': 'TTD Pokja'
    };
}

// Generate document mapping rows
function generateDocumentMappingRows() {
    const docInfo = getDocumentInfo();
    const docNumbers = ['00', '06', '10', '11', '12', '13', '14', '17', '19', '20', '21', '22', '22-LHP', '24', '25', '26', '27', '27-2', '28', '29', '96', '97', '99'];

    let html = '';

    docNumbers.forEach(docNum => {
        // Find suggested phase for this document
        const suggestedPhaseIdx = findPhaseForDocument(docNum);
        const hasAuto = suggestedPhaseIdx !== null;

        // Get default date type for this document
        const defaultDate = defaultDateType[docNum] || 'akhir';

        html += `
                    <tr>
                        <td class="text-center">
                            <strong>${docNum}</strong>
                            ${hasAuto ? '<br><small class="text-primary"><i class="fas fa-magic"></i> Auto</small>' : ''}
                        </td>
                        <td><small>${docInfo[docNum]}</small></td>
                        <td>
                            <select class="form-select form-select-sm" id="docmap_${docNum.replace('-', '_')}">
                                <option value="">-- Tidak diisi otomatis --</option>
                                ${generatePhaseOptions(suggestedPhaseIdx)}
                            </select>
                        </td>
                        <td>
                            <select class="form-select form-select-sm" id="docdate_${docNum.replace('-', '_')}">
                                <option value="akhir" ${defaultDate === 'akhir' ? 'selected' : ''}>Tanggal Akhir</option>
                                <option value="awal" ${defaultDate === 'awal' ? 'selected' : ''}>Tanggal Awal</option>
                            </select>
                        </td>
                    </tr>
                `;
    });

    return html;
}

// Generate phase options for dropdown
function generatePhaseOptions(selectedIdx = null) {
    let html = '';
    scheduleData.forEach((item, idx) => {
        const selected = (idx === selectedIdx) ? 'selected' : '';
        html += `<option value="${idx}" ${selected}>${item.no}. ${item.tahap}</option>`;
    });
    return html;
}

// Find suggested phase index for a document
function findPhaseForDocument(docNum) {
    // Reverse lookup: find phase that matches this document
    for (let idx = 0; idx < scheduleData.length; idx++) {
        const item = scheduleData[idx];
        const suggestedDocs = suggestDocNumber(item.tahap);

        // Check if docNum is in the suggested docs array
        if (suggestedDocs.includes(docNum)) {
            return idx;
        }
    }
    return null;
}

// Update placeholder name in stored data
function updatePlaceholderName(idx, newName) {
    if (scheduleData[idx]) {
        scheduleData[idx].placeholderName = sanitizePlaceholderName(newName);
    }
}

// Apply schedule: generate keywords and optionally auto-fill document dates
function applySchedule() {
    if (scheduleData.length === 0) {
        showToast('Tidak ada data jadwal untuk diterapkan', 'warning');
        return;
    }

    // Apply document date mappings from new mapping table
    const docNumbers = ['00', '06', '10', '11', '12', '13', '14', '17', '19', '20', '21', '22', '22-LHP', '24', '25', '26', '27', '27-2', '28', '29', '96', '97', '99'];
    let mappedCount = 0;

    docNumbers.forEach(docNum => {
        const normalizedDocNum = docNum.replace('-', '_');
        const phaseSelect = document.getElementById(`docmap_${normalizedDocNum}`);
        const dateSelect = document.getElementById(`docdate_${normalizedDocNum}`);

        if (phaseSelect && dateSelect) {
            const phaseIdx = phaseSelect.value;
            const dateType = dateSelect.value; // 'awal' or 'akhir'

            if (phaseIdx !== '' && scheduleData[phaseIdx]) {
                const phase = scheduleData[phaseIdx];
                const dateValue = dateType === 'awal' ? phase.mulaiDate : phase.sampaiDate;

                if (dateValue) {
                    // Auto-fill the format_tanggal_XX field
                    const dateInput = document.querySelector(`input[name="format_tanggal_${normalizedDocNum}"]`);
                    if (dateInput) {
                        dateInput.value = dateValue;
                        mappedCount++;
                    }
                }
            }
        }
    });

    // Show summary
    document.getElementById('jadwalCount').textContent = scheduleData.length;
    document.getElementById('jadwalSummary').style.display = 'block';

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('jadwalModal'));
    modal.hide();

    const message = `${scheduleData.length} tahapan berhasil diterapkan!` +
        (mappedCount > 0 ? ` ${mappedCount} dokumen ter-mapping otomatis.` : '');
    showToast(message, 'success');
}

// Clear schedule data
function clearJadwal() {
    if (confirm('Hapus semua data jadwal yang telah diimport?')) {
        scheduleData = [];
        document.getElementById('jadwalSummary').style.display = 'none';
        showToast('Data jadwal dihapus', 'info');
    }
}

// Clear modal when it opens
document.getElementById('jadwalModal').addEventListener('show.bs.modal', function () {
    // If we have existing schedule data, show the preview
    if (scheduleData.length > 0) {
        displaySchedulePreview();
        console.log('Modal opened with existing data, displaying preview');
    } else {
        // Clear for fresh input
        document.getElementById('jadwalPasteArea').value = '';
        document.getElementById('jadwalPreview').innerHTML = '<p class="text-muted text-center">Paste tabel dan klik "Parse Table" untuk melihat preview</p>';
    }
});