# ==============================================================================
# Servidor HTTP Local Ligero para compartir la aplicación en la red Wi-Fi / LAN
# Compatible con Windows PowerShell sin dependencias externas (.NET nativo)
# ==============================================================================

$port = 8080
$folder = $PSScriptRoot

$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'Loopback' -and $_.IPAddress -notmatch '^169\.' } | Select-Object -First 1).IPAddress
if (-not $ip) { $ip = "127.0.0.1" }

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://*:$port/")

try {
    $listener.Start()
} catch {
    # Si falla por permisos de comodín http://*:, intentar con localhost e IP directa
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://+:$port/")
    $listener.Start()
}

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host " SERVIDOR LOCAL ACTIVO - LEXCONSTRUCTA" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "En esta computadora:    http://localhost:$port" -ForegroundColor Yellow
Write-Host "En celular o tablet:    http://${ip}:$port" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "Nota: El otro dispositivo debe estar conectado a la misma red Wi-Fi." -ForegroundColor Gray
Write-Host "Presione Ctrl+C en esta ventana para detener el servidor.`n" -ForegroundColor Gray

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawUrl = $request.Url.LocalPath
        if ($rawUrl -eq "/" -or [string]::IsNullOrWhiteSpace($rawUrl)) {
            $rawUrl = "/index.html"
        }

        $localPath = Join-Path $folder ($rawUrl.TrimStart("/").Replace("/", "\"))

        if (Test-Path $localPath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            $mime = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".svg"  { "image/svg+xml" }
                ".png"  { "image/png" }
                default { "application/octet-stream" }
            }

            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 - Archivo no encontrado")
            $response.OutputStream.Write($msg, 0, $msg.Length)
        }
        $response.Close()
    } catch {
        # Manejo de cierre o desconexión
    }
}
