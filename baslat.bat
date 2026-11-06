@echo off
chcp 65001 >nul
title Moda Berliner - Sunucu Baslatiliyor

echo ========================================================
echo               MODA BERLINER QR MENU SISTEMI
echo ========================================================
echo.
echo [INFO] Baglanti Adresleri:
echo   - Menu:           http://localhost:3000/menu
echo   - Yonetim Paneli: http://localhost:3000/admin
echo.
echo [INFO] Yonetici Giris Bilgileri:
echo   - Kullanici Adi:  admin
echo   - Sifre:          berliner2026
echo.
echo [INFO] Sunucu baslatiliyor, lutfen bekleyin...
echo.

npm run dev
pause
