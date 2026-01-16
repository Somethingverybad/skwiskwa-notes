# 🚀 Быстрые команды

## Запуск проекта

### Один клик (автоматический запуск)

**Mac/Linux:**
```bash
cd /Users/andrejcerenev/project/notion-clone
./start.sh
```

**Windows:**
```cmd
cd C:\Users\andrejcerenev\project\notion-clone
start.bat
```

### Ручной запуск

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r ../requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend (новый терминал):**
```bash
cd frontend
npm install
npm run dev
```

Откройте: http://localhost:3000

## Часто используемые команды

### Backend

```bash
# Создать суперпользователя
python manage.py createsuperuser

# Создать миграции
python manage.py makemigrations

# Применить миграции
python manage.py migrate

# Запустить тесты
python manage.py test

# Собрать статику
python manage.py collectstatic

# Запустить shell
python manage.py shell

# Создать новое приложение
python manage.py startapp app_name
```

### Frontend

```bash
# Установить зависимости
npm install

# Запустить dev сервер
npm run dev

# Собрать для продакшн
npm run build

# Предпросмотр продакшн билда
npm run preview

# Проверить линтер
npm run lint
```

### Docker

```bash
# Запустить все сервисы
docker-compose up

# Запустить в фоне
docker-compose up -d

# Остановить
docker-compose down

# Пересобрать образы
docker-compose build

# Просмотр логов
docker-compose logs -f

# Выполнить команду в контейнере
docker-compose exec backend python manage.py migrate
```

## Тестирование

### Backend тесты
```bash
cd backend
python manage.py test

# Конкретное приложение
python manage.py test content

# С подробным выводом
python manage.py test --verbosity=2

# С покрытием (нужен coverage)
pip install coverage
coverage run --source='.' manage.py test
coverage report
```

### Frontend тесты (если настроены)
```bash
cd frontend
npm test
```

## База данных

### Сброс базы данных
```bash
cd backend
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

### Экспорт данных
```bash
python manage.py dumpdata > backup.json
python manage.py dumpdata content > content_backup.json
```

### Импорт данных
```bash
python manage.py loaddata backup.json
```

## Разработка

### Создать новый endpoint (Backend)

1. Добавить метод во `views.py`:
```python
@action(detail=True, methods=['post'])
def my_action(self, request, pk=None):
    # ваш код
    return Response({'status': 'ok'})
```

2. URL будет: `/api/pages/{id}/my_action/`

### Создать новый компонент (Frontend)

```bash
cd frontend/src/components
touch MyComponent.tsx
```

### Добавить новый тип блока

1. **Backend** (`models.py`):
```python
BLOCK_TYPES = (
    # ... существующие
    ('my_type', 'Мой тип'),
)
```

2. **Frontend** (`BlockComponent.tsx`):
```typescript
case 'my_type':
    return <div>Мой компонент</div>;
```

3. **BlockMenu.tsx**:
```typescript
{ type: 'my_type', icon: <FiIcon />, label: 'Мой тип' }
```

## Очистка

### Очистить кеш Python
```bash
find . -type d -name "__pycache__" -exec rm -rf {} +
find . -type f -name "*.pyc" -delete
```

### Очистить node_modules
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Полная очистка
```bash
# Backend
cd backend
rm -rf venv db.sqlite3 media staticfiles
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete

# Frontend
cd ../frontend
rm -rf node_modules dist package-lock.json
```

## Продакшн

### Подготовка к деплою
```bash
# Backend
DEBUG=False
python manage.py collectstatic --noinput
python manage.py migrate

# Frontend
npm run build
```

### Переменные окружения
```bash
# Backend (.env)
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com
DATABASE_URL=postgres://...

# Frontend (.env)
VITE_API_URL=https://api.yourdomain.com
```

## Полезные ссылки

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin/
- **API Docs**: Через Django REST Framework browsable API

## Помощь

- Документация: `README.md`
- Возможности: `FEATURES.md`
- Быстрый старт: `QUICKSTART.md`
- Участие в разработке: `CONTRIBUTING.md`
