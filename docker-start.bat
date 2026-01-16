@echo off
echo 🐳 Запуск Notion Clone в Docker...
echo.

REM Проверка Docker
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Docker не установлен
    echo Установите Docker: https://docs.docker.com/get-docker/
    pause
    exit /b 1
)

REM Проверка Docker Compose
where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Docker Compose не установлен
    echo Установите Docker Compose: https://docs.docker.com/compose/install/
    pause
    exit /b 1
)

echo 🛑 Остановка существующих контейнеров...
docker-compose down 2>nul

echo 🔨 Сборка образов...
docker-compose build

echo 🚀 Запуск контейнеров...
docker-compose up -d

echo.
echo ⏳ Ожидание запуска сервисов...
timeout /t 10 /nobreak >nul

echo.
echo ✅ Notion Clone запущен!
echo.
echo 📍 Доступные адреса:
echo    🌐 Frontend:     http://localhost:3000
echo    🔧 Backend API:  http://localhost:8000/api/
echo    👤 Django Admin: http://localhost:8000/admin/
echo       Логин: admin
echo       Пароль: admin
echo    📊 PostgreSQL:   localhost:5432
echo       База: notion_clone
echo       Пользователь: postgres
echo       Пароль: postgres
echo.
echo 📋 Полезные команды:
echo    docker-compose logs -f          # Просмотр логов
echo    docker-compose ps               # Статус контейнеров
echo    docker-compose down             # Остановка
echo    docker-compose restart          # Перезапуск
echo.
echo 🔍 Проверка статуса контейнеров...
docker-compose ps

echo.
echo 🎉 Готово! Откройте http://localhost:3000 в браузере
pause
