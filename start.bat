@echo off
echo ==========================================
echo   AutoAnki - Anki卡包生成器
echo ==========================================
echo.

REM 检查Node.js是否安装
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未检测到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查是否已安装依赖
if not exist "node_modules" (
    echo [提示] 首次运行，正在安装依赖...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
)

REM 检查.env文件
if not exist ".env" (
    echo.
    echo [警告] 未找到.env配置文件
    echo [提示] 正在创建默认配置文件...
    copy .env.example .env
    echo.
    echo 请编辑.env文件，填入你的API密钥后重新运行
    echo.
    pause
    exit /b 0
)

REM 启动服务器
echo.
echo [启动] 正在启动AutoAnki服务器...
echo.
node server.js

pause




