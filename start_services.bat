@echo off
echo Starting SaaS Recommendation System...

start "API Gateway" /D "services\api-gateway" powershell -NoExit -Command "node index.js"
start "User Service" /D "services\user-service" powershell -NoExit -Command "node index.js"
start "Stream Service" /D "services\stream-service" powershell -NoExit -Command "node index.js"
start "Interaction Service" /D "services\interaction-service" powershell -NoExit -Command "node index.js"
start "Recommendation Service" /D "services\recommendation-service" powershell -NoExit -Command "C:\Users\LENOVO\AppData\Local\Programs\Python\Python38\python.exe main.py"
start "Admin Service" /D "services\admin-service" powershell -NoExit -Command "node index.js"
start "Tenant Service" /D "services\tenant-service" powershell -NoExit -Command "node index.js"
start "Webhook Service" /D "services\webhook-service" powershell -NoExit -Command "node index.js"
start "Analytics Service" /D "services\analytics-service" powershell -NoExit -Command "node index.js"
start "Admin UI" /D "services\admin-panel-ui" powershell -NoExit -Command "npm run dev"

echo All services triggered. Check individual windows for output.
pause
