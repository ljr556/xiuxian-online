@echo off
chcp 65001 >nul
title 云海仙途 - 局域网分享
cd /d "%~dp0"
set "GAMEDIR=%~dp0"
set PORT=8080
echo 本机可分享的地址（手机需与本机在同一网络或同一 Tailscale 网络）：
powershell -NoProfile -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' } | ForEach-Object { '  http://' + $_.IPAddress + ':%PORT%/index.html' }"
echo.
set "PYEXE="
if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" set "PYEXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
if not defined PYEXE for /f "delims=" %%i in ('where py 2^>nul') do if not defined PYEXE set "PYEXE=%%i"
if not defined PYEXE (
  echo 未找到 Python，无法启动分享服务。可改为把整个文件夹发给对方，双击 index.html 离线玩。
  pause
  exit /b 1
)
echo 正在监听 0.0.0.0:%PORT% ...（首次运行 Windows 可能弹出防火墙提示，选择允许）
echo 关闭这个窗口即可停止分享。
"%PYEXE%" -m http.server %PORT% --bind 0.0.0.0 --directory "%GAMEDIR%"
pause
