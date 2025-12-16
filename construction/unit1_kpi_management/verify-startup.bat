@echo off
echo Verifying KPI Management Application startup...

echo === Starting application in background ===
start /B "KPI-App" "C:\Users\RameezH\rameez\projects\Training\apache-maven-3.9.11-bin\apache-maven-3.9.11\bin\mvn.cmd" spring-boot:run

echo === Waiting for startup (30 seconds) ===
timeout /t 30 /nobreak

echo === Testing if application is running ===
curl -s http://localhost:8080/api/v1/actuator/health 2>nul
if %ERRORLEVEL% equ 0 (
    echo ✓ SUCCESS! Application is running on http://localhost:8080/api/v1
    echo ✓ Health check: PASSED
    echo ✓ Swagger UI: http://localhost:8080/api/v1/swagger-ui.html
    echo ✓ Login: admin / admin123
) else (
    echo ✗ Application may still be starting or failed to start
    echo Check the Maven output for details
)

pause