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
├── index.html        # Antarmuka utama aplikasi
├── style.css         # Desain sistem dan tema (Dark/Light mode)
├── app.js            # Logika aplikasi dan manajemen data
├── qrcode.min.js     # Modul generator QR Code offline
├── server.js         # Server HTTP lokal Node.js (Zero-dependency)
├── package.json      # Konfigurasi npm
├── BUKA_APLIKASI.bat # Peluncur 1-klik untuk Windows
├── .gitignore        # Berkas pengecualian Git
├── LICENSE           # Lisensi MIT
└── README.md         # Dokumentasi aplikasi
```

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
