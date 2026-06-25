@echo off
:: Verificar si se ejecuta como Administrador. Si no, solicitar elevacion.
openfiles >nul 2>&1
if %errorlevel% neq 0 (
    echo Solicitando permisos de Administrador para habilitar la red local...
    powershell -Command "Start-Process -FilePath '%0' -Verb RunAs"
    exit /b
)

title Servidor Portable MovieFlix
echo ========================================================
echo        INICIANDO SERVIDOR PORTABLE MOVIEFLIX
echo ========================================================
echo.
echo Requisitos: Ninguno. Se ejecuta usando herramientas nativas de Windows.
echo.
echo * No cierres esta ventana de comando mientras uses la pagina.
echo * Al cerrar esta ventana, el servidor se detendra automaticamente.
echo.
echo ========================================================
echo.

cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File server.ps1

if %errorlevel% neq 0 (
    echo.
    echo Ocurrio un error al iniciar el servidor con PowerShell.
    echo Intentando abrir index.html directamente en el navegador...
    start index.html
    pause
)
