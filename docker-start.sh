#!/bin/bash

echo "🐳 Запуск Notion Clone в Docker..."
echo ""

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен"
    echo "Установите Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Проверка наличия Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен"
    echo "Установите Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

# Остановка существующих контейнеров
echo "🛑 Остановка существующих контейнеров..."
docker-compose down 2>/dev/null

# Сборка и запуск
echo "🔨 Сборка образов..."
docker-compose build

echo "🚀 Запуск контейнеров..."
docker-compose up -d

echo ""
echo "⏳ Ожидание запуска сервисов..."
sleep 10

echo ""
echo "✅ Notion Clone запущен!"
echo ""
echo "📍 Доступные адреса:"
echo "   🌐 Frontend:     http://localhost:3000"
echo "   🔧 Backend API:  http://localhost:8000/api/"
echo "   👤 Django Admin: http://localhost:8000/admin/"
echo "      Логин: admin"
echo "      Пароль: admin"
echo "   📊 PostgreSQL:   localhost:5432"
echo "      База: notion_clone"
echo "      Пользователь: postgres"
echo "      Пароль: postgres"
echo ""
echo "📋 Полезные команды:"
echo "   docker-compose logs -f          # Просмотр логов"
echo "   docker-compose ps               # Статус контейнеров"
echo "   docker-compose down             # Остановка"
echo "   docker-compose restart          # Перезапуск"
echo ""
echo "🔍 Проверка статуса контейнеров..."
docker-compose ps

echo ""
echo "🎉 Готово! Откройте http://localhost:3000 в браузере"
