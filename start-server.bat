@echo off
echo ========================================
echo   Servidor da Arvore dos Palpites
echo ========================================
echo.

REM Verifica se Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Python nao encontrado!
    echo Por favor, instale o Python: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo Iniciando servidor...
echo.
python server.py

pause

