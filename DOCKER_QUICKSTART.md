# 🐳 Docker - Запуск за 60 секунд

## 📋 Что нужно

- ✅ Docker Desktop (Mac/Windows) или Docker Engine (Linux)
- ✅ 2GB свободного места
- ✅ 4GB RAM

## 🚀 Запуск

### Способ 1: Автоматический скрипт (Рекомендуется)

**Mac/Linux:**
```bash
cd /Users/andrejcerenev/project/notion-clone
./docker-start.sh
```

**Windows:**
```cmd
cd C:\Users\andrejcerenev\project\notion-clone
docker-start.bat
```

### Способ 2: Docker Compose

```bash
cd notion-clone
docker-compose up -d
```

### Способ 3: Makefile

```bash
cd notion-clone
make docker-up
```

## ✅ Готово!

Откройте в браузере:

- 🌐 **Приложение**: http://localhost:3000
- 🔧 **API**: http://localhost:8000/api/
- 👤 **Admin**: http://localhost:8000/admin/ (admin/admin)

## 📊 Проверка

```bash
# Статус контейнеров
docker-compose ps

# Логи
docker-compose logs -f

# Должны работать 4 контейнера:
# ✅ notion-backend
# ✅ notion-frontend  
# ✅ notion-db
# ✅ notion-nginx
```

## 🛑 Остановка

```bash
docker-compose down
```

## 🔄 Перезапуск

```bash
docker-compose restart
```

## 🧹 Полная очистка

```bash
# Остановка + удаление всех данных
docker-compose down -v
```

## ⚡ Быстрые команды

```bash
# Логи backend
docker-compose logs -f backend

# Логи frontend
docker-compose logs -f frontend

# Django shell
docker-compose exec backend python manage.py shell

# Миграции
docker-compose exec backend python manage.py migrate

# Создать суперпользователя
docker-compose exec backend python manage.py createsuperuser

# База данных shell
docker-compose exec db psql -U postgres -d notion_clone
```

## 🐛 Проблемы?

### Порт занят

```bash
# Измените порты в docker-compose.yml
ports:
  - "3001:3000"  # вместо 3000:3000
  - "8001:8000"  # вместо 8000:8000
```

### Не запускается

```bash
# Пересобрать
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Очистить все

```bash
docker-compose down -v
docker system prune -a
```

## 📚 Больше информации

- Полная документация: [DOCKER.md](DOCKER.md)
- Все команды: [QUICK_COMMANDS.md](QUICK_COMMANDS.md)
- Основное README: [README.md](README.md)

---

**Вот и всё! Notion Clone работает в Docker! 🎉**
