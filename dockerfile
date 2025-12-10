FROM php:8.3.6-cli
WORKDIR /app

COPY . .

EXPOSE 10000

CMD ["php", "-S", "0.0.0.0:10000", "-t", "backend/api"]