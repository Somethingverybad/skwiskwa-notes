#!/bin/bash

echo "🚀 Запуск Notion Clone..."

# Проверка наличия Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 не установлен"
    exit 1
fi

# Проверка наличия Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен"
    exit 1
fi

# Backend
echo "📦 Настройка Backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "Создание виртуального окружения..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r ../requirements.txt

if [ ! -f "db.sqlite3" ]; then
    echo "Создание базы данных..."
    python manage.py makemigrations
    python manage.py migrate
fi

echo "🔥 Запуск Django сервера..."
python manage.py runserver &
BACKEND_PID=$!

cd ..

# Frontend
echo "📦 Настройка Frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Установка npm пакетов..."
    npm install
fi

echo "🎨 Запуск React приложения..."
npm run dev &
FRONTEND_PID=$!

cd ..

echo ""
echo "✅ Приложение запущено!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Для остановки нажмите Ctrl+C"

# Ожидание сигнала завершения
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM

wait
