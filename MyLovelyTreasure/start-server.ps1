$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:3000/")
$listener.Start()
Write-Host "HTTP Server running on http://localhost:3000/"
Write-Host "Press Ctrl+C to stop the server"

while ($true) {
    $context = $listener.GetContext()
    $requestUrl = $context.Request.Url.LocalPath
    $filePath = Join-Path (Get-Location) $requestUrl
    
    # 如果请求的是目录，默认返回index.html
    if ($filePath.EndsWith('/')) {
        $filePath = Join-Path $filePath "index.html"
    }
    
    # 如果文件不存在，返回index.html
    if (-not (Test-Path $filePath)) {
        $filePath = Join-Path (Get-Location) "index.html"
    }
    
    try {
        $content = [System.IO.File]::ReadAllBytes($filePath)
        $response = $context.Response
        $response.ContentLength64 = $content.Length
        
        # 设置MIME类型
        $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
        switch ($extension) {
            ".html" { $response.ContentType = "text/html" }
            ".css" { $response.ContentType = "text/css" }
            ".js" { $response.ContentType = "application/javascript" }
            ".json" { $response.ContentType = "application/json" }
            ".png" { $response.ContentType = "image/png" }
            ".jpg" { $response.ContentType = "image/jpeg" }
            ".gif" { $response.ContentType = "image/gif" }
            ".svg" { $response.ContentType = "image/svg+xml" }
            default { $response.ContentType = "application/octet-stream" }
        }
        
        $response.OutputStream.Write($content, 0, $content.Length)
        $response.Close()
    } catch {
        Write-Host "Error serving file: $filePath"
        Write-Host $_.Exception.Message
    }
}