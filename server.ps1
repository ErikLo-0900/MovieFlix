# ==========================================================================
# MovieFlix Portable Web Server (PowerShell Native)
# Runs on any Windows PC without Node.js, Python, or external programs.
# Supports HTTP 206 Range Requests for seekable local video playback.
# ==========================================================================

$port = 3000

# Obtener la dirección IP local de forma dinámica
$localIp = ""
try {
    # Busca la IP de la interfaz conectada a la puerta de enlace activa (Internet)
    $activeRoute = Get-NetRoute -DestinationPrefix "0.0.0.0/0" -ErrorAction SilentlyContinue
    if ($activeRoute) {
        $localIp = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceIndex $activeRoute.InterfaceIndex | Select-Object -First 1).IPAddress
    } else {
        # Fallback: tomar la primera IP de red local
        $localIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } | Select-Object -First 1).IPAddress
    }
} catch {
    # Fallback silencioso
}

# Iniciar HTTP Listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

if ($localIp -and $localIp -notmatch '\s') {
    try {
        $listener.Prefixes.Add("http://$($localIp):$port/")
    } catch {
        Write-Host "Aviso: No se pudo habilitar el acceso a red local para la IP $($localIp) (requiere ejecutar como Administrador). El servidor estara disponible solo en localhost." -ForegroundColor Yellow
    }
}

try {
    $listener.Start()
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "   SERVIDOR PORTABLE MOVIEFLIX ACTIVO" -ForegroundColor Green
    Write-Host "   Puerto: $port" -ForegroundColor Green
    Write-Host "   Local:      http://localhost:$port/" -ForegroundColor Green
    if ($localIp) {
        Write-Host "   Red/Network: http://$($localIp):$port/" -ForegroundColor Green
    }
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "Abriendo el navegador..." -ForegroundColor Yellow
    
    # Abrir el navegador en la URL local por defecto
    Start-Process "http://localhost:$port/"

    Write-Host "Escuchando solicitudes. Presiona Ctrl + C en esta ventana para apagar el servidor." -ForegroundColor Gray
    Write-Host ""

    while ($listener.IsListening) {
        $context = $null
        $request = $null
        $response = $null
        $url = ""
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response
            
            $url = $request.Url.LocalPath
            if ($url -eq "/") { $url = "/index.html" }
            
            # --- ENDPOINTS API PARA SINCRONIZACIÓN DE BASE DE DATOS ---
            if ($url -eq "/api/save-content" -and $request.HttpMethod -eq "POST") {
                $reader = New-Object System.IO.StreamReader($request.InputStream)
                $body = $reader.ReadToEnd()
                $reader.Close()
                
                $dbPath = Join-Path (Get-Location) "movies_db.json"
                [System.IO.File]::WriteAllText($dbPath, $body, [System.Text.Encoding]::UTF8)
                
                $response.StatusCode = 200
                $response.ContentType = "application/json; charset=utf-8"
                $resBytes = [System.Text.Encoding]::UTF8.GetBytes('{"status":"success"}')
                $response.ContentLength64 = $resBytes.Length
                $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
                $response.Close()
                continue
            }

            if ($url -eq "/api/load-content" -and $request.HttpMethod -eq "GET") {
                $dbPath = Join-Path (Get-Location) "movies_db.json"
                $response.ContentType = "application/json; charset=utf-8"
                if (Test-Path $dbPath -PathType Leaf) {
                    $response.StatusCode = 200
                    $content = [System.IO.File]::ReadAllText($dbPath, [System.Text.Encoding]::UTF8)
                    $resBytes = [System.Text.Encoding]::UTF8.GetBytes($content)
                } else {
                    $response.StatusCode = 404
                    $resBytes = [System.Text.Encoding]::UTF8.GetBytes('{"status":"error","message":"not_found"}')
                }
                $response.ContentLength64 = $resBytes.Length
                $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
                $response.Close()
                continue
            }

            if ($url -eq "/api/save-profiles" -and $request.HttpMethod -eq "POST") {
                $reader = New-Object System.IO.StreamReader($request.InputStream)
                $body = $reader.ReadToEnd()
                $reader.Close()
                
                $dbPath = Join-Path (Get-Location) "profiles_db.json"
                [System.IO.File]::WriteAllText($dbPath, $body, [System.Text.Encoding]::UTF8)
                
                $response.StatusCode = 200
                $response.ContentType = "application/json; charset=utf-8"
                $resBytes = [System.Text.Encoding]::UTF8.GetBytes('{"status":"success"}')
                $response.ContentLength64 = $resBytes.Length
                $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
                $response.Close()
                continue
            }

            if ($url -eq "/api/load-profiles" -and $request.HttpMethod -eq "GET") {
                $dbPath = Join-Path (Get-Location) "profiles_db.json"
                $response.ContentType = "application/json; charset=utf-8"
                if (Test-Path $dbPath -PathType Leaf) {
                    $response.StatusCode = 200
                    $content = [System.IO.File]::ReadAllText($dbPath, [System.Text.Encoding]::UTF8)
                    $resBytes = [System.Text.Encoding]::UTF8.GetBytes($content)
                } else {
                    $response.StatusCode = 404
                    $resBytes = [System.Text.Encoding]::UTF8.GetBytes('{"status":"error","message":"not_found"}')
                }
                $response.ContentLength64 = $resBytes.Length
                $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
                $response.Close()
                continue
            }

            # Obtener ruta absoluta del archivo solicitado
            $filePath = Join-Path (Get-Location) $url.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
            
            # Registrar solicitud en la consola
            Write-Host "$($request.HttpMethod) - $($url)" -ForegroundColor White

            if (Test-Path $filePath -PathType Leaf) {
                $fileLength = (Get-Item $filePath).Length
                
                # Determinar Content-Type
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $contentType = "application/octet-stream"
                switch ($ext) {
                    ".html" { $contentType = "text/html; charset=utf-8" }
                    ".htm"  { $contentType = "text/html; charset=utf-8" }
                    ".css"  { $contentType = "text/css" }
                    ".js"   { $contentType = "application/javascript" }
                    ".json" { $contentType = "application/json; charset=utf-8" }
                    ".png"  { $contentType = "image/png" }
                    ".jpg"  { $contentType = "image/jpeg" }
                    ".jpeg" { $contentType = "image/jpeg" }
                    ".gif"  { $contentType = "image/gif" }
                    ".svg"  { $contentType = "image/svg+xml" }
                    ".mp4"  { $contentType = "video/mp4" }
                    ".webm" { $contentType = "video/webm" }
                    ".ogv"  { $contentType = "video/ogg" }
                    ".mp3"  { $contentType = "audio/mpeg" }
                    ".wav"  { $contentType = "audio/wav" }
                    ".ico"  { $contentType = "image/x-icon" }
                }
                $response.ContentType = $contentType
                
                # Soporte para HTTP 206 Range Requests (Crucial para buscar/adelantar videos locales en Chrome/Safari/Edge)
                $rangeHeader = $request.Headers["Range"]
                if ($rangeHeader -and $rangeHeader -match "bytes=(\d+)-(\d+)?") {
                    $start = [int64]$Matches[1]
                    $end = $fileLength - 1
                    if ($Matches[2]) { $end = [int64]$Matches[2] }
                    
                    # Ajustar rangos válidos
                    if ($start -ge $fileLength) {
                        $response.StatusCode = 416 # Range Not Satisfiable
                        $response.Close()
                        continue
                    }
                    if ($end -ge $fileLength) {
                        $end = $fileLength - 1
                    }
                    
                    $contentLength = $end - $start + 1
                    $response.StatusCode = 206 # Partial Content
                    $response.Headers.Add("Content-Range", "bytes $start-$end/$fileLength")
                    $response.ContentLength64 = $contentLength
                    
                    # Abrir archivo y transmitir el fragmento solicitado
                    $fs = New-Object System.IO.FileStream($filePath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::Read)
                    try {
                        [void]$fs.Seek($start, [System.IO.SeekOrigin]::Begin)
                        $buffer = New-Object byte[] 65536 # 64KB Buffer
                        $remaining = $contentLength
                        while ($remaining -gt 0) {
                            $toRead = [System.Math]::Min($remaining, $buffer.Length)
                            $read = $fs.Read($buffer, 0, $toRead)
                            if ($read -le 0) { break }
                            $response.OutputStream.Write($buffer, 0, $read)
                            $remaining -= $read
                        }
                    } finally {
                        $fs.Close()
                    }
                } else {
                    # Respuesta normal completa (HTTP 200)
                    $response.StatusCode = 200
                    $response.ContentLength64 = $fileLength
                    $fs = New-Object System.IO.FileStream($filePath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::Read)
                    try {
                        $fs.CopyTo($response.OutputStream)
                    } finally {
                        $fs.Close()
                    }
                }
            } else {
                # Recurso no encontrado (HTTP 404)
                $response.StatusCode = 404
                $response.ContentType = "text/html; charset=utf-8"
                $errorMessage = "<h1>404 Recurso No Encontrado</h1><p>El archivo <b>$url</b> no existe en la carpeta del proyecto.</p>"
                $errBytes = [System.Text.Encoding]::UTF8.GetBytes($errorMessage)
                $response.ContentLength64 = $errBytes.Length
                $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
            }
            $response.Close()
        } catch {
            Write-Host "Error al procesar solicitud ($url): $_" -ForegroundColor Yellow
            if ($response) {
                try { $response.Close() } catch {}
            }
        }
    }
} catch {
    Write-Host "Error en el servidor: $_" -ForegroundColor Red
    exit 1
} finally {
    if ($listener -and $listener.IsListening) {
        $listener.Stop()
    }
    Write-Host "Servidor apagado." -ForegroundColor Yellow
}
