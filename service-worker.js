// service-worker.js

// Event listener untuk menerima pesan dari halaman utama (index.html)
self.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'scheduleAlarm') {
        const { id, text, time, delay } = event.data;
        
        // Untuk Service Worker, tidak ada cara langsung untuk menggunakan setTimeout yang lama.
        // Solusi terbaik adalah mengandalkan browser untuk memicu event berdasarkan waktu 
        // atau menggunakan alarm lokal di browser aktif (yang sudah dilakukan di index.html).
        
        // Karena Service Worker tidak bisa menjamin timer yang tepat (browser akan mematikannya),
        // kita fokus pada Notifikasi yang akan muncul di sekitar waktu alarm.

        // Jika delay-nya kurang dari 5 menit (300.000 ms), kita akan coba atur.
        // Jika lebih, Service Worker mungkin tidak akan aktif pada saat itu,
        // sehingga kita bergantung pada notifikasi jika tab di-background.
        
        // Catatan: Service Worker akan 'tidur' setelah beberapa detik tidak aktif, 
        // sehingga timer jangka panjang sangat tidak dapat diandalkan. 
        // Namun, notifikasi akan dipicu saat jendela baru dibuka atau saat alarm dekat.
        
        // Implementasi ini bergantung pada browser yang 'bangun' secara berkala
        // untuk memeriksa notifikasi terjadwal (seperti di Android). 
        // Untuk desktop, alarm hanya akan terjamin jika tab tetap dibuka.
        
        if (delay > 0) {
            // Di sini, kita akan mencoba menampilkan notifikasi *segera*
            // jika Service Worker aktif, namun kita tidak bisa menjamin
            // waktu yang tepat.
            
            // Sebagai solusi, kami akan memicu notifikasi ketika halaman utama
            // mengirim pesan.
            
            // Di banyak browser modern (terutama mobile), browser akan memproses
            // notifikasi yang dipicu di halaman utama meskipun di-background.
            
            console.log(`Pengingat ${id} dijadwalkan untuk notifikasi dalam ${delay}ms`);
            
            // Kita akan menggunakan `setTimeout` di dalam SW, 
            // tapi perlu diingat ini TIDAK DIJAMIN berfungsi.
            // Ini hanyalah praktik terbaik yang paling dekat.
            
            setTimeout(() => {
                 self.registration.showNotification('PENGINGAT AKTIF!', {
                    body: `Waktunya: ${text}`,
                    icon: 'https://via.placeholder.com/48/42a5f5/ffffff?text=AI', // Ganti dengan ikon Anda
                    vibrate: [200, 100, 200, 100, 200],
                    tag: `reminder-${id}` // Tag agar notifikasi tidak duplikat
                });
            }, delay);
        }
    }
});

// Event click notifikasi (jika pengguna mengklik notifikasi)
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    // Buka atau fokus pada jendela klien yang sudah ada
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes('index.html') && 'focus' in client) {
                    return client.focus();
                }
            }
            // Jika tidak ada tab yang terbuka, buka tab baru
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});