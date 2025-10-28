// Konfigurasi Google Sheet
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwlGKixOACTr-ixiHuiDxBIpkmJV0Yg7osrBirmXdZwqUfqOnWt0ChAuwKl0ndub1mR4Q/exec"; // Ganti dengan URL script Anda

// Fungsi untuk mengambil data dari Google Sheet
async function fetchData() {
    try {
        const response = await fetch(SCRIPT_URL + "?action=read");
        const data = await response.json();

        if (data && data.data) {
            return data.data;
        } else {
            console.error("Data tidak valid dari Google Sheet:", data);
            return [];
        }
    } catch (error) {
        console.error("Gagal mengambil data:", error);
        return [];
    }
}

// Fungsi untuk mengolah dan menampilkan data
async function loadData(page) {
    const guests = await fetchData();

    let invitedCount = 0;
    let attendingCount = 0;
    let notAttendingCount = 0;
    let filteredGuests = [];

    const tableBody = document.getElementById('guest-table-body');
     if (tableBody) {
        tableBody.innerHTML = ''; // Kosongkan tabel sebelum mengisi ulang
    }


  if(page === 'not-attending'){
        guests.forEach(guest => {
            const [timestamp, nama, alamat, pesan, status, tandaTangan] = guest;
            if (!status || status.toLowerCase() !== 'hadir') {
                notAttendingCount++;
                 filteredGuests.push(guest);
            }
            invitedCount++;
       });
    } else {
         guests.forEach(guest => {
            const [timestamp, nama, alamat, pesan, status, tandaTangan] = guest;

            if (status && status.toLowerCase() === "hadir") {
                attendingCount++;
             } else if (status && status.toLowerCase() === "tidak hadir") {
                notAttendingCount++;
            }
            invitedCount++;

             if (page === "invited") {
                filteredGuests.push(guest);
            } else if (page === 'attending' && status && status.toLowerCase() === 'hadir') {
                 filteredGuests.push(guest);
           }
        });
   }

    if (tableBody) {
        filteredGuests.forEach((guest, index) => {
            const [timestamp, nama, alamat, pesan, status, tandaTangan] = guest;
            let row = document.createElement('tr');
             let noUrutCell = document.createElement('td');
            let timestampCell = document.createElement('td');
            let namaCell = document.createElement('td');
             let alamatCell = document.createElement('td');
            let pesanCell = document.createElement('td');
             let statusCell = document.createElement('td');
             let tandaTanganCell = document.createElement('td');

            noUrutCell.textContent = index + 1;
            timestampCell.textContent = timestamp;
            namaCell.textContent = nama;
            if(alamat){
               alamatCell.textContent = alamat;
            }

              if (pesan) {
               pesanCell.textContent = pesan;
             }

            statusCell.textContent = status ? status : 'Belum Konfirmasi';


           if(tandaTangan){
                if (tandaTangan.startsWith('data:image')) {
                    const img = document.createElement('img');
                       img.src = tandaTangan;
                       img.style.maxWidth = '100px';
                       img.style.height = 'auto';
                     tandaTanganCell.appendChild(img);
                }  else {
                      tandaTanganCell.textContent = 'Tanda Tangan Tidak Valid';
                }
            }
             row.appendChild(noUrutCell);
            row.appendChild(timestampCell);
            row.appendChild(namaCell);
             if(alamat){
                  row.appendChild(alamatCell);
             }
             if(tandaTangan){
                 row.appendChild(tandaTanganCell);
             }
            if (pesan) {
                 row.appendChild(pesanCell);
             }
           if(page !== 'not-attending'){
                 row.appendChild(statusCell);
            }
            tableBody.appendChild(row);
        });
    }
   if (document.getElementById('invited-count')) {
        document.getElementById('invited-count').textContent = invitedCount;
    }
    if (document.getElementById('attending-count')) {
        document.getElementById('attending-count').textContent = attendingCount;
    }
    if (document.getElementById('not-attending-count')) {
       document.getElementById('not-attending-count').textContent = notAttendingCount;
    }
    // Update Diagram
     if (document.getElementById('attendanceChart')) {
        updateChart(attendingCount, notAttendingCount);
    }
}

function updateChart(attendingCount, notAttendingCount) {
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Hadir', 'Tidak Hadir'],
            datasets: [{
                label: 'Status Kehadiran',
                data: [attendingCount, notAttendingCount],
                backgroundColor: [
                    '#28a745',
                    '#dc3545'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Handle Form Submission (Khusus di invited.html dan attending.html)
const addGuestForm = document.querySelectorAll('#add-guest-form');
addGuestForm.forEach(form => {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
          const page = form.closest('.container').querySelector('h1').textContent.split(' ')[1];
         const nama = form.querySelector('#nama').value;
        const alamat = form.querySelector('#alamat').value;
        const pesan = form.querySelector('#pesan').value;
         const status = page === 'Hadir' ? 'hadir' : undefined;
         const timestamp = form.querySelector('#timestamp')?.value;
         const tandaTangan = form.querySelector('#signatureInput')?.value;


        let formData = {
            action: 'add',
            nama: nama,
            alamat: alamat,
        }

          if (pesan) {
           formData.pesan = pesan;
         }
         if(status){
             formData.status = status
        }
        if (timestamp) {
              formData.timestamp = timestamp;
        }
        if (tandaTangan) {
            formData.tandaTangan = tandaTangan;
        }


        if (nama && alamat) {
            try {
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                     headers: {
                       'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams(formData),
                });
                const result = await response.json();
                if (result.status === 'success') {
                    console.log('Berhasil Menambahkan Data');
                   form.reset();
                    if(form.querySelector('#signatureCanvas')){
                         const canvas = form.querySelector('#signatureCanvas');
                           const ctx = canvas.getContext('2d');
                           ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }
                   loadData(page.toLowerCase());
                } else {
                    console.error('Gagal menambahkan data:', result.message);
                }
            } catch (error) {
                console.error('Terjadi kesalahan:', error);
            }
        } else {
            alert("Mohon isi semua field!");
        }
    });
})

// Muat data saat halaman di-load (Untuk halaman utama)
if (document.querySelector('body').classList.contains('index')) {
    loadData();
}