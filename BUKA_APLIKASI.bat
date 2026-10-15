@echo off
chcp 65001 > nul
title LINK G-DRIVE SPPG
cls
echo =========================================================
echo   🚀 MEMULAI APLIKASI LINK GOOGLE DRIVE SPPG
echo =========================================================
echo.
echo   Membuka aplikasi di browser...
echo   URL: http://localhost:3000
echo.
echo   (Biarkan jendela ini tetap terbuka selama menggunakan aplikasi)
echo =========================================================
echo.
start "" http://localhost:3000
node server.js
pause
