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
    // Load Unit Organisasi Data
    loadUnitOrganizationData();
     // Load Direktorat Teknis Data
    loadDirektoratTeknisData();
    // Load Balai Data
    loadBalaiData();
    // Load Work Unit Data
    loadWorkUnitData();
    // Load Classification Code Data
    loadClassificationCodeData();

    console.log('DOMContentLoaded - Initialization complete');
    // Add event listeners
    const unitOrganisasiInput = document.getElementById('unit_organisasi');
    if (unitOrganisasiInput) {
        unitOrganisasiInput.addEventListener('input', updateDirektoratTeknisBalaiOptions);
        unitOrganisasiInput.addEventListener('change', updateDirektoratTeknisBalaiOptions);
    }

    // Add event listeners
    const balaiInput = document.getElementById('balai');
    if (balaiInput) {
        balaiInput.addEventListener('input', updateSatuanKerjaOptions);
        balaiInput.addEventListener('change', updateSatuanKerjaOptions);
    }

    // Clear buttons
    const clearUnitOrganisasiBtn = document.getElementById('clear_unit_organisasi');
    if (clearUnitOrganisasiBtn) {
        clearUnitOrganisasiBtn.addEventListener('click', function () {
            const unitOrganisasiInput = document.getElementById('unit_organisasi');
            if (unitOrganisasiInput) {
                unitOrganisasiInput.value = '';
                updateDirektoratTeknisBalaiOptions();
            }
        });
    }

    // Clear buttons
    const clearBalaiBtn = document.getElementById('clear_balai');
    if (clearBalaiBtn) {
        clearBalaiBtn.addEventListener('click', function () {
            const balaiInput = document.getElementById('balai');
            if (balaiInput) {
                balaiInput.value = '';
                updateSatuanKerjaOptions();
            }
        });
    }

    const clearSatuanKerjaBtn = document.getElementById('clear_satuan_kerja');
    if (clearSatuanKerjaBtn) {
        clearSatuanKerjaBtn.addEventListener('click', function () {
            const satuanKerjaInput = document.getElementById('satuan_kerja');
            if (satuanKerjaInput) {
                satuanKerjaInput.value = '';
            }
        });
    }

    // Jenis Pengadaan Change Listener
    const jenisPengadaanInput = document.getElementById('jenis_pengadaan');
    if (jenisPengadaanInput) {
        jenisPengadaanInput.addEventListener('change', function () {
            // Clear kode_klasifikasi when jenis_pengadaan changes
            const kodeKlasifikasiInput = document.getElementById('kode_klasifikasi');
            if (kodeKlasifikasiInput) {
                kodeKlasifikasiInput.value = '';
            }
            updateKodeKlasifikasiOptions();
        });

        // Also trigger on load if value exists
        if (jenisPengadaanInput.value) {
            updateKodeKlasifikasiOptions();
        }
    }

    const clearKodeKlasifikasiBtn = document.getElementById('clear_kode_klasifikasi');
    if (clearKodeKlasifikasiBtn) {
        clearKodeKlasifikasiBtn.addEventListener('click', function () {
            const kodeKlasifikasiInput = document.getElementById('kode_klasifikasi');
            if (kodeKlasifikasiInput) {
                kodeKlasifikasiInput.value = '';
            }
        });
    }

    // Fetch Pokja Data Button
    const fetchPokjaBtn = document.getElementById('btn_fetch_pokja_data');
    if (fetchPokjaBtn) {
        fetchPokjaBtn.addEventListener('click', function () {
            // Use kode_pokja as the input for Kode Pokja
            const kodePokja = document.getElementById('kode_pokja')?.value;
            if (!kodePokja) {
                alert('Silakan masukkan Kode Pokja terlebih dahulu');
                return;
            }

            // Show loading state
            const originalText = fetchPokjaBtn.innerHTML;
            fetchPokjaBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Loading...';
            fetchPokjaBtn.disabled = true;

            console.log('Fetching data for Kode Pokja:', kodePokja);

            // Use current year
            const tahun = new Date().getFullYear();

            const payload = {
                kode_pokja: kodePokja,
                tahun: tahun
            };

            fetch('https://bp2jkkalsel.com/tender-web/public/api/sk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok: ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('API Response:', data);
                    Swal.fire({
                        icon: 'success',
                        title: 'Data Berhasil Diambil!',
                        text: 'Data telah berhasil dimuat dari API.',
                        footer: '<small>Cek console (F12) untuk detail struktur data</small>'
                    });
                    document.getElementById('nomor_sk_pokja').value = data.data.surat_keputusan.no_sk || '';

                    // Format date from YYYY-MM-DD to D MMMM YYYY (e.g., 20 Januari 2026)
                    const tglSkPokja = data.data.surat_keputusan.tgl_sk;
                    let formattedDatePokja = '';
                    if (tglSkPokja) {
                        try {
                            const [year, month, day] = tglSkPokja.split('-');
                            formattedDatePokja = `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${year}`;
                        } catch (e) {
                            console.error('Error formatting date:', e);
                            formattedDatePokja = tglSkPokja; // Fallback to original
                        }
                    }
                    document.getElementById('tanggal_sk_pokja').value = formattedDatePokja;
                    document.getElementById('nomor_sk_timlak').value = data.data.surat_keputusan.no_sk1 || '';
                    // Format date from YYYY-MM-DD to D MMMM YYYY (e.g., 20 Januari 2026)
                    const tglSkTimlak = data.data.surat_keputusan.tgl_sk1;
                    let formattedDateTimlak = '';
                    if (tglSkTimlak) {
                        try {
                            const [year, month, day] = tglSkTimlak.split('-');
                            formattedDateTimlak = `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${year}`;
                        } catch (e) {
                            console.error('Error formatting date:', e);
                            formattedDateTimlak = tglSkTimlak; // Fallback to original
                        }
                    }
                    document.getElementById('tanggal_sk_timlak').value = formattedDateTimlak;

                    updatePokjaTable(data.data.anggota_pokja);
                    updateTimlakTable(data.data.anggota_timlak);
                    // TODO: Map data to form fields here based on response structure
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal Mengambil Data',
                        text: error.message
                    });
                })
                .finally(() => {
                    fetchPokjaBtn.innerHTML = originalText;
                    fetchPokjaBtn.disabled = false;
                });
        });
    }
});

// Global variables for members
let pokjaMembers = [];
let timlakMembers = [];
let unitOrganisasiData = [];
let direktorteknisData = [];
let balaiData = [];
let workUnitData = [];
let kodeKlasifikasiData = []; // Store classification codes

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



    } catch (error) {
        console.error('❌ Error loading CSV:', error);
        console.log('📋 Using empty lists as fallback');
        // Fallback to empty lists if CSV fails
        pokjaMembers = [];
        timlakMembers = [];
    }
}

// Load Unit Organization Data from JSON
async function loadUnitOrganizationData() {
    try {
        const response = await fetch('/static/template_response/daftar_unor.json');
        if (!response.ok) {
            throw new Error('Failed to load Unit Organization data');
        }
        const result = await response.json();

        const datalist = document.getElementById('unitOrganisasiOptions');
        if (!datalist) return;

        // Clear existing options
        datalist.innerHTML = '';

        if (result.success && result.data && result.data.lists) {
            unitOrganisasiData = result.data.lists; // Store in global variable
            unitOrganisasiData.forEach(doc => {
                const option = document.createElement('option');
                option.value = doc.name;
                datalist.appendChild(option);
            });
            console.log(`✅ Unit Organisasi data loaded: ${unitOrganisasiData.length} items`);
        }
    } catch (error) {
        console.error('❌ Error loading Unit Organisasi data:', error);
    }
}

// Load Unit Organization Data from JSON
async function loadDirektoratTeknisData() {
    try {
        const response = await fetch('/static/template_response/daftar_technical_directorate.json');
        if (!response.ok) {
            throw new Error('Failed to load Technical Directorate data');
        }
        const result = await response.json();

        const datalist = document.getElementById('direktoratTeknisOptions');
        if (!datalist) return;

        // Clear existing options
        datalist.innerHTML = '';

        if (result.success && result.data && result.data.lists) {
            direktorteknisData = result.data.lists; // Store in global variable
            direktorteknisData.forEach(doc => {
                const option = document.createElement('option');
                option.value = doc.name;
                datalist.appendChild(option);
            });
            console.log(`✅ Direktorat Teknis data loaded: ${direktorteknisData.length} items`);
        }
    } catch (error) {
        console.error('❌ Error loading Direktorat Teknis data:', error);
    }
}

// Load Balai Data from JSON
async function loadBalaiData() {
    try {
        const response = await fetch('/static/template_response/daftar_association.json');
        if (!response.ok) {
            throw new Error('Failed to load Balai data');
        }
        const result = await response.json();

        const datalist = document.getElementById('balaiOptions');
        if (!datalist) return;

        // Clear existing options
        datalist.innerHTML = '';
        if (result.success && result.data && result.data.lists) {   
            balaiData = result.data.lists; // Store in global variable
            balaiData.forEach(doc => {
                const option = document.createElement('option');
                option.value = doc.name;
                datalist.appendChild(option);
            });
            console.log(`✅ Balai data loaded: ${balaiData.length} items`);
        }
    } catch (error) {
        console.error('❌ Error loading Balai data:', error);
    }
}

// Load Work Unit Data from JSON
async function loadWorkUnitData() {
    try {
        const response = await fetch('/static/template_response/daftar_work_unit.json');
        if (!response.ok) {
            throw new Error('Failed to load Work Unit data');
        }
        const result = await response.json();

        if (result.success && result.data && result.data.lists) {
            workUnitData = result.data.lists;
            console.log(`✅ Work Unit data loaded: ${workUnitData.length} items`);
        }
    } catch (error) {
        console.error('❌ Error loading Work Unit data:', error);
    }
}

// Load Classification Code Data from JSON
async function loadClassificationCodeData() {
    try {
        const response = await fetch('/static/template_response/daftar_classification_code.json');
        if (!response.ok) {
            throw new Error('Failed to load Classification Code data');
        }
        const result = await response.json();

        if (result.success && result.data && result.data.lists) {
            kodeKlasifikasiData = result.data.lists;
            console.log(`✅ Classification Code data loaded: ${kodeKlasifikasiData.length} items`);

            // If there's already a selected Jenis Pengadaan, trigger update
            const jenisPengadaanInput = document.getElementById('jenis_pengadaan');
            if (jenisPengadaanInput && jenisPengadaanInput.value) {
                updateKodeKlasifikasiOptions();
            }
        }
    } catch (error) {
        console.error('❌ Error loading Classification Code data:', error);
    }
}

// Update Direktorat Teknis options based on selected Unit Organisasi
function updateDirektoratTeknisBalaiOptions() {
    const unitOrganisasiInput = document.getElementById('unit_organisasi');
    const direktorteknisInput = document.getElementById('direktorat_teknis');
    const balaiInput = document.getElementById('balai');
    const direktoratTeknisDatalist = document.getElementById('direktoratTeknisOptions');
    const balaiDatalist = document.getElementById('balaiOptions');

    if (!unitOrganisasiInput || !direktorteknisInput || !balaiInput || !direktoratTeknisDatalist || !balaiDatalist) return;

    const selectedUnitOrganisasiName = unitOrganisasiInput.value || '';

    // Find Unit Organisasi object (case-insensitive and trimmed match)
    const selectedUnitOrganisasi = unitOrganisasiData.find(u => 
        u.name.trim().toLowerCase() === selectedUnitOrganisasiName.trim().toLowerCase()
    );

    // Clear existing options
    direktoratTeknisDatalist.innerHTML = '';
    balaiDatalist.innerHTML = '';

    if (selectedUnitOrganisasi) {
        // Filter Direktorat Teknis by unor_code (which matches Unit Organisasi ID)
        const filteredDirektoratTeknis = direktorteknisData.filter(u => u.unor_code === selectedUnitOrganisasi.id);
        filteredDirektoratTeknis.forEach(direktoratTeknis => {
            const option = document.createElement('option');
            option.value = direktoratTeknis.name;
            direktoratTeknisDatalist.appendChild(option);
        });
        console.log(balaiData)

        // Filter Balai by unor_code (which matches Unit Organisasi ID)
        const filteredBalai = balaiData.filter(u => u.unor_code === selectedUnitOrganisasi.id);
        filteredBalai.forEach(balai => {
            const option = document.createElement('option');
            option.value = balai.name;
            balaiDatalist.appendChild(option);
        });
        console.log(`Updated Direktorat Teknis options for ${selectedUnitOrganisasi.name}: ${filteredDirektoratTeknis.length} items`);
        console.log(`Updated Balai options for ${selectedUnitOrganisasi.name}: ${filteredBalai.length} items`);

        direktorteknisInput.disabled = false;
        direktorteknisInput.placeholder = "Pilih atau ketik Direktorat Teknis...";
        balaiInput.disabled = false;
        balaiInput.placeholder = "Pilih atau ketik Balai...";
        console.log(`Updated Direktorat Teknis options for ${selectedUnitOrganisasi.name}: ${filteredDirektoratTeknis.length} items`);
        console.log(`Updated Balai options for ${selectedUnitOrganisasi.name}: ${filteredBalai.length} items`);
    } else {
        direktorteknisInput.disabled = true;
        direktorteknisInput.value = '';
        direktorteknisInput.placeholder = "Pilih Unit Organisasi terlebih dahulu...";
        balaiInput.disabled = true;
        balaiInput.value = '';
        balaiInput.placeholder = "Pilih Unit Organisasi terlebih dahulu...";
    }
}

// Update Satuan Kerja options based on selected Balai
function updateSatuanKerjaOptions() {
    const balaiInput = document.getElementById('balai');
    const satuanKerjaInput = document.getElementById('satuan_kerja');
    const datalist = document.getElementById('satuanKerjaOptions');

    if (!balaiInput || !satuanKerjaInput || !datalist) return;

    const selectedBalaiName = balaiInput.value;

    // Find Balai object
    const selectedBalai = balaiData.find(b => b.name === selectedBalaiName);

    // Clear existing options
    datalist.innerHTML = '';

    if (selectedBalai) {
        // Filter Work Units by association_code (which matches Balai ID)
        const filteredUnits = workUnitData.filter(u => u.association_code === selectedBalai.id);

        filteredUnits.forEach(unit => {
            const option = document.createElement('option');
            option.value = unit.name;
            datalist.appendChild(option);
        });

        satuanKerjaInput.disabled = false;
        satuanKerjaInput.placeholder = "Pilih atau ketik Satuan Kerja...";
        console.log(`Updated Satuan Kerja options for ${selectedBalaiName}: ${filteredUnits.length} items`);
    } else {
        satuanKerjaInput.disabled = true;
        satuanKerjaInput.value = '';
        satuanKerjaInput.placeholder = "Pilih Balai terlebih dahulu...";
    }
}

// Update Kode Klasifikasi options based on selected Jenis Pengadaan
function updateKodeKlasifikasiOptions() {
    const jenisPengadaanInput = document.getElementById('jenis_pengadaan');
    const kodeKlasifikasiInput = document.getElementById('kode_klasifikasi');
    const datalist = document.getElementById('kodeKlasifikasiOptions');

    if (!jenisPengadaanInput || !kodeKlasifikasiInput || !datalist) return;

    const selectedJenisPengadaan = jenisPengadaanInput.value;

    // Clear existing options
    datalist.innerHTML = '';

    if (selectedJenisPengadaan) {
        // Filter Klasifikasi by procurement_type
        const filteredKlasifikasi = kodeKlasifikasiData.filter(k => k.procurement_type === selectedJenisPengadaan);

        filteredKlasifikasi.forEach(item => {
            const option = document.createElement('option');
            option.value = item.value;
            // Use name only as description is not always available or consistent in JSON
            option.textContent = item.name;
            datalist.appendChild(option);
        });

        kodeKlasifikasiInput.disabled = false;
        kodeKlasifikasiInput.placeholder = "Pilih atau ketik Kode Klasifikasi...";
        console.log(`Updated Kode Klasifikasi options for ${selectedJenisPengadaan}: ${filteredKlasifikasi.length} items`);
    } else {
        kodeKlasifikasiInput.disabled = true;
        kodeKlasifikasiInput.value = '';
        kodeKlasifikasiInput.placeholder = "Pilih Jenis Pengadaan terlebih dahulu...";
    }
}

// Update POKJA table based on role selections
function updatePokjaTable(data) {
    const nipKetua = data[0].nip.replace(/\s+/g, '');
    const nipSekretaris = data[1].nip.replace(/\s+/g, '');
    const nipAnggota1 = data[2].nip.replace(/\s+/g, '');
    const nipAnggota2 = data[3].nip.replace(/\s+/g, '');
    const nipAnggota3 = data[4].nip.replace(/\s+/g, '');

    //nama anggota
    const namaKetua = pokjaMembers.find(m => m.nip === nipKetua)?.nama || '';
    const namaSekretaris = pokjaMembers.find(m => m.nip === nipSekretaris)?.nama || '';
    const namaAnggota1 = pokjaMembers.find(m => m.nip === nipAnggota1)?.nama || '';
    const namaAnggota2 = pokjaMembers.find(m => m.nip === nipAnggota2)?.nama || '';
    const namaAnggota3 = pokjaMembers.find(m => m.nip === nipAnggota3)?.nama || '';
    const emailKetua = pokjaMembers.find(m => m.nip === nipKetua)?.email || '';

    document.getElementById('ketua_pokja').value = namaKetua;
    document.getElementById('sekre_pokja').value = namaSekretaris;
    document.getElementById('anggota_pokja1').value = namaAnggota1;
    document.getElementById('anggota_pokja2').value = namaAnggota2;
    document.getElementById('anggota_pokja3').value = namaAnggota3;
    document.getElementById('email_ketua_pokja').value = emailKetua;

    const tableBody = document.getElementById('pokja_members_table');
    let tableHTML = '';
    let memberCount = 1;

    // Add Ketua
    if (namaKetua) {
        tableHTML += createPokjaTableRow(memberCount++, 'Ketua', { nama: namaKetua, nip: nipKetua }, 'ketua', JSON.stringify({ nama: namaKetua, nip: nipKetua }));
    }

    // Add Sekretaris
    if (namaSekretaris) {
        tableHTML += createPokjaTableRow(memberCount++, 'Sekretaris', { nama: namaSekretaris, nip: nipSekretaris }, 'sekre', JSON.stringify({ nama: namaSekretaris, nip: nipSekretaris }));
    }

    // Add Anggota 1
    if (namaAnggota1) {
        tableHTML += createPokjaTableRow(memberCount++, 'Anggota', { nama: namaAnggota1, nip: nipAnggota1 }, 'anggota3', JSON.stringify({ nama: namaAnggota1, nip: nipAnggota1 }));
    }

    // Add Anggota 2
    if (namaAnggota2) {
        tableHTML += createPokjaTableRow(memberCount++, 'Anggota', { nama: namaAnggota2, nip: nipAnggota2 }, 'anggota4', JSON.stringify({ nama: namaAnggota2, nip: nipAnggota2 }));
    }

    // Add Anggota 3
    if (namaAnggota3) {
        tableHTML += createPokjaTableRow(memberCount++, 'Anggota', { nama: namaAnggota3, nip: nipAnggota3 }, 'anggota5', JSON.stringify({ nama: namaAnggota3, nip: nipAnggota3 }));
    }

    if (tableHTML === '') {
        tableHTML = `
                    <tr>
                        <td colspan="6" class="text-center text-muted py-4">
                            <i class="fas fa-users fa-2x mb-2 d-block"></i>
                        </td>
                    </tr>
                `;
    }

    tableBody.innerHTML = tableHTML;

}

// Create POKJA table row
function createPokjaTableRow(no, role, member) {
    const badgeClass = role === 'Ketua' ? 'bg-primary' : role === 'Sekretaris' ? 'bg-success' : 'bg-info';

    return `
                <tr>
                    <td class="text-center align-middle fw-bold">${no}</td>
                    <td class="align-middle">
                        ${member.nama}
                    </td>
                    <td class="text-center align-middle">
                        <span class="badge ${badgeClass}">${role}</span>
                    </td>
                </tr>
            `;
}

// ===== TIMLAK FUNCTIONS =====
// Update TIMLAK table based on role selections
function updateTimlakTable(data) {
    const nipKetua = data[0].nip.replace(/\s+/g, '');
    const nipSekretaris = data[1].nip.replace(/\s+/g, '');
    const nipAnggota = data[2].nip.replace(/\s+/g, '');

    console.log(nipKetua)
    const namaKetua = timlakMembers.find(m => m.nip === nipKetua)?.nama || '';
    const namaSekretaris = timlakMembers.find(m => m.nip === nipSekretaris)?.nama || '';
    const namaAnggota = timlakMembers.find(m => m.nip === nipAnggota)?.nama || '';

    document.getElementById('ketua_timlak').value = namaKetua;
    document.getElementById('sekre_timlak').value = namaSekretaris;
    document.getElementById('anggota_timlak').value = namaAnggota;

    const tableBody = document.getElementById('timlak_members_table');
    let tableHTML = '';
    let memberCount = 1;

    // Add Ketua
    if (namaKetua) {
        tableHTML += createPokjaTableRow(memberCount++, 'Ketua', { nama: namaKetua, nip: nipKetua }, 'ketua', JSON.stringify({ nama: namaKetua, nip: nipKetua }));
    }

    // Add Sekretaris
    if (namaSekretaris) {
        tableHTML += createPokjaTableRow(memberCount++, 'Sekretaris', { nama: namaSekretaris, nip: nipSekretaris }, 'sekre', JSON.stringify({ nama: namaSekretaris, nip: nipSekretaris }));
    }

    // Add Anggota 1
    if (namaAnggota) {
        tableHTML += createPokjaTableRow(memberCount++, 'Anggota', { nama: namaAnggota, nip: nipAnggota }, 'anggota3', JSON.stringify({ nama: namaAnggota, nip: nipAnggota }));
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
                    <td class="align-middle">
                        ${member.nama}
                    </td>
                    <td class="text-center align-middle">
                        <span class="badge ${badgeClass}">${role}</span>
                    </td>
                </tr>
            `;
}

// Generate nomor undangan rapat otomatis
function updateNomorUndanganRapat() {
    const kodeKlasifikasiInput = document.getElementById('kode_klasifikasi');
    const kodePokjaInput = document.getElementById('kode_pokja');
    const nomorUndanganInput = document.getElementById('nomor_undangan_rapat');

    if (kodeKlasifikasiInput && nomorUndanganInput) {
        const kodeKlasifikasi = kodeKlasifikasiInput.value || '{kode_klasifikasi}';
        const kodePokja = kodePokjaInput ? kodePokjaInput.value : '{kode_pokja}';
        const year = new Date().getFullYear();

        // Format: {kode_klasifikasi}/Und/Bp2jk17/POKJA-{kode_pokja}/{year}/{month}
        nomorUndanganInput.value = `${kodeKlasifikasi}/R/Bp2jk17/POKJA-${kodePokja}/${year}/01`;
    }
}

// Panggil saat kode_pokja atau kode_klasifikasi berubah
document.addEventListener('DOMContentLoaded', function () {
    const kodePokjaInput = document.getElementById('kode_pokja');
    const kodeKlasifikasiInput = document.getElementById('kode_klasifikasi');

    if (kodeKlasifikasiInput) {
        kodeKlasifikasiInput.addEventListener('input', updateNomorUndanganRapat);
        kodeKlasifikasiInput.addEventListener('change', updateNomorUndanganRapat);
    }

    if (kodePokjaInput) {
        kodePokjaInput.addEventListener('input', updateNomorUndanganRapat);
        kodePokjaInput.addEventListener('change', updateNomorUndanganRapat);
    }

    // Initial update
    updateNomorUndanganRapat();
});

// Preview document with replaced keywords
async function previewDocument(docCode) {
    console.log('[PREVIEW] Button clicked, docCode:', docCode);

    // // Validate master folder selected
    const masterFolder = document.getElementById('masterFolderPath').value;

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
                masterFolderPath: masterFolder
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


// Add Location Row
function addLokasiRow() {
    const tbody = document.querySelector('#lokasiTable tbody');
    const row = document.createElement('tr');
    
    // Generate unique ID for datalist
    const uniqueId = 'list_kabupaten_' + Date.now();
    const uniqueIdKec = 'list_kecamatan_' + Date.now();
    
    row.className = 'align-middle'; // Center content vertically

    row.innerHTML = `
        <td>
            <div class="input-group input-group-sm shadow-sm">
                <span class="input-group-text bg-light text-secondary"><i class="fas fa-map"></i></span>
                <input type="text" class="form-control bg-light fw-bold text-secondary lokasi-provinsi" placeholder="Provinsi" value="Kalimantan Selatan" readonly>
            </div>
        </td>
        <td>
            <div class="input-group input-group-sm shadow-sm">
                <span class="input-group-text bg-white text-primary"><i class="fas fa-city"></i></span>
                <input class="form-control lokasi-kabupaten" list="${uniqueId}" placeholder="Pilih Kabupaten/Kota..." autocomplete="off" onchange="handleKabupatenChange(this, '${uniqueIdKec}')">
                <datalist id="${uniqueId}"></datalist>
                <button class="btn btn-outline-secondary" type="button" onclick="clearKabupaten(this, '${uniqueIdKec}')" title="Reset">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </td>
        <td>
             <div class="input-group input-group-sm shadow-sm">
                <span class="input-group-text bg-white text-danger"><i class="fas fa-map-marker-alt"></i></span>
                <input class="form-control lokasi-kecamatan" list="${uniqueIdKec}" placeholder="Pilih Kecamatan..." autocomplete="off" disabled>
                <datalist id="${uniqueIdKec}"></datalist>
                <button class="btn btn-outline-secondary" type="button" onclick="clearKecamatan(this)" title="Reset">
                    <i class="fas fa-times"></i>
                </button>
             </div>
        </td>
        <td class="text-center">
            <button type="button" class="btn btn-outline-danger btn-sm shadow-sm rounded-circle" onclick="removeLokasiRow(this)" title="Hapus Baris">
                <i class="fas fa-trash-alt"></i>
            </button>
        </td>
    `;
    tbody.appendChild(row);
    
    // Populate the new datalist
    const datalist = row.querySelector(`#${uniqueId}`);
    if (window.kabupatenData && datalist) {
        window.kabupatenData.forEach(kab => {
            const option = document.createElement('option');
            option.value = kab.name;
            datalist.appendChild(option);
        });
    }
}

// Clear Kabupaten Selection
function clearKabupaten(btn, targetDatalistId) {
    const inputGroup = btn.closest('.input-group');
    const input = inputGroup.querySelector('input');
    input.value = '';
    // Reset dependent Kecamatan field
    handleKabupatenChange(input, targetDatalistId);
}

// Clear Kecamatan Selection
function clearKecamatan(btn) {
    const inputGroup = btn.closest('.input-group');
    const input = inputGroup.querySelector('input');
    input.value = '';
}

// Handle Kabupaten Change
async function handleKabupatenChange(input, targetDatalistId) {
    const row = input.closest('tr');
    const kecamatanInput = row.querySelector('.lokasi-kecamatan');
    const kecamatanDatalist = document.getElementById(targetDatalistId);
    
    // Reset Kecamatan
    kecamatanInput.value = '';
    kecamatanInput.disabled = true;
    kecamatanDatalist.innerHTML = '';
    
    const selectedName = input.value;
    const selectedKab = window.kabupatenData.find(k => k.name === selectedName);
    
    if (selectedKab) {
        kecamatanInput.disabled = false;
        kecamatanInput.placeholder = "Loading...";
        
        try {
            // Fetch district data from API via local proxy to avoid CORS
            const response = await fetch(`/api/proxy/wilayah/districts/${selectedKab.code}.json`);
            if (!response.ok) throw new Error('Failed to load districts');
            
            const result = await response.json();
            if (result.data) {
                result.data.forEach(dist => {
                    const option = document.createElement('option');
                    option.value = dist.name;
                    kecamatanDatalist.appendChild(option);
                });
                kecamatanInput.placeholder = "Pilih atau ketik Kecamatan...";
            }
        } catch (error) {
            console.error('Error loading districts:', error);
            kecamatanInput.placeholder = "Error memuat data";
        }
    }
}

// Load Kabupaten Data
async function loadKabupatenData() {
    try {
        // Fetch via local proxy to avoid CORS
        const response = await fetch('/api/proxy/wilayah/regencies/63.json');
        if (!response.ok) {
            throw new Error('Failed to load Kabupaten data');
        }
        const result = await response.json();
        
        if (result.data) {
            window.kabupatenData = result.data;
            console.log(`✅ Kabupaten data loaded: ${result.data.length} items`);
        }
    } catch (error) {
        console.error('❌ Error loading Kabupaten data:', error);
        window.kabupatenData = []; // Fallback empty array
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadKabupatenData();
    
    // Add event listeners for document 03 and z03 toggle (Mutual Exclusion)
    const row03 = document.querySelector('tr[data-doc="03"]');
    const checkbox03 = row03 ? row03.querySelector('.doc-checkbox') : null;
    const input03 = row03 ? row03.querySelector('input[name="nomor_surat_1"]') : null;

    const rowz03 = document.querySelector('tr[data-doc="z03"]');
    const checkboxz03 = rowz03 ? rowz03.querySelector('.doc-checkbox') : null;
    const inputz03 = rowz03 ? rowz03.querySelector('input[name="nomor_surat_1"]') : null;
    
    if (checkbox03 && input03 && checkboxz03 && inputz03) {
        
        // Initial State Sync
        if (checkboxz03.checked) {
             input03.disabled = true;
            //  checkbox03.checked = false;
             inputz03.disabled = false;
        } else if (checkbox03.checked) {
             inputz03.disabled = true;
            //  checkboxz03.checked = false;
             input03.disabled = false;
        }

        // Listener for 03
        checkbox03.addEventListener('change', function() {
            if (this.checked) {
                // 03 Selected -> Disable z03
                input03.disabled = false;
                
                // checkboxz03.checked = false;
                inputz03.disabled = true;
                inputz03.value = ''; 
            } else {
                // 03 Unselected -> Enable z03
                input03.disabled = true;
                input03.value = '';
                
                // checkboxz03.checked = true;
                inputz03.disabled = false;
            }
        });

        // Listener for z03
        checkboxz03.addEventListener('change', function() {
            if (this.checked) {
                // z03 Selected -> Disable 03
                inputz03.disabled = false;
                
                checkbox03.checked = false;
                input03.disabled = true;
                input03.value = '';
            } else {
                // z03 Unselected -> Enable 03
                inputz03.disabled = true;
                inputz03.value = '';
                
                checkbox03.checked = true;
                input03.disabled = false;
            }
        });
    }

    // SIRUP API Fetcher
    const kodeRupInput = document.getElementById('kode_rup');
    if (kodeRupInput) {
        kodeRupInput.addEventListener('change', async function() {
            const kodeRup = this.value.trim();
            if (kodeRup && kodeRup.length > 5) {
                try {
                    // Show loading state
                    const originalCursor = document.body.style.cursor;
                    document.body.style.cursor = 'wait';
                    
                    const response = await fetch(`/api/sirup/detail/${kodeRup}`);
                    const data = await response.json();
                    
                    if (data.success && data.html) {
                        // Parse HTML
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(data.html, 'text/html');
                        
                        // Extract "Nama Paket" and "Total Pagu"
                        // Look for label "Nama Paket" in table cells
                        const tds = doc.querySelectorAll('td');
                        let namaPaket = '';
                        let nilaiPagu = '';
                        
                        for (let i = 0; i < tds.length; i++) {
                            const text = tds[i].textContent.trim();
                            if (text === 'Nama Paket' && tds[i+1]) {
                                namaPaket = tds[i+1].textContent.trim();
                            }
                            
                            if (text === 'Total Pagu' && tds[i+1]) {
                                nilaiPagu = tds[i+1].textContent.trim();
                            }

                            if (namaPaket && nilaiPagu) break;
                        }
                        
                        if (namaPaket) {
                            const namaPaketInput = document.getElementById('nama_paket');
                            if (namaPaketInput) {
                                namaPaketInput.value = namaPaket;
                                // Flash effect to indicate update
                                namaPaketInput.style.backgroundColor = '#e8f0fe';
                                setTimeout(() => {
                                    namaPaketInput.style.backgroundColor = '';
                                }, 1000);
                            }
                        }

                        if (nilaiPagu) {
                            const nilaiPaguInput = document.getElementById('nilai_pagu');
                            if (nilaiPaguInput) {
                                // Clean up the value: remove non-numeric characters (Rp, dots, etc)
                                const cleanValue = nilaiPagu.replace(/[^0-9]/g, '');
                                nilaiPaguInput.value = cleanValue;
                                
                                // Trigger update for "Terbilang"
                                if (typeof updateTerbilangPagu === 'function') {
                                    updateTerbilangPagu();
                                }

                                // Flash effect to indicate update
                                nilaiPaguInput.style.backgroundColor = '#e8f0fe';
                                setTimeout(() => {
                                    nilaiPaguInput.style.backgroundColor = '';
                                }, 1000);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error fetching SIRUP data:', error);
                } finally {
                    document.body.style.cursor = 'default';
                }
            }
        });
    }
});


// Remove Location Row
function removeLokasiRow(btn) {
    const row = btn.closest('tr');
    row.remove();
}

// Add Lingkup Row
function addLingkupRow() {
    const tbody = document.querySelector('#lingkupTable tbody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" class="form-control form-control-sm lingkup-input" placeholder="Uraian Lingkup Pekerjaan"></td>
        <td>
            <button type="button" class="btn btn-danger btn-sm" onclick="removeLingkupRow(this)">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    tbody.appendChild(row);
}

// Remove Lingkup Row
function removeLingkupRow(btn) {
    const row = btn.closest('tr');
    row.remove();
}

// Collect all keywords
function collectAllKeywords(formData) {
    console.log('[DEBUG] Form Data:', Object.fromEntries(formData));
    const keywords = {};

    //Data DHP1
    const tglDHP1 = formData.get('tanggal_DHP1');
    keywords.tanggal_DHP1 = formatDateIndonesian(tglDHP1 || '');
    if (tglDHP1) {
        const dateObj = new Date(tglDHP1);
        keywords.hari_DHP1 = dayNames[dateObj.getDay()];
    } else {
        keywords.hari_DHP1 = '';
    }

    //Data DHS
    const tglDHS = formData.get('tanggal_DHS');
    keywords.tanggal_DHS = formatDateIndonesian(tglDHS || '');
    if (tglDHS) {
        const dateObj = new Date(tglDHS);
        keywords.hari_DHS = dayNames[dateObj.getDay()];
    } else {
        keywords.hari_DHS = '';
    }

    //Data Paket______________________________________________________________
    keywords.kode_rup = formData.get('kode_rup') || '';
    keywords.nama_paket = formData.get('nama_paket') || '';
    keywords.balai = formData.get('balai') || '';
    keywords.satuan_kerja = formData.get('satuan_kerja') || '';
    keywords.ppk = formData.get('ppk') || '';
    // Remove the first word from ppk (e.g. "PPK 1.1" -> "1.1")
    keywords.ppk_back = (formData.get('ppk') || '').split(' ').slice(1).join(' ');
    keywords.nama_ppk = formData.get('nama_ppk') || '';
    keywords.jenis_pengadaan = formData.get('jenis_pengadaan') || '';
    keywords.metode_pemilihan = formData.get('metode_pemilihan') || '';
    keywords.tahun_anggaran = formData.get('tahun_anggaran') || '';
    keywords.kode_klasifikasi = formData.get('kode_klasifikasi') || '';
    keywords.sumber_dana = formData.get('sumber_dana') || '';
    keywords.jangka_waktu = formData.get('jangka_waktu') || '';
    keywords.persentase_ppn = formData.get('persentase_ppn') || '';
    keywords.unit_organisasi = formData.get('unit_organisasi') || '';
    keywords.direktorat_teknis = formData.get('direktorat_teknis') || '';
    keywords.gelar_ppk = formData.get('gelar_ppk') || '';

    // Uppercase versions for all text fields
    keywords.satuan_kerja_upper = keywords.satuan_kerja.toUpperCase();
    // Data Nilai Pagu dan HPS
    const nilaiPagu = parseInt(formData.get('nilai_pagu') || '0');
    const nilaiHps = parseInt(formData.get('nilai_hps') || '0');
    keywords.nilai_pagu = formatCurrency(nilaiPagu);
    keywords.terbilang_pagu = terbilang(nilaiPagu, false) + ' rupiah';
    keywords.nilai_hps = formatCurrency(nilaiHps);
    keywords.terbilang_hps = terbilang(nilaiHps, false) + ' rupiah';
    
    keywords.metode_pemilihan_front = (formData.get('metode_pemilihan') || '').split(' ')[0];

    // Lokasi dan Lingkup Pekerjaan
    const lokasiRows = document.querySelectorAll('#lokasiTable tbody tr');
    const lokasiList = [];
    lokasiRows.forEach(row => {
        const prov = row.querySelector('.lokasi-provinsi').value;
        const kab = row.querySelector('.lokasi-kabupaten').value;
        const kec = row.querySelector('.lokasi-kecamatan').value;
        
        let parts = [];
        if (prov) parts.push(`Provinsi ${prov}`);
        if (kab) parts.push(kab); // Assuming user types "Kabupaten X" or "Kota Y"
        if (kec) parts.push(`Kecamatan ${kec}`);
        
        if (parts.length > 0) {
            lokasiList.push(parts.join(', '));
        }
        
        // Add structured data
        if (prov || kab || kec) {
            if (!keywords.list_lokasi_pekerjaan) keywords.list_lokasi_pekerjaan = [];
            keywords.list_lokasi_pekerjaan.push({
                provinsi: prov,
                kabupaten: kab,
                kecamatan: kec
            });
        }
    });
    // Join multiple locations with semicolons or newlines as needed
    keywords.lokasi_pekerjaan = lokasiList.length > 0 ? lokasiList.join('; ') : '';
    
    // Lingkup Pekerjaan
    const lingkupRows = document.querySelectorAll('#lingkupTable tbody tr');
    const lingkupList = [];
    lingkupRows.forEach(row => {
        const val = row.querySelector('.lingkup-input').value;
        if (val) {
             lingkupList.push(val);
        }
    });
    
    keywords.lingkup_pekerjaan = lingkupList.length > 0 ? lingkupList.join('; ') : '';
    keywords.list_lingkup = lingkupList; // Array of strings

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

    // Handle pokja data
    keywords['ketua_pokja'] = formData.get('ketua_pokja') || '';
    keywords['sekre_pokja'] = formData.get('sekre_pokja') || '';
    keywords['anggota_pokja1'] = formData.get('anggota_pokja1') || '';
    keywords['anggota_pokja2'] = formData.get('anggota_pokja2') || '';
    keywords['anggota_pokja3'] = formData.get('anggota_pokja3') || '';
    keywords.email_ketua_pokja = formData.get('email_ketua_pokja') || '';

    // Handle timlak
    keywords['ketua_timlak'] = formData.get('ketua_timlak') || '';
    keywords['sekre_timlak'] = formData.get('sekre_timlak') || '';
    keywords['anggota_timlak'] = formData.get('anggota_timlak') || '';

    const tanggalDokumen = formData.get('tanggal_dokumen');
    keywords.tanggal_reviu = formatDateIndonesian(tanggalDokumen || '');
    if (tanggalDokumen) {
        const dateObj = new Date(tanggalDokumen);
        keywords.hari_reviu = dayNames[dateObj.getDay()];
        keywords.tanggal_sebut_reviu = terbilang(dateObj.getDate());
        keywords.bulan_sebut_reviu = monthNames[dateObj.getMonth()];
        keywords.tahun_sebut_reviu = terbilang(dateObj.getFullYear());
    } else {
        keywords.hari_reviu = '';
    }

    keywords['kode_klasifikasi'] = formData.get('kode_klasifikasi') || '';
    keywords['nomor_surat_1'] = formData.get('nomor_surat_1') || '';
    keywords['nomor_surat_2'] = formData.get('nomor_surat_2') || '';
    keywords['nomor_surat_3'] = formData.get('nomor_surat_3') || '';

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
        const day = String(date.getDate()).padStart(2, '0');
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
    const dataPaket = {};
    const pokjaInfo = {};
    const timlakInfo = {};
    const customVars = {};

    Object.entries(keywords).forEach(([key, value]) => {
        // POKJA: ketua_pokja, sekre_pokja, anggota_pokja, nip, email
        if (key.includes('pokja') && (key.includes('ketua') || key.includes('sekre') ||
            key.includes('anggota') || key.includes('nomor_sk_pokja') || key.includes('tanggal_sk_pokja'))) {
            pokjaInfo[key] = value;
        }
        // TIMLAK: ketua_timlak, sekre_timlak, anggota_timlak, nip, email, email_timlak (perwakilan)
        else if ((key.includes('timlak') && (key.includes('ketua') || key.includes('sekre') ||
            key.includes('anggota') || key.includes('nomor_sk_timlak') || key.includes('tanggal_sk_timlak'))) ||
            key === 'email_timlak') {
            timlakInfo[key] = value;
        }

        //Data Paket
        else if (key.startsWith('nilai_') || key.startsWith('terbilang_') ||
            key === 'tahun_anggaran' || key === 'nama_paket' || key === 'kode_pokja' ||
            key === 'balai' || key === 'satuan_kerja' || key === 'ppk' ||
            key === 'jenis_pengadaan' || key === 'metode_pemilihan' || key === 'nama_ppk' ||
            key === 'kode_rup' || key === 'lokasi_pekerjaan' || key === 'lingkup_pekerjaan'
        ) {
            dataPaket[key] = value;
        }
        // Custom Variables: everything else
        else {
            customVars[key] = value;
        }
    });

    // Data Paket Section
    if (Object.keys(dataPaket).length > 0) {
        content += '<div class="mb-4"><h6 class="text-primary border-bottom pb-2"><i class="fas fa-info-circle me-2"></i>Data Paket</h6>';
        Object.entries(dataPaket).forEach(([key, value]) => {
            content += `<div class="mb-1"><code class="text-success">{${key}}</code>: <span class="text-dark">${value || '<em class="text-muted">kosong</em>'}</span></div>`;
        });
        content += '</div>';
    }

    // POKJA Section
    if (Object.keys(pokjaInfo).length > 0) {
        content += '<div class="mb-4"><h6 class="text-primary border-bottom pb-2"><i class="fas fa-users me-2"></i>Anggota Pokja</h6>';
        Object.entries(pokjaInfo).forEach(([key, value]) => {
            content += `<div class="mb-1"><code class="text-success">{${key}}</code>: <span class="text-dark">${value || '<em class="text-muted">kosong</em>'}</span></div>`;
        });
        content += '</div>';
    }

    // TIMLAK Section
    if (Object.keys(timlakInfo).length > 0) {
        content += '<div class="mb-4"><h6 class="text-success border-bottom pb-2"><i class="fas fa-user-check me-2"></i>Anggota Timlak</h6>';
        Object.entries(timlakInfo).forEach(([key, value]) => {
            content += `<div class="mb-1"><code class="text-success">{${key}}</code>: <span class="text-dark">${value || '<em class="text-muted">kosong</em>'}</span></div>`;
        });
        content += '</div>';
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

            // Add Log Entries Section
            if (file.log_entries && file.log_entries.length > 0) {
                const collapseId = `logCollapse_${Math.random().toString(36).substr(2, 9)}`;
                content += `
                    <div class="mt-3">
                        <button class="btn btn-outline-secondary btn-sm w-100" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}">
                            <i class="fas fa-list-alt me-2"></i>Lihat Log Detail (${file.log_entries.length} entri)
                        </button>
                        <div class="collapse mt-2" id="${collapseId}">
                            <div class="card card-body bg-light">
                                <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
                                    <table class="table table-xs table-bordered bg-white" style="font-size: 0.75rem;">
                                        <thead class="table-secondary position-sticky top-0">
                                            <tr>
                                                <th width="10%">Context</th>
                                                <th width="40%">Sebelum</th>
                                                <th width="40%">Sesudah</th>
                                                <th width="10%">Count</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                `;

                file.log_entries.forEach(entry => {
                    content += `
                        <tr>
                            <td><span class="badge bg-secondary">${entry.context}</span></td>
                            <td class="text-muted text-break">${entry.before ? entry.before.substring(0, 100) + (entry.before.length > 100 ? '...' : '') : '-'}</td>
                            <td class="text-break">${entry.after ? entry.after.substring(0, 100) + (entry.after.length > 100 ? '...' : '') : '-'}</td>
                            <td class="text-center fw-bold">${entry.replacements}</td>
                        </tr>
                    `;
                });

                content += `
                                        </tbody>
                                    </table>
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

// Checkbox management functions
function setDocumentLists(folderName) {
    console.log('Master folder changed to:', folderName);

    // Documents to toggle: 04, 05, 06, 07, 08
    const docsToToggle = ['04', '05', '06', '07', '08'];

    // Determine state based on folder name
    // If RO (Repeat Order), these docs should be unchecked and disabled
    const isRO = folderName === 'Master BA Timlak RO Konsultan';

    docsToToggle.forEach(docValue => {
        // Find checkbox by value
        const checkbox = document.querySelector(`.doc-checkbox[value="${docValue}"]`);
        if (checkbox) {
            const row = checkbox.closest('tr');

            if (isRO) {
                // For RO: Uncheck and Disable
                checkbox.checked = false;
                checkbox.disabled = true;

                // Visually indicate disabled state
                if (row) {
                    row.style.opacity = '0.5';
                    row.style.backgroundColor = '#e9ecef'; // Light gray
                    // Disable other inputs in the row if any
                    row.querySelectorAll('input:not(.doc-checkbox), select, button').forEach(el => {
                        el.disabled = true;
                    });
                }
            } else {
                // For Standard: Check and Enable
                checkbox.checked = true;
                checkbox.disabled = false;

                // Restore visual state
                if (row) {
                    row.style.opacity = '1';
                    row.style.backgroundColor = '';
                    // Enable other inputs in the row
                    row.querySelectorAll('input:not(.doc-checkbox), select, button').forEach(el => {
                        el.disabled = false;
                    });
                }
            }
        }
    });
}

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

// Handle form submission
document.getElementById('baForm').addEventListener('submit', function (e) {
    console.log('Form submit handler called');
    e.preventDefault();

    const selectedDocuments = collectSelectedDocuments();
    // Validate at least one document is selected
    if (selectedDocuments.length === 0) {
        showToast('Pilih minimal 1 dokumen untuk diproses (centang checkbox)', 'warning');
        return;
    }

    const formData = new FormData(this);
    const keywords = collectAllKeywords(formData);
    formData.append('keywords', JSON.stringify(keywords));
    formData.append('selected_documents', JSON.stringify(selectedDocuments));

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