# 🐳 Docker Deployment Guide

Полное руководство по запуску Notion Clone в Docker.

## 🚀 Быстрый старт

### Один клик запуск

**Mac/Linux:**
```bash
./docker-start.sh
```

**Windows:**
```cmd
docker-start.bat
```

**Или используя docker-compose:**
```bash
docker-compose up -d
```

Затем откройте: **http://localhost:3000**

## 📦 Что включено

Docker конфигурация запускает 4 сервиса:

1. **Backend** (Django) - порт 8000
2. **Frontend** (React/Vite) - порт 3000  
3. **Database** (PostgreSQL) - порт 5432
4. **Nginx** - порт 80 (прокси для всех сервисов)

## 🔧 Требования

- Docker 20.10+
- Docker Compose 2.0+
- 2GB свободного места
- 4GB RAM (рекомендуется)

### Установка Docker

**Mac:**
```bash
brew install --cask docker
```
Или скачайте: https://docs.docker.com/desktop/mac/install/

**Windows:**
Скачайте: https://docs.docker.com/desktop/windows/install/

**Linux:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

## 📋 Команды управления

### Запуск

```bash
# Запустить все сервисы
docker-compose up

# Запустить в фоновом режиме
docker-compose up -d

# Запустить с пересборкой
docker-compose up --build
```

### Остановка

```bash
# Остановить сервисы
docker-compose stop

# Остановить и удалить контейнеры
docker-compose down

# Остановить и удалить все данные (volumes)
docker-compose down -v
```

### Логи

```bash
# Все логи
docker-compose logs -f

# Логи конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f frontend

# Последние 100 строк
docker-compose logs --tail=100
```

### Статус

```bash
# Проверить статус контейнеров
docker-compose ps

# Проверить ресурсы
docker stats

# Список всех контейнеров
docker ps -a
```

### Перезапуск

```bash
# Перезапустить все сервисы
docker-compose restart

# Перезапустить конкретный сервис
docker-compose restart backend
docker-compose restart frontend
```

## 🔨 Разработка с Docker

### Вход в контейнер

```bash
# Backend shell
docker-compose exec backend bash

# Frontend shell
docker-compose exec frontend sh

# Database shell
docker-compose exec db psql -U postgres -d notion_clone
```

### Django команды

```bash
# Миграции
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate

# Создать суперпользователя
docker-compose exec backend python manage.py createsuperuser

# Django shell
docker-compose exec backend python manage.py shell

# Тесты
docker-compose exec backend python manage.py test

# Собрать статику
docker-compose exec backend python manage.py collectstatic
```

### Frontend команды

```bash
# Установить пакет
docker-compose exec frontend npm install package-name

# Запустить линтер
docker-compose exec frontend npm run lint

# Собрать для продакшн
docker-compose exec frontend npm run build
```

### База данных

```bash
# Бэкап базы данных
docker-compose exec db pg_dump -U postgres notion_clone > backup.sql

# Восстановление из бэкапа
docker-compose exec -T db psql -U postgres notion_clone < backup.sql

# Подключиться к базе
docker-compose exec db psql -U postgres -d notion_clone
```

## 🌐 Доступ к сервисам

После запуска доступны следующие URL:

| Сервис | URL | Описание |
|--------|-----|----------|
| Frontend | http://localhost:3000 | React приложение |
| Backend API | http://localhost:8000/api/ | REST API |
| Django Admin | http://localhost:8000/admin/ | Панель администратора |
| Nginx | http://localhost | Прокси для всех сервисов |
| PostgreSQL | localhost:5432 | База данных |

### Учетные данные по умолчанию

**Django Admin:**
- Логин: `admin`
- Пароль: `admin`

**PostgreSQL:**
- База данных: `notion_clone`
- Пользователь: `postgres`
- Пароль: `postgres`

## 🗂️ Структура Docker

```
notion-clone/
├── docker-compose.yml           # Development конфигурация
├── docker-compose.prod.yml      # Production конфигурация
├── docker-start.sh              # Скрипт запуска (Mac/Linux)
├── docker-start.bat             # Скрипт запуска (Windows)
├── backend/
│   ├── Dockerfile              # Backend образ
│   ├── docker-entrypoint.sh    # Инициализация backend
│   └── .dockerignore
├── frontend/
│   ├── Dockerfile              # Frontend образ (dev)
│   ├── Dockerfile.prod         # Frontend образ (prod)
│   └── .dockerignore
└── nginx/
    ├── nginx.conf              # Nginx конфигурация (dev)
    └── nginx.prod.conf         # Nginx конфигурация (prod)
```

## 🔄 Volumes

Docker использует volumes для персистентности данных:

```bash
# Список volumes
docker volume ls

# Информация о volume
docker volume inspect notion-clone_postgres_data

# Очистка неиспользуемых volumes
docker volume prune
```

**Volumes проекта:**
- `postgres_data` - данные PostgreSQL
- `backend-static` - статические файлы Django
- `backend-media` - загруженные медиа файлы

## 🚢 Production Deployment

### Запуск в продакшн режиме

```bash
# Создайте .env файл
cp .env.example .env

# Отредактируйте .env с настройками продакшн
nano .env

# Запустите
docker-compose -f docker-compose.prod.yml up -d
```

### Переменные окружения (.env)

```env
# Django
SECRET_KEY=your-super-secret-key-here
DEBUG=0
DJANGO_ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DB_PASSWORD=your-secure-password

# Frontend
VITE_API_URL=https://yourdomain.com/api
```

### Важные настройки для продакшн

1. **Смените SECRET_KEY:**
```bash
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

2. **Установите сильный пароль для БД**

3. **Настройте SSL сертификаты:**
```bash
# Поместите сертификаты в ./ssl/
./ssl/certificate.crt
./ssl/private.key
```

4. **Настройте домен в nginx.prod.conf**

### С использованием Let's Encrypt

```bash
# Установите certbot
docker-compose exec nginx sh
apk add certbot certbot-nginx

# Получите сертификат
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 🐛 Устранение проблем

### Контейнер не запускается

```bash
# Проверьте логи
docker-compose logs backend

# Пересоберите без кеша
docker-compose build --no-cache backend
docker-compose up -d
```

### Порт уже занят

```bash
# Проверьте занятые порты
lsof -i :8000
lsof -i :3000

# Измените порты в docker-compose.yml
ports:
  - "8001:8000"  # вместо 8000:8000
```

### База данных не подключается

```bash
# Проверьте статус БД
docker-compose ps db

# Проверьте здоровье БД
docker-compose exec db pg_isready

# Пересоздайте контейнер БД
docker-compose down
docker volume rm notion-clone_postgres_data
docker-compose up -d
```

### Проблемы с правами доступа

```bash
# Linux/Mac: исправьте права
sudo chown -R $USER:$USER ./backend/media ./backend/staticfiles

# В контейнере
docker-compose exec backend chown -R nobody:nogroup /app/media
```

### Очистка Docker

```bash
# Удалить все контейнеры проекта
docker-compose down -v

# Очистить весь Docker кеш
docker system prune -a --volumes

# Освободить место
docker system df
```

## 📊 Мониторинг

### Проверка ресурсов

```bash
# Использование CPU и памяти
docker stats

# Размер образов
docker images

# Размер volumes
docker system df -v
```

### Health Checks

```bash
# Backend
curl http://localhost:8000/api/

# Frontend
curl http://localhost:3000

# Database
docker-compose exec db pg_isready
```

## 🔐 Безопасность

### Рекомендации для продакшн

1. ✅ Используйте сильные пароли
2. ✅ Включите HTTPS (SSL)
3. ✅ Ограничьте доступ к портам
4. ✅ Регулярно обновляйте образы
5. ✅ Используйте Docker secrets для паролей
6. ✅ Настройте firewall
7. ✅ Включите логирование
8. ✅ Регулярно делайте бэкапы

### Обновление зависимостей

```bash
# Обновить образы
docker-compose pull

# Пересобрать с новыми версиями
docker-compose build --pull

# Запустить с новыми образами
docker-compose up -d
```

## 📚 Дополнительные ресурсы

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Django in Docker](https://docs.docker.com/samples/django/)
- [React in Docker](https://mherman.org/blog/dockerizing-a-react-app/)

## 💡 Полезные советы

1. **Используйте .dockerignore** для ускорения сборки
2. **Именуйте контейнеры** для удобства
3. **Используйте volumes** для данных, которые нужно сохранить
4. **Настройте health checks** для критичных сервисов
5. **Используйте multi-stage builds** для меньшего размера образов
6. **Логируйте в stdout/stderr** вместо файлов

## 🆘 Получить помощь

Если что-то не работает:

1. Проверьте логи: `docker-compose logs -f`
2. Проверьте статус: `docker-compose ps`
3. Пересоберите: `docker-compose up --build`
4. Создайте Issue на GitHub с логами

---

**Готово!** 🎉 Ваше приложение работает в Docker!
