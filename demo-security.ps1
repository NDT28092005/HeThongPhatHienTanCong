# Demo script for ML Security

$baseUrl = "http://localhost:8000"

Write-Host ""
Write-Host "=============================================="
Write-Host "  DEMO: ML Security - Phat Hien Tan Cong"
Write-Host "=============================================="
Write-Host ""

Write-Host "[1] Health Check - Kiem tra trang thai service"
Write-Host "-------------------------------------------"
$result = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET | ConvertTo-Json -Depth 3
Write-Host $result
Write-Host ""

Write-Host "[2] SQL Injection - Tim kiem with OR 1=1"
Write-Host "-------------------------------------------"
$body = @{
    url = "/search?q=' OR 1=1 --"
} | ConvertTo-Json
$result = Invoke-RestMethod -Uri "$baseUrl/api/v1/security/predict" -Method POST -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 3
Write-Host $result
Write-Host ""

Write-Host "[3] XSS - Script trong content body"
Write-Host "-------------------------------------------"
$body = @{
    url = "/comment"
    content = "<script>alert('xss')</script>"
} | ConvertTo-Json
$result = Invoke-RestMethod -Uri "$baseUrl/api/v1/security/predict" -Method POST -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 3
Write-Host $result
Write-Host ""

Write-Host "[4] Path Traversal - Truy cap file he thong"
Write-Host "-------------------------------------------"
$body = @{
    url = "/download?file=../../etc/passwd"
} | ConvertTo-Json
$result = Invoke-RestMethod -Uri "$baseUrl/api/v1/security/predict" -Method POST -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 3
Write-Host $result
Write-Host ""

Write-Host "[5] Command Injection - Shell command"
Write-Host "-------------------------------------------"
$body = @{
    url = "/ping?host=127.0.0.1; cat /etc/passwd"
} | ConvertTo-Json
$result = Invoke-RestMethod -Uri "$baseUrl/api/v1/security/predict" -Method POST -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 3
Write-Host $result
Write-Host ""

Write-Host "[6] SSRF - Truy cap internal metadata"
Write-Host "-------------------------------------------"
$body = @{
    url = "/fetch?url=http://169.254.169.254/latest/meta-data/"
} | ConvertTo-Json
$result = Invoke-RestMethod -Uri "$baseUrl/api/v1/security/predict" -Method POST -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 3
Write-Host $result
Write-Host ""

Write-Host "[7] Request BINH THUONG - Cho qua"
Write-Host "-------------------------------------------"
$body = @{
    url = "/products?category=milk-tea"
} | ConvertTo-Json
$result = Invoke-RestMethod -Uri "$baseUrl/api/v1/security/predict" -Method POST -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 3
Write-Host $result
Write-Host ""

Write-Host "=============================================="
Write-Host "  DEMO: So sanh 7 ML Models"
Write-Host "=============================================="
Write-Host ""

$models = @("random_forest", "decision_tree", "gradient_boosting", "knn", "svc")

foreach ($model in $models) {
    Write-Host "Model: $model"
    $body = @{
        url = "/admin?q=' OR 1=1 --"
        model_preference = $model
    } | ConvertTo-Json
    $result = Invoke-RestMethod -Uri "$baseUrl/api/v1/security/predict" -Method POST -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 3
    Write-Host $result
    Write-Host ""
}

Write-Host "=============================================="
Write-Host "  DEMO: Test Backend Laravel Middleware"
Write-Host "=============================================="
Write-Host ""

Write-Host "[Attack Request - Bi chan 403]"
$attackResult = Invoke-WebRequest -Uri "http://localhost:8001/api/products?q=' OR 1=1 --" -Method GET -UseBasicParsing -TimeoutSec 10
Write-Host "Status: $($attackResult.StatusCode)"
Write-Host ""

Write-Host "[Normal Request - Cho qua 200]"
$normalResult = Invoke-WebRequest -Uri "http://localhost:8001/api/products" -Method GET -UseBasicParsing -TimeoutSec 10
Write-Host "Status: $($normalResult.StatusCode)"
Write-Host ""

Write-Host "=============================================="
Write-Host "  Demo hoan tat!"
Write-Host "=============================================="
