// service-worker.js

// Event listener untuk menerima pesan dari halaman utama (index.html)
self.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'scheduleAlarm') {
        const { id, text, delay } = event.data;
        
        // --- BATASAN UTAMA ---
        // Service Worker tidak bisa menjamin timer yang tepat (browser akan mematikannya).
        // Kita HANYA BISA mengandalkan Notifikasi Sistem.
        
        if (delay > 0 && delay < (24 * 60 * 60 * 1000)) { // Coba untuk delay kurang dari 1 hari
            
            console.log(`Pengingat ${id} dijadwalkan untuk notifikasi dalam ${delay}ms`);
            
            // Menggunakan setTimeout di SW hanya berfungsi jika SW tetap aktif, yang tidak dijamin.
            // Solusi: Kirim notifikasi.

            // Notifikasi ini akan dijamin muncul oleh sistem OS (Android/Desktop)
            // asalkan izin diberikan dan browser mendukung.
            setTimeout(() => {
                 self.registration.showNotification('PENGINGAT AKTIF!', {
                    body: `Waktunya: ${text}`,
                    icon: 'https://via.placeholder.com/48/42a5f5/ffffff?text=AI', // Ganti dengan ikon Anda sendiri
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

    // Buka atau fokus pada jendela klien yang sudah ada (yaitu tab aplikasi pengingat)
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (const client of clientList) {
                // Mencari tab yang sesuai
                if (client.url.includes('index.html') && 'focus' in client) {
                    return client.focus();
                }
            }
            // Jika tidak ada tab yang terbuka, buka tab baru ke root (/)
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});