@echo off
title Iniciando MovieFlix...
echo =======================================================
echo           INICIANDO SERVIDOR DE MOVIEFLIX
echo =======================================================
echo.

:: Cambiar al directorio donde esta guardado este archivo .bat
cd /d "%~dp0"

echo Buscando e iniciando el servidor local en segundo plano...
:: Inicia el servidor de node npx serve en una ventana separada
start "Servidor MovieFlix" /min cmd /c "npx.cmd serve"

:: Esperar 2 segundos para dar tiempo a que el servidor inicie
echo Esperando a que el servidor este listo...
timeout /t 2 /nobreak >nul

echo Abriendo MovieFlix en tu navegador predeterminado...
:: Abrir el navegador en el puerto por defecto de serve (generalmente localhost:3000)
start http://localhost:3000

echo.
echo =======================================================
echo ¡Listo! Ya puedes usar MovieFlix. 
echo Esta ventana se cerrara sola en 3 segundos.
echo =======================================================
timeout /t 3 >nul
exit
