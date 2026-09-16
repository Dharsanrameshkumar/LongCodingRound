@echo off
echo Starting Event Booking System...
echo.
echo Starting Backend (Spring Boot on port 8080)...
start "Backend" cmd /k "cd /d %~dp0backend && mvn spring-boot:run"

echo Waiting 10 seconds for backend to start...
timeout /t 10 /nobreak > nul

echo Starting Frontend (Vite on port 5173)...
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Application started!
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:5173
echo.
pause
