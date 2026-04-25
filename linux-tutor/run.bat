@echo off
echo ===================================
echo Linux Tutor - Install and Test
echo ===================================
echo.

echo [1/3] Checking Python...
python --version
if errorlevel 1 (
    echo Python not found, please install Python 3.8+
    exit /b 1
)

echo.
echo [2/3] Installing dependencies...
pip install rich
if errorlevel 1 (
    echo Installation failed, trying python -m pip...
    python -m pip install rich
)

echo.
echo [3/3] Running program...
echo.
python main.py

pause
