@echo off
chcp 65001 >nul
title 云海仙途 - 启动器
cd /d "%~dp0"
set PORT=8123
set "GAMEDIR=%~dp0"
echo 正在准备《云海仙途》...
rem 1) 本地服务已在运行就直接开浏览器
powershell -NoProfile -Command "try { $null = Invoke-WebRequest 'http://127.0.0.1:%PORT%/index.html' -UseBasicParsing -TimeoutSec 2; exit 0 } catch { exit 1 }" >nul 2>nul
if not errorlevel 1 goto open
rem 2) 找一个能用的 Python（本机自带的那个优先）
set "PYEXE="
if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" set "PYEXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
if not defined PYEXE for /f "delims=" %%i in ('where py 2^>nul') do if not defined PYEXE set "PYEXE=%%i"
if not defined PYEXE goto fileopen
echo 启动本地服务 127.0.0.1:%PORT% ...
start "云海仙途-本地服务" /min "%PYEXE%" -m http.server %PORT% --directory "%GAMEDIR%"
timeout /t 2 /nobreak >nul
:open
start "" "http://127.0.0.1:%PORT%/index.html"
echo 已请求打开浏览器。若没反应，请手动访问 http://127.0.0.1:%PORT%/index.html
timeout /t 6 /nobreak >nul
exit /b 0
:fileopen
echo 未找到 Python，改为直接用浏览器打开本地文件。
start "" "%GAMEDIR%index.html"
echo 若没反应，请手动双击本目录下的 index.html。
timeout /t 6 /nobreak >nul
exit /b 0
