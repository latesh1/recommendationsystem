$loginBody = @{
    email = 'test@example.com'
    password = 'password123'
} | ConvertTo-Json

$resp = Invoke-RestMethod -Uri "http://localhost:3001/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $resp.token
Write-Host "Obtained Token: $token"

$trackBody = @{
    streamId = '65d0a1b2c3d4e5f6a7b8c9d0'
    type = 'WATCH_TIME'
    duration = 300
    percentage = 50
} | ConvertTo-Json

$resp = Invoke-RestMethod -Uri "http://localhost:3003/track" -Method Post -Headers @{Authorization="Bearer $token"} -Body $trackBody -ContentType "application/json"
Write-Host "Track Result: $($resp.status)"

$searchBody = @{
    query = 'top gaming streams'
} | ConvertTo-Json

$resp = Invoke-RestMethod -Uri "http://localhost:3003/search" -Method Post -Headers @{Authorization="Bearer $token"} -Body $searchBody -ContentType "application/json"
Write-Host "Search Result: $($resp.status)"
