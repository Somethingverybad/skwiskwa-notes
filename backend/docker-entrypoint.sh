#!/bin/bash
set -e

echo "🔄 Ожидание готовности базы данных..."
sleep 3

echo "🔧 Применение миграций..."
python manage.py makemigrations --noinput || true
python manage.py migrate --noinput

echo "📦 Сбор статических файлов..."
python manage.py collectstatic --noinput || true

echo "👤 Создание суперпользователя (если не существует)..."
python manage.py shell << END
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin')
    print('Создан суперпользователь: admin/admin')
else:
    print('Суперпользователь уже существует')
END

echo "✅ Инициализация завершена!"
echo "🚀 Запуск сервера..."

exec "$@"
