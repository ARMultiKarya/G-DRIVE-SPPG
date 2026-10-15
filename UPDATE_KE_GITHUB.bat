@echo off
chcp 65001 > nul
title UPDATE KE GITHUB - LINK G-DRIVE SPPG
cls
echo =========================================================
echo   🚀 UPDATE PROYEK KE GITHUB - LINK G-DRIVE SPPG
echo =========================================================
echo.

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Program Git belum terdeteksi di komputer Anda.
    echo.
    echo Anda memiliki 2 cara mudah:
    echo 1. Cara termudah: Buka website GitHub dan upload/seret file langsung.
    echo 2. Pasang Git otomatis dengan mengetik di terminal:
    echo    winget install --id Git.Git -e --source winget
    echo.
    pause
    exit /b
)

if not exist ".git" (
    echo [i] Inisialisasi Git pertama kali...
    git init
    git branch -M main
    git add .
    git commit -m "Initial commit: Aplikasi Link Google Drive SPPG Multi-Akun"
    echo.
    echo Masukkan URL Repositori GitHub Anda:
    echo (Contoh: https://github.com/username-anda/link-gdrive-sppg.git)
    set /p repo_url="URL GitHub: "
    if not "%repo_url%"=="" (
        git remote add origin %repo_url%
        echo.
        echo Mengunggah ke GitHub...
        git push -u origin main
    )
) else (
    echo Menyiapkan berkas yang diperbarui...
    git add .
    set /p commit_msg="Tulis pesan pembaruan (tekan Enter untuk default): "
    if "%commit_msg%"=="" set commit_msg=Update aplikasi: fitur multi-akun dan sinkronisasi
    git commit -m "%commit_msg%"
    echo.
    echo Mengunggah perubahan ke GitHub...
    git push
)

echo.
echo =========================================================
echo   ✅ Selesai! Perubahan telah terkirim ke GitHub.
echo =========================================================
pause
