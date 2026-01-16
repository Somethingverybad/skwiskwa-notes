@echo off
echo 🚀 Запуск Notion Clone...

REM Backend
echo 📦 Настройка Backend...
cd backend

if not exist "venv\" (
    echo Создание виртуального окружения...
    python -m venv venv
)

call venv\Scripts\activate.bat
pip install -r ..\requirements.txt

if not exist "db.sqlite3" (
    echo Создание базы данных...
    python manage.py makemigrations
    python manage.py migrate
)

echo 🔥 Запуск Django сервера...
start cmd /k "cd /d %cd% && venv\Scripts\activate.bat && python manage.py runserver"

cd ..

REM Frontend
echo 📦 Настройка Frontend...
cd frontend

if not exist "node_modules\" (
    echo Установка npm пакетов...
    call npm install
)

echo 🎨 Запуск React приложения...
start cmd /k "cd /d %cd% && npm run dev"

cd ..

echo.
echo ✅ Приложение запущено!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.

pause
