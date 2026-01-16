FROM node:18-alpine

WORKDIR /app

# Копирование package.json и установка зависимостей
COPY package.json ./
RUN npm install --quiet

# Копирование исходного кода
COPY . .

EXPOSE 3000

# Запуск dev сервера
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
