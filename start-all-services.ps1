$services = @(
    @{ Name = "API Gateway"; Path = "services\api-gateway"; Command = "node index.js" },
    @{ Name = "User Service"; Path = "services\user-service"; Command = "node index.js" },
    @{ Name = "Stream Service"; Path = "services\stream-service"; Command = "node index.js" },
    @{ Name = "Interaction Service"; Path = "services\interaction-service"; Command = "node index.js" },
    @{ Name = "Recommendation Service"; Path = "services\recommendation-service"; Command = "C:\Users\LENOVO\AppData\Local\Programs\Python\Python38\python.exe main.py" },
    @{ Name = "Admin Service"; Path = "services\admin-service"; Command = "node index.js" },
    @{ Name = "Tenant Service"; Path = "services\tenant-service"; Command = "node index.js" },
    @{ Name = "Webhook Service"; Path = "services\webhook-service"; Command = "node index.js" },
    @{ Name = "Analytics Service"; Path = "services\analytics-service"; Command = "node index.js" },
    @{ Name = "Admin UI"; Path = "services\admin-panel-ui"; Command = "npm run dev" }
)

foreach ($svc in $services) {
    Write-Host "Starting $($svc.Name)..."
    $fullPath = Join-Path $PSScriptRoot $svc.Path
    cmd /c "start /D `"$fullPath`" powershell -NoExit -Command `"$($svc.Command)`""
}
