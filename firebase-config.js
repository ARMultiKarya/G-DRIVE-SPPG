/**
 * FIREBASE REALTIME DATABASE CONFIGURATION
 * 
 * Agar 5 orang atau lebih dapat menggunakan aplikasi ini bersamaan dan link
 * yang Anda isi otomatis tersimpan di Cloud (tidak hilang saat di-share ke orang lain):
 * 
 * 1. Buka https://console.firebase.google.com/ (gratis dengan akun Google Anda)
 * 2. Klik "Add project" (beri nama misal: sppg-gdrive-hub)
 * 3. Di menu sebelah kiri, pilih: Build > Realtime Database > "Create Database"
 * 4. Pilih lokasi terdekat (misal: Singapore) lalu pilih "Start in test mode" (agar bisa dibaca & ditulis oleh tim)
 * 5. Buka Project Settings (ikon gerigi di kiri atas) > General > Di bagian "Your apps", klik ikon Web (</>)
 * 6. Salin firebaseConfig yang diberikan Google, lalu tempel di bawah ini:
 */

window.FIREBASE_CONFIG = {
  // Ganti dengan konfigurasi Firebase Anda:
  apiKey: "AIzaSyAlkr8rLBo0HUG5LkCWamKfzVB_v9iW3zQ",
  authDomain: "g-drive-sppg.firebaseapp.com",
  databaseURL: "https://g-drive-sppg-default-rtdb.asia-southeast1.firebasedatabase.app", // Contoh: "https://g-drive-sppg-default-rtdb.asia-southeast1.firebasedatabase.app/"
  projectId: "g-drive-sppg",
  storageBucket: "g-drive-sppg.firebasestorage.app",
  messagingSenderId: "769910085559",
  appId: "1:769910085559:web:ca99ec46641535c63cba32"
};
