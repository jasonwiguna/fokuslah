# Makefile for local Postgres DB using Docker Compose

up:
	docker compose up -d

down:
	docker compose down

psql:
	docker compose exec db psql -U postgres -d fokuslah_test

logs:
	docker compose logs -f db

reset: down up
