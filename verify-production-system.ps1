$baseUri = "http://localhost:3000"
$adminUri = "http://localhost:3005"
$webhookUri = "http://localhost:3006"

Write-Host "--- Stage 1: Verifying Admin Config ---"
$configs = Invoke-RestMethod -Uri "$adminUri/api/config" -Method Get -Headers @{ "x-tenant-id" = "super-admin-master" }
Write-Host "Found $($configs.Count) configurations."

Write-Host "`n--- Stage 2: Register & Login (User Svc) ---"
$userPayload = @{
    username = "prod_user_" + (Get-Date -Format "ssmm")
    email = "prod_user_" + (Get-Date -Format "ssmm") + "@example.com"
    password = "password123"
    interests = @("gaming", "tech")
}
# Note: Registration/Login handled via API Gateway with x-api-key
$regResult = Invoke-RestMethod -Uri "$baseUri/api/users/register" -Method Post -Headers @{ "x-api-key" = "master-saas-key-2026" } -Body ($userPayload | ConvertTo-Json) -ContentType "application/json"
$loginResult = Invoke-RestMethod -Uri "$baseUri/api/users/login" -Method Post -Headers @{ "x-api-key" = "master-saas-key-2026" } -Body ($userPayload | ConvertTo-Json) -ContentType "application/json"
$token = $loginResult.token
Write-Host "Logged in as $($userPayload.username). Token obtained."

Write-Host "`n--- Stage 3: Internal Interaction Tracking ---"
$interPayload = @{
    streamId = "6678229615560410ae2bc88a"
    type = "WATCH_TIME"
    duration = 300
    percentage = 85
    scrollDepth = 90
    isRewatch = $true
}
$interResult = Invoke-RestMethod -Uri "$baseUri/api/interactions/track" -Method Post -Headers @{ Authorization = "Bearer $token"; "x-api-key" = "master-saas-key-2026" } -Body ($interPayload | ConvertTo-Json) -ContentType "application/json"
Write-Host "Interaction tracked: $($interResult.status)"

Write-Host "`n--- Stage 4: External Webhook Ingestion ---"
$webhookPayload = @{
    userId = "699db7aed430c846f4c4d769"
    contentId = "6678229615560410ae2bc88b"
    eventType = "LIKE"
    deviceType = "iphone"
    region = "US"
}
$webhookResult = Invoke-RestMethod -Uri "$webhookUri/api/v1/events" -Method Post -Headers @{ "x-webhook-signature" = "test" } -Body ($webhookPayload | ConvertTo-Json) -ContentType "application/json"
Write-Host "Webhook event queued: $($webhookResult.status)"

Write-Host "`n--- Stage 5: Recommendation Fetch ---"
Start-Sleep -Seconds 2
$recs = Invoke-RestMethod -Uri "$baseUri/api/recommendations/699db7aed430c846f4c4d769" -Method Get -Headers @{ "x-api-key" = "master-saas-key-2026" }
Write-Host "Received recommendations count: $($recs.Count)"


Write-Host "`nVERIFICATION COMPLETE"
