const transactionForm = document.getElementById('transactionForm');
const transactionTableBody = document.getElementById('transactionBody');
const totalIncomeDisplay = document.getElementById('totalIncome');
const totalExpenseDisplay = document.getElementById('totalExpense');
const balanceDisplay = document.getElementById('balance');
const filterSelect = document.getElementById('filterSelect');
const scriptURL = 'https://script.google.com/macros/s/AKfycbwn305r3umfQcdTDk2I8NSVrCCP37awJ16wGOJWw4LNDUd2PXeuKAgSoikgL0ASMar38w/exec'; // Ganti dengan URL Web App kamu

let transactions = [];

function formatRupiah(angka) {
    const formatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    });
    return formatter.format(angka);
}

function fetchTransactions() {
    fetch(scriptURL + '?action=read')
        .then(response => response.json())
        .then(data => {
            transactions = data.data;
            displayTransactions();
            calculateSummary();
        })
        .catch(error => console.error('Error fetching data:', error));
}

function getFilteredTransactions() {
    const now = new Date();
    const filter = filterSelect.value;

    if (filter === 'monthly') {
        return transactions.filter(trx => {
            const date = new Date(trx.waktu);
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        });
    } else if (filter === 'yearly') {
        return transactions.filter(trx => {
            const date = new Date(trx.waktu);
            return date.getFullYear() === now.getFullYear();
        });
    } else {
        return transactions;
    }
}

function displayTransactions() {
    transactionTableBody.innerHTML = '';
    const filtered = getFilteredTransactions();

    if (filtered.length === 0) {
        transactionTableBody.innerHTML = `<tr><td colspan="4">Tidak ada data transaksi.</td></tr>`;
        return;
    }

    filtered.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction.waktu}</td>
            <td>${transaction.jenis}</td>
            <td>${transaction.keterangan}</td>
            <td>${formatRupiah(parseFloat(transaction.nominal))}</td>
        `;
        transactionTableBody.appendChild(row);
    });
}

function calculateSummary() {
    const filtered = getFilteredTransactions();
    let totalIncome = 0;
    let totalExpense = 0;

    filtered.forEach(transaction => {
        if (transaction.jenis === 'Pemasukan') {
            totalIncome += parseFloat(transaction.nominal);
        } else if (transaction.jenis === 'Pengeluaran') {
            totalExpense += parseFloat(transaction.nominal);
        }
    });

    const balance = totalIncome - totalExpense;
    totalIncomeDisplay.textContent = formatRupiah(totalIncome);
    totalExpenseDisplay.textContent = formatRupiah(totalExpense);
    balanceDisplay.textContent = formatRupiah(balance);
}

transactionForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const transactionType = document.getElementById('transactionType').value;
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);

    fetch(scriptURL + '?action=save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            'jenis': transactionType,
            'keterangan': description,
            'nominal': amount
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            fetchTransactions();
            transactionForm.reset();
        }
    })
    .catch(error => console.error('Error:', error));
});

filterSelect.addEventListener('change', () => {
    displayTransactions();
    calculateSummary();
});

document.getElementById('downloadButton').addEventListener('click', function () {
    const table = document.getElementById('transactionTable');
    html2canvas(table).then(canvas => {
        const imageURL = canvas.toDataURL('image/jpeg');
        const link = document.createElement('a');
        link.href = imageURL;
        link.download = 'riwayat_transaksi.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});

fetchTransactions();
