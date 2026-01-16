.PHONY: help docker-up docker-down docker-build docker-logs docker-restart docker-clean install test

help:
	@echo "Notion Clone - Makefile команды"
	@echo ""
	@echo "Docker команды:"
	@echo "  make docker-up      - Запустить все сервисы"
	@echo "  make docker-down    - Остановить все сервисы"
	@echo "  make docker-build   - Собрать Docker образы"
	@echo "  make docker-logs    - Показать логи"
	@echo "  make docker-restart - Перезапустить сервисы"
	@echo "  make docker-clean   - Очистить все (контейнеры + volumes)"
	@echo ""
	@echo "Разработка:"
	@echo "  make install        - Установить зависимости"
	@echo "  make test          - Запустить тесты"
	@echo "  make migrate       - Применить миграции"
	@echo "  make superuser     - Создать суперпользователя"

# Docker команды
docker-up:
	docker-compose up -d
	@echo "✅ Сервисы запущены!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:8000"

docker-down:
	docker-compose down
	@echo "✅ Сервисы остановлены"

docker-build:
	docker-compose build
	@echo "✅ Образы собраны"

docker-logs:
	docker-compose logs -f

docker-restart:
	docker-compose restart
	@echo "✅ Сервисы перезапущены"

docker-clean:
	docker-compose down -v
	docker system prune -f
	@echo "✅ Очистка завершена"

# Разработка
install:
	cd backend && pip install -r ../requirements.txt
	cd frontend && npm install
	@echo "✅ Зависимости установлены"

test:
	cd backend && python manage.py test
	@echo "✅ Тесты выполнены"

migrate:
	docker-compose exec backend python manage.py migrate
	@echo "✅ Миграции применены"

superuser:
	docker-compose exec backend python manage.py createsuperuser
