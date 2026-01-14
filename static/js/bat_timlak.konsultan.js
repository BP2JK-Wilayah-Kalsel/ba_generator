let pokjaMemberCount = 0;
let customVariableCount = 0;
let deletedDocuments = new Set();

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

// Global variable to store pending data restore
let pendingDataRestore = null;

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

        // If there's pending data restore, apply it now
        if (pendingDataRestore) {
            console.log('🔄 Applying pending data restore after CSV load...');
            setTimeout(() => {
                restoreMemberSelections(pendingDataRestore);
                pendingDataRestore = null;
            }, 100); // Small delay to ensure DOM is ready
        }

    } catch (error) {
        console.error('❌ Error loading CSV:', error);
        console.log('📋 Using default members as fallback');
        // Fallback to default members if CSV fails
        pokjaMembers = getDefaultPokjaMembers();
        timlakMembers = getDefaultTimlakMembers();
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

// Restore POKJA and TIMLAK selections after CSV is loaded
function restoreMemberSelections(data) {
    console.log('🔧 Restoring member selections...');

    let restoredPokja = 0;
    let restoredTimlak = 0;

    // Restore POKJA selections
    if (data.pokja_ketua_selection) {
        const ketuaSelect = document.getElementById('ketua_pokja');
        if (ketuaSelect) {
            ketuaSelect.value = data.pokja_ketua_selection;
            if (ketuaSelect.value === data.pokja_ketua_selection) {
                restoredPokja++;
                console.log('  ✓ POKJA Ketua restored');
            }
        }
    }

    if (data.pokja_sekre_selection) {
        const sekreSelect = document.getElementById('sekre_pokja');
        if (sekreSelect) {
            sekreSelect.value = data.pokja_sekre_selection;
            if (sekreSelect.value === data.pokja_sekre_selection) {
                restoredPokja++;
                console.log('  ✓ POKJA Sekretaris restored');
            }
        }
    }

    for (let i = 3; i <= 5; i++) {
        const fieldName = `pokja_anggota${i}_selection`;
        if (data[fieldName]) {
            const el = document.getElementById(`anggota${i}_select`);
            if (el) {
                el.value = data[fieldName];
                if (el.value === data[fieldName]) {
                    restoredPokja++;
                    console.log(`  ✓ POKJA Anggota ${i - 2} restored`);
                }
            }
        }
    }

    // Restore TIMLAK selections
    if (data.timlak_ketua_selection) {
        const ketuaSelect = document.getElementById('ketua_timlak');
        if (ketuaSelect) {
            ketuaSelect.value = data.timlak_ketua_selection;
            if (ketuaSelect.value === data.timlak_ketua_selection) {
                restoredTimlak++;
                console.log('  ✓ TIMLAK Ketua restored');
            }
        }
    }

    if (data.timlak_sekre_selection) {
        const sekreSelect = document.getElementById('sekre_timlak');
        if (sekreSelect) {
            sekreSelect.value = data.timlak_sekre_selection;
            if (sekreSelect.value === data.timlak_sekre_selection) {
                restoredTimlak++;
                console.log('  ✓ TIMLAK Sekretaris restored');
            }
        }
    }

    if (data.timlak_anggota_selection) {
        const anggotaSelect = document.getElementById('anggota_timlak');
        if (anggotaSelect) {
            anggotaSelect.value = data.timlak_anggota_selection;
            if (anggotaSelect.value === data.timlak_anggota_selection) {
                restoredTimlak++;
                console.log('  ✓ TIMLAK Anggota restored');
            }
        }
    }

    // Update tables
    if (restoredPokja > 0) {
        updatePokjaTable();
    }
    if (restoredTimlak > 0) {
        updateTimlakTable(); // This will also update email representative dropdown
    }


    console.log(`✅ Members restored: ${restoredPokja} POKJA, ${restoredTimlak} TIMLAK`);
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

// Update email perwakilan TIMLAK dropdown
function updateEmailTimlakRepresentative() {
    const emailSelect = document.getElementById('email_timlak_representative');
    if (!emailSelect) return;

    const ketuaValue = document.getElementById('ketua_timlak').value;
    const sekreValue = document.getElementById('sekre_timlak').value;
    const anggotaValue = document.getElementById('anggota_timlak').value;

    // Save current selection
    const currentSelection = emailSelect.value;

    // Clear and rebuild options
    emailSelect.innerHTML = '<option value="">-- Pilih Email Perwakilan TIMLAK --</option>';

    const emails = [];

    // Add Ketua email
    if (ketuaValue) {
        try {
            const ketua = JSON.parse(ketuaValue);
            if (ketua.email && ketua.email !== '-') {
                emails.push({
                    email: ketua.email,
                    label: `${ketua.nama} (Ketua)`,
                    value: ketua.email
                });
            }
        } catch (e) {
            console.error('Error parsing ketua data for email:', e);
        }
    }

    // Add Sekretaris email
    if (sekreValue && sekreValue !== ketuaValue) {
        try {
            const sekre = JSON.parse(sekreValue);
            if (sekre.email && sekre.email !== '-') {
                emails.push({
                    email: sekre.email,
                    label: `${sekre.nama} (Sekretaris)`,
                    value: sekre.email
                });
            }
        } catch (e) {
            console.error('Error parsing sekre data for email:', e);
        }
    }

    // Add Anggota email
    if (anggotaValue && anggotaValue !== ketuaValue && anggotaValue !== sekreValue) {
        try {
            const anggota = JSON.parse(anggotaValue);
            if (anggota.email && anggota.email !== '-') {
                emails.push({
                    email: anggota.email,
                    label: `${anggota.nama} (Anggota)`,
                    value: anggota.email
                });
            }
        } catch (e) {
            console.error('Error parsing anggota data for email:', e);
        }
    }

    // Add options to select
    emails.forEach(item => {
        const option = document.createElement('option');
        option.value = item.value;
        option.textContent = item.label;
        emailSelect.appendChild(option);
    });

    // Restore previous selection if still available
    if (currentSelection && emails.some(e => e.value === currentSelection)) {
        emailSelect.value = currentSelection;
    } else if (emails.length > 0) {
        // Auto-select first email (Ketua by default)
        emailSelect.value = emails[0].value;
    }

    // Show warning if no emails available
    if (emails.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = '⚠️ Tidak ada email tersedia dari anggota TIMLAK';
        option.disabled = true;
        emailSelect.appendChild(option);
    }
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

// Update preview nomor surat (untuk yang manual/lengkap)
function updatePreviewNomor(docNum) {
    const input = document.getElementById(`nomor_timlak_${docNum}`);
    const preview = document.getElementById(`preview_nomor_${docNum}`);

    if (!input || !preview) return;

    let value = input.value.trim();
    if (!value) {
        preview.textContent = '';
        return;
    }

    // Replace placeholders dengan data dari form
    const kodePokja = document.getElementById('kode_pokja')?.value || '{kode_pokja}';
    const tahunAnggaran = document.getElementById('tahun_anggaran')?.value || '{tahun}';

    value = value.replace(/{kode_pokja}/g, kodePokja);
    value = value.replace(/{tahun}/g, tahunAnggaran);

    preview.textContent = `📄 Preview: ${value}`;
}

// Update template nomor surat (untuk yang pakai prefix/suffix)
function updateTemplateNomor(docNum, type) {
    const tahunAnggaran = document.getElementById('tahun_anggaran')?.value || new Date().getFullYear();
    let fullNomor = '';
    let displayText = '';

    if (type === 'MD') {
        // Memo Dinas: xxxx/MD/Bp2jk17/{tahun}
        const prefix = document.getElementById(`nomor_timlak_${docNum}_prefix`)?.value || '';
        fullNomor = prefix ? `${prefix}/MD/Bp2jk17/${tahunAnggaran}` : '';
        displayText = fullNomor;
    } else if (type === 'ND') {
        // Nota Dinas: xxxx/ND/Bp2jk17/{tahun}
        const prefix = document.getElementById(`nomor_timlak_${docNum}_prefix`)?.value || '';
        fullNomor = prefix ? `${prefix}/ND/Bp2jk17/${tahunAnggaran}` : '';
        displayText = fullNomor;
    } else if (type === 'SUFFIX') {
        // Suffix: PB0301-Bp2jk17/xxxx
        const suffix = document.getElementById(`nomor_timlak_${docNum}_suffix`)?.value || '';
        fullNomor = suffix ? `PB0301-Bp2jk17/${suffix}` : '';
        displayText = fullNomor;
    }

    // Update hidden input (untuk submit)
    const hiddenInput = document.getElementById(`nomor_timlak_${docNum}`);
    if (hiddenInput) {
        hiddenInput.value = fullNomor;
    }

    // Update preview
    const preview = document.getElementById(`preview_nomor_${docNum}`);
    if (preview) {
        preview.textContent = displayText ? `📄 ${displayText}` : '';
    }
}

// Initialize preview saat halaman load atau data berubah
function initializeNomorPreviews() {
    // Update semua preview untuk nomor manual
    ['01', '03', '04', '05', '08'].forEach(num => {
        updatePreviewNomor(num);
    });

    // Update semua preview untuk nomor template
    updateTemplateNomor('02', 'MD');
    updateTemplateNomor('06', 'SUFFIX');
    updateTemplateNomor('07', 'ND');

    // Update nomor undangan rapat
    updateNomorUndanganRapat();
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
    const tahunAnggaranInput = document.getElementById('tahun_anggaran');

    // Initialize nomor undangan rapat langsung saat page load
    updateNomorUndanganRapat();

    if (kodePokjaInput) {
        kodePokjaInput.addEventListener('input', initializeNomorPreviews);
    }

    if (tahunAnggaranInput) {
        tahunAnggaranInput.addEventListener('input', initializeNomorPreviews);
    }
});

// Preview document with replaced keywords
async function previewDocument(docCode) {
    console.log('[PREVIEW] Button clicked, docCode:', docCode);

    // Validate master folder selected
    const masterFolder = document.getElementById('masterFolderPath').value;
    console.log('[PREVIEW] Master folder:', masterFolder);

    if (!masterFolder) {
        alert('Pilih dan validasi master folder terlebih dahulu');
        return;
    }

    // Collect keywords
    const formData = new FormData(document.getElementById('baForm'));
    const keywords = collectAllKeywords(formData);
    console.log('[PREVIEW] Keywords collected:', Object.keys(keywords).length);

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

            // Show warnings if any (filter out minor style warnings)
            if (data.warnings && data.warnings.length > 0) {
                const importantWarnings = data.warnings.filter(w =>
                    !w.includes('Unrecognised paragraph style') &&
                    !w.includes('Unrecognised character style')
                );

                if (importantWarnings.length > 0) {
                    const warningsList = document.getElementById('previewWarningsList');
                    warningsList.innerHTML = importantWarnings.map(w => `<li>${w}</li>`).join('');
                    document.getElementById('previewWarnings').style.display = 'block';
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
        if (!deletedDocuments.has(num)) {
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

    // Save TIMLAK selections (as JSON string values from selects)
    data.timlak_ketua_selection = document.getElementById('ketua_timlak')?.value || '';
    data.timlak_sekre_selection = document.getElementById('sekre_timlak')?.value || '';
    data.timlak_anggota_selection = document.getElementById('anggota_timlak')?.value || '';

    // Save email perwakilan TIMLAK
    data.email_timlak_representative = document.getElementById('email_timlak_representative')?.value || '';

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

    // Metadata
    data._metadata = {
        custom_variable_count: Object.keys(customVars).length
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
    // Restore document selections
    if (data.document_selections) {
        data.document_selections.forEach(doc => {
            const checkbox = document.querySelector(`input[value="${doc.code}"]`);
            if (checkbox) {
                checkbox.checked = doc.checked;
            }
        });
    }

    // Restore POKJA and TIMLAK selections
    // Check if CSV is already loaded (both pokjaMembers and timlakMembers have data)
    if (pokjaMembers.length > 0 && timlakMembers.length > 0) {
        // CSV already loaded, restore immediately
        restoreMemberSelections(data);
    } else {
        // CSV not loaded yet, save for later
        console.log('⏳ CSV not loaded yet, scheduling member restore...');
        pendingDataRestore = data;
    }

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
    const folderPath = prompt('Masukkan path folder master template:', '.\\Master Folder\\Master BA Timlak Konsultan');

    if (!folderPath) return;

    document.getElementById('masterFolderPath').value = folderPath;

    // Auto-validate folder immediately
    showToast('Memvalidasi folder...', 'info');

    try {
        const response = await fetch('/api/validate_master_timlak_konsultan', {
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

    fetch('/api/validate_master_timlak_konsultan', {
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
        localStorage.setItem('ba_generator_defaults', JSON.stringify(data));

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
        const data = localStorage.getItem('ba_generator_defaults');
        if (data) {
            const parsedData = JSON.parse(data);
            setAllFormData(parsedData);

            showToast('Data berhasil dimuat dari localStorage', 'success');
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
        const filename = `isian_BA_Konsultan_defaults_${timestamp}.json`;

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
            setAllFormData(data);

            showToast('Data berhasil diimport dari file: ' + file.name, 'success');

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
        const localData = localStorage.getItem('ba_generator_defaults');
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