FROM python:3.11-slim

WORKDIR /app

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

# Копирование requirements.txt из корня проекта
COPY requirements.txt /app/

# Установка Python зависимостей
RUN pip install --no-cache-dir -r requirements.txt

# Копирование кода приложения из backend директории
COPY backend/ /app/

# Создание директорий для медиа и статики
RUN mkdir -p /app/media /app/staticfiles

# Скрипт для инициализации уже в /app/ после копирования
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
