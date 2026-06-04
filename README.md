# DAILY LEVEL UP

**DAILY LEVEL UP** adalah aplikasi web sederhana untuk mencatat produktivitas harian dengan sistem checklist, catatan harian, statistik, history, dan export progress ke gambar PNG.

Project ini dibuat dengan **HTML, CSS, dan JavaScript murni**. Tidak ada framework, backend, database, login, atau proses instalasi yang ribet.

## Highlight

- Dark mode dan light mode dengan switch icon bulan/matahari.
- Daily task dengan tambah, checklist, mode urutkan, mode edit, mode hapus multi-select, dan konfirmasi sebelum menghapus.
- Progress bar dan statistik harian otomatis.
- Statistik mingguan dan bulanan.
- Task khusus mingguan dengan highlight otomatis untuk hari ini.
- Checklist task khusus hari ini agar program tambahan tetap terpantau.
- Tombol panduan interaktif dan tombol kembali ke atas.
- Daily notes yang tersimpan per tanggal.
- History read-only dengan mode harian, rekap mingguan, dan rekap bulanan.
- Export progress dan riwayat ke format `.png`.
- Export riwayat harian/mingguan/bulanan ke format `.png`.
- Data tersimpan otomatis di LocalStorage.
- Manifest dan ikon PWA untuk shortcut/Add to Home Screen.
- Responsive mobile-first.

## Preview

Buka `index.html` langsung di browser untuk mencoba aplikasinya.

```text
DAILY LEVEL UP
Personal productivity dashboard for small daily wins.
```

Untuk membuat tampilan repository makin menarik, tambahkan screenshot aplikasi dengan nama `preview.png`, lalu aktifkan baris gambar ini:

```md
![DAILY LEVEL UP Preview](./preview.png)
```

## Fitur Utama

### Daily Task

Kelola checklist harian dengan cepat. Task default sudah tersedia saat pertama kali aplikasi dibuka, dan kamu tetap bisa menambah, mengedit, atau menghapus task sesuai rutinitas pribadi.

Task juga bisa diurutkan ulang lewat tombol mode urutkan, lalu drag item dari area kotaknya. Mode edit dan hapus dipisah lewat tombol khusus agar lebih nyaman di Android dan tidak mengganggu scroll.

### Task Khusus Mingguan

Buat program berbeda untuk setiap hari. Misalnya Senin berisi push up dan plank, sementara Selasa punya program lain. Kotak hari ini otomatis di-highlight agar mudah melihat jadwal khusus yang perlu diperhatikan.

Task khusus di hari ini bisa dicentang untuk menandai mana yang sudah dikerjakan. Status checklist khusus disimpan per tanggal.

### Daily Notes

Tulis catatan harian, refleksi, ide, atau hal penting. Notes disimpan berdasarkan tanggal, jadi catatan hari ini tidak menimpa catatan kemarin.

### Statistik

Aplikasi menampilkan ringkasan produktivitas:

- Total task
- Task selesai
- Task belum selesai
- Persentase progress
- Statistik minggu berjalan
- Statistik bulan berjalan

### History Read Only

Pilih tanggal tertentu untuk melihat ulang riwayat harian:

- Task pada hari tersebut
- Status selesai atau belum
- Progress hari itu
- Daily notes yang pernah dibuat

History juga punya mode rekap mingguan dan bulanan untuk melihat akumulasi progress per tanggal. Semua history bersifat read-only supaya data lama tidak mudah berubah tanpa sengaja.

### Export PNG

Di bagian History, tombol **Export Riwayat** akan mengekspor mode yang sedang aktif: harian, mingguan, atau bulanan.

### Theme Switcher

Gunakan toggle bulan/matahari untuk berpindah antara dark mode dan light mode. Pilihan tema akan tersimpan otomatis.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- LocalStorage
- Canvas API untuk export PNG

## Struktur File

```text
level-up/
|-- index.html
|-- style.css
|-- script.js
|-- manifest.webmanifest
|-- favicon.png
|-- icons/
`-- README.md
```

## Cara Menjalankan

Tidak perlu install dependency apa pun.

1. Clone atau download repository ini.
2. Buka file `index.html` di browser.
3. Mulai isi checklist dan catatan harian.

## Data Storage

Semua data disimpan secara lokal di browser menggunakan LocalStorage:

- Task aktif
- Checklist per tanggal
- Daily notes per tanggal
- Snapshot task untuk history
- Tema dark/light

Karena datanya lokal, progress hanya tersimpan di browser yang sama. Jika LocalStorage browser dibersihkan, data aplikasi juga ikut hilang.

## Default Task

Saat pertama kali dibuka, aplikasi otomatis membuat task berikut:

- Sholat 5 Waktu
- Sarapan
- Makan Siang
- Makan Malam
- Workout / Boxing
- Minum Air Yang Cukup
- Daily Notes

## Cocok Untuk Belajar

Project ini sederhana, tapi punya cukup banyak konsep frontend yang berguna:

- DOM manipulation
- Event handling
- LocalStorage
- Date handling
- Responsive layout
- Theme switching
- Canvas export
- UI state management sederhana
- Guided tour sederhana

## Pengembangan Lanjutan

Beberapa ide yang bisa ditambahkan berikutnya:

- Filter history berdasarkan minggu atau bulan
- Import data backup
- Streak harian
- Kategori task
- Custom quote motivasi
- Screenshot preview otomatis untuk README

## License

Silakan gunakan, ubah, dan kembangkan project ini untuk kebutuhan pribadi atau pembelajaran.
