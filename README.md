# 📂 LINK G-DRIVE SPPG

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-brightgreen.svg" alt="Status">
  <img src="https://img.shields.io/badge/Google%20Drive-Supported-4285F4.svg?logo=googledrive&logoColor=white" alt="Google Drive">
  <img src="https://img.shields.io/badge/Language-HTML5%20%7C%20CSS3%20%7C%20JS-F7DF1E.svg?logo=javascript&logoColor=black" alt="Technologies">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
</p>

**LINK G-DRIVE SPPG** adalah aplikasi web modern, ringan, dan cepat untuk menyimpan, mengelompokkan, dan membuka link berkas serta folder Google Drive secara langsung dan terorganisir.

Aplikasi ini dapat dijalankan secara lokal di komputer, maupun di-hosting secara gratis langsung di **GitHub Pages**.

---

## 🌟 Fitur Utama

- **👤 Sistem Multi-Akun (Ruang Link Pribadi per Orang):**
  - Setiap pengguna (5 orang atau lebih) dapat **membuat akun sendiri** dan login secara terpisah.
  - **Data Terisolasi:** Saat Anda login dengan akun Anda, **HANYA link Google Drive milik Anda yang muncul**. Pengguna lain memiliki ruang link masing-masing dan tidak akan tercampur!
  - **Data Aman & Tidak Hilang:** Semua link yang Anda simpan akan tetap tersimpan aman di akun Anda dan tidak akan terhapus saat pengguna lain menggunakan aplikasi.
  - Dilengkapi fitur ganti akun instan (*Quick Account Switcher*).

- **🚀 Buka Google Drive Langsung (1-Klik):**
  - Klik tombol **"Buka Google Drive"** untuk langsung menuju ke file/folder Drive di tab baru.
  - Dilengkapi penghitung otomatis jumlah klik berkas dibuka (*contoh: 👁️ 48x dibuka*).

- **✨ Deteksi Cerdas Tipe Link (Smart Auto-Detect):**
  - Cukup tempelkan link Google Drive, aplikasi otomatis mendeteksi apakah itu:
    - 📁 **Folder Drive**
    - 📊 **Google Sheets** (Spreadsheet)
    - 📝 **Google Docs** (Dokumen)
    - 📋 **Google Forms** (Formulir)
    - 📽️ **Google Slides** (Presentasi)
    - 📄 **Berkas PDF / File lainnya**
  - Diberi ikon dan warna khas Google yang rapi.

- **🔍 Pencarian Cepat & Penyaringan Real-Time:**
  - Cari instan berdasarkan nama berkas, catatan keterangan, kategori, maupun link URL.
  - Filter kategori SPPG dan filter berdasarkan tipe berkas.
  - Urutkan berdasarkan: *Terbaru, Terlama, Nama (A - Z), dan Paling Sering Dibuka*.

- **⭐ Favorit & Pin ke Atas:**
  - Tandai berkas prioritas dengan bintang agar selalu muncul di urutan teratas.

- **📱 QR Code Instan untuk Smartphone:**
  - Dilengkapi fitur cetak/tampil kode QR untuk setiap link. Rekan kerja atau Anda bisa langsung memindainya lewat kamera HP untuk membuka file di Google Drive ponsel.

- **📋 Tombol Salin Cepat:**
  - Salin URL Google Drive ke clipboard hanya dengan satu klik.

- **🌓 Mode Gelap & Terang (Dark / Light Theme):**
  - Beralih tema secara mulus sesuai kenyamanan mata Anda.

- **💾 Penyimpanan Aman & Cadangan Data (Backup / Restore):**
  - Tersimpan otomatis di browser lokal (`localStorage`).
  - **Export JSON:** Unduh cadangan data link Anda ke file `.json`.
  - **Import JSON:** Pulihkan atau gabungkan data jika pindah komputer / browser.

---

## 🖥️ Struktur File Proyek

```text
LINK G-DRIVE SPPG/
├── index.html          # Antarmuka utama aplikasi
├── style.css           # Desain sistem dan tema (Dark/Light mode)
├── app.js              # Logika aplikasi dan manajemen data
├── firebase-config.js  # Konfigurasi Cloud Sync Firebase (Multi-User)
├── qrcode.min.js       # Modul generator QR Code offline
├── server.js           # Server HTTP lokal Node.js (Zero-dependency)
├── package.json        # Konfigurasi npm
├── BUKA_APLIKASI.bat   # Peluncur 1-klik untuk Windows
├── .gitignore          # Berkas pengecualian Git
├── LICENSE             # Lisensi MIT
└── README.md           # Dokumentasi aplikasi
```

---

## 👥 Sinkronisasi Multi-User (5 Orang atau Lebih)

Agar link yang Anda tambahkan **tidak hilang** dan **langsung muncul secara otomatis di layar 5 orang atau lebih** yang Anda bagikan link website-nya:

Aplikasi ini telah terintegrasi dengan **Firebase Realtime Database (Gratis & Real-time)**:

1. **Buka Firebase Console:** Masuk ke [console.firebase.google.com](https://console.firebase.google.com) menggunakan akun Google Anda.
2. **Buat Proyek Baru:** Klik **Add Project** (beri nama misal: `sppg-gdrive-hub`).
3. **Aktifkan Realtime Database:**
   - Di menu samping, pilih **Build** > **Realtime Database** > klik **Create Database**.
   - Pilih lokasi (misal: *Singapore*).
   - Pada pilihan aturan keamanan (*Security rules*), pilih **Start in test mode** agar tim dapat langsung membaca dan menulis data link bersama.
4. **Sambungkan ke Aplikasi:**
   - Salin URL Database di bagian atas (contoh: `https://sppg-gdrive-hub-default-rtdb.asia-southeast1.firebasedatabase.app`).
   - Buka aplikasi Anda, klik tombol **"Sync Cloud"** di pojok kanan atas, tempelkan URL tersebut, lalu klik **Hubungkan & Simpan** (atau masukkan langsung ke file `firebase-config.js`).
5. **Selesai!**
   - Saat Anda mengunggah aplikasi ini ke **GitHub Pages**, setiap orang yang membuka link website akan terhubung ke database yang sama.
   - Setiap Anda (atau rekan tim) menambah, mengedit, atau menghapus link, perubahan akan **langsung muncul seketika secara real-time** di HP/laptop seluruh anggota tim tanpa perlu refresh halaman!


---

## ⚡ Cara Menjalankan Secara Lokal

### Pilihan 1: Klik Dua Kali (Windows)
Klik dua kali file:
👉 **`BUKA_APLIKASI.bat`**
Browser akan otomatis membuka `http://localhost:3000`.

### Pilihan 2: Menggunakan Terminal
```bash
npm start
```
Buka browser ke alamat `http://localhost:3000`.

### Pilihan 3: Buka Langsung (Tanpa Node.js)
Klik dua kali file **`index.html`** langsung dari File Explorer di Google Chrome atau Microsoft Edge.

---

## 🌐 Menghosting Gratis di GitHub Pages

Karena aplikasi ini dibangun murni menggunakan HTML, CSS, dan JavaScript di sisi browser, Anda bisa menjadikannya online dan dapat diakses dari mana saja secara gratis melalui **GitHub Pages**:

1. Masuk ke repositori Anda di GitHub.
2. Buka tab **Settings** > menu **Pages** (di sisi kiri).
3. Pada bagian **Build and deployment** > **Branch**:
   - Pilih branch `main`.
   - Folder pilih `/(root)`.
4. Klik **Save**.
5. Tunggu sekitar 1–2 menit, Anda akan mendapatkan alamat website publik gratis seperti:
   `https://username.github.io/nama-repo/`

---

## ⌨️ Pintasan Keyboard
- **`/`** atau **`Ctrl + K`** : Fokus ke pencarian
- **`Ctrl + N`** atau **`Alt + N`** : Tambah link baru
- **`Esc`** : Tutup jendela popup/modal

---

## 📄 Lisensi
Didistribusikan di bawah lisensi [MIT License](LICENSE).
