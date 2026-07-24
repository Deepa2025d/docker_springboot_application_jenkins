@echo off
echo ==^> Building TaskFlow...

where mvn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo Maven not found on PATH. Please install Maven from https://maven.apache.org/install.html
  echo or install it via: choco install maven
  exit /b 1
)

call mvn clean package -DskipTests

echo.
echo ==^> Build complete!
echo ==^> Jar created at: target\taskflow.jar
echo.
echo Run it with:
echo   java -jar target\taskflow.jar
echo.
echo Then open http://localhost:8080 in your browser.
