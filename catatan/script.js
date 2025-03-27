// Variabel Global
let saldoAwal = 0;

// Fungsi untuk mendapatkan data transaksi dari localStorage
function getTransactions() {
    const storedTransactions = localStorage.getItem('transactions');
    return storedTransactions ? JSON.parse(storedTransactions) : [];
}

// Fungsi untuk menyimpan data transaksi ke localStorage
function saveTransactions(transactions) {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Fungsi untuk mendapatkan saldo awal dari localStorage
function getSaldoAwal() {
    const storedSaldo = localStorage.getItem('saldoAwal');
    return storedSaldo ? parseFloat(storedSaldo) : 0;
}

// Fungsi untuk menyimpan saldo awal ke localStorage
function saveSaldoAwal(saldo) {
    localStorage.setItem('saldoAwal', saldo);
}

// Inisialisasi saldoAwal saat halaman dimuat
saldoAwal = getSaldoAwal();

// Elemen-elemen DOM
const saldoInput = document.getElementById('saldo');
const submitSaldoButton = document.getElementById('submit-saldo');
const saldoMasukInput = document.getElementById('saldo-masuk');
const keteranganMasukInput = document.getElementById('keterangan-masuk');
const submitMasukButton = document.getElementById('submit-masuk');
const saldoKeluarInput = document.getElementById('saldo-keluar');
const keteranganKeluarInput = document.getElementById('keterangan-keluar');
const submitKeluarButton = document.getElementById('submit-keluar');
const currentSaldoDisplay = document.getElementById('currentSaldo');
const tableHistory = document.getElementById('tableHistory').getElementsByTagName('tbody')[0];
const downloadButton = document.getElementById('downloadButton');

// Inisialisasi data transaksi dari localStorage
let transactions = getTransactions();

// Fungsi untuk memperbarui tampilan saldo
function updateSaldoDisplay() {
    currentSaldoDisplay.innerText = `Rp. ${saldoAwal.toLocaleString('id-ID')}`;
}

// Fungsi untuk membuat baris riwayat transaksi
function createTransactionRow(saldoSebelum, transaksi, saldoSesudah, keterangan) {
    const newRow = tableHistory.insertRow(0);
    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2);
    const cell4 = newRow.insertCell(3);

    cell1.innerText = `Rp. ${saldoSebelum.toLocaleString('id-ID')}`;
    cell2.innerText = transaksi;
    cell3.innerText = `Rp. ${saldoSesudah.toLocaleString('id-ID')}`;
    cell4.innerText = keterangan;
}

// Fungsi untuk menampilkan semua transaksi dari array 'transactions'
function displayTransactions() {
    // Bersihkan tabel sebelum menampilkan transaksi yang diperbarui
    tableHistory.innerHTML = '';

    transactions.forEach(transaction => {
        createTransactionRow(transaction.saldoSebelum, transaction.transaksi, transaction.saldoSesudah, transaction.keterangan);
    });
}

// Event listener untuk tombol submit saldo awal
submitSaldoButton.addEventListener('click', function () {
    const saldo = parseFloat(saldoInput.value);
    if (isNaN(saldo) || saldo <= 0) {
        alert('Masukkan saldo awal yang valid (angka positif).');
        return;
    }

    saldoAwal = saldo;
    saveSaldoAwal(saldoAwal);
    updateSaldoDisplay();
    displayTransactions();
    alert('Saldo awal berhasil disimpan.');
});

// Event listener untuk tombol submit pemasukan
submitMasukButton.addEventListener('click', function () {
    const saldoMasuk = parseFloat(saldoMasukInput.value);
    const keteranganMasuk = keteranganMasukInput.value.trim();

    if (isNaN(saldoMasuk) || saldoMasuk <= 0) {
        alert('Masukkan jumlah pemasukan yang valid (angka positif).');
        return;
    }

    if (!keteranganMasuk) {
        alert('Masukkan keterangan pemasukan.');
        return;
    }

    const saldoSebelum = saldoAwal;
    saldoAwal += saldoMasuk;
    saveSaldoAwal(saldoAwal);
    updateSaldoDisplay();

    // Tambahkan transaksi baru ke array
    transactions.push({
        saldoSebelum: saldoSebelum,
        transaksi: `+ Rp. ${saldoMasuk.toLocaleString('id-ID')}`,
        saldoSesudah: saldoAwal,
        keterangan: keteranganMasuk
    });

    saveTransactions(transactions); // Simpan array transaksi yang diperbarui
    displayTransactions(); // Memperbarui tampilan tabel

    alert('Pemasukan berhasil ditambahkan.');

    // Reset input fields
    saldoMasukInput.value = '';
    keteranganMasukInput.value = '';
});

// Event listener untuk tombol submit pengeluaran
submitKeluarButton.addEventListener('click', function () {
    const saldoKeluar = parseFloat(saldoKeluarInput.value);
    const keteranganKeluar = keteranganKeluarInput.value.trim();

    if (isNaN(saldoKeluar) || saldoKeluar <= 0) {
        alert('Masukkan jumlah pengeluaran yang valid (angka positif).');
        return;
    }

    if (!keteranganKeluar) {
        alert('Masukkan keterangan pengeluaran.');
        return;
    }

    if (saldoKeluar > saldoAwal) {
        alert('Saldo tidak mencukupi untuk pengeluaran ini.');
        return;
    }

    const saldoSebelum = saldoAwal;
    saldoAwal -= saldoKeluar;
    saveSaldoAwal(saldoAwal);
    updateSaldoDisplay();

    // Tambahkan transaksi baru ke array
    transactions.push({
        saldoSebelum: saldoSebelum,
        transaksi: `- Rp. ${saldoKeluar.toLocaleString('id-ID')}`,
        saldoSesudah: saldoAwal,
        keterangan: keteranganKeluar
    });

    saveTransactions(transactions); // Simpan array transaksi yang diperbarui
    displayTransactions(); // Memperbarui tampilan tabel

    alert('Pengeluaran berhasil ditambahkan.');

    // Reset input fields
    saldoKeluarInput.value = '';
    keteranganKeluarInput.value = '';
});

// Fungsi untuk mengunduh data sebagai JPG
function downloadDataAsJPG() {
    html2canvas(document.getElementById('history'), {
        scrollX: 0,
        scrollY: 0,
    }).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.download = 'catatan_keuangan.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

// Event listener untuk tombol unduh
downloadButton.addEventListener('click', downloadDataAsJPG);

// Inisialisasi tampilan saat halaman dimuat
updateSaldoDisplay();
displayTransactions();