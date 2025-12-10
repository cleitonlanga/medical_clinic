# Usando imagem oficial do PHP com Apache
FROM php:8.3.6-apache

# Instalar extensões comuns (ajuste conforme seu projeto)
RUN docker-php-ext-install pdo pdo_mysql

# Ativar mod_rewrite (necessário para frameworks e URLs amigáveis)
RUN a2enmod rewrite

# Definir diretório de trabalho
WORKDIR /var/www/html

# Copiar todo o código para dentro do container
COPY . .

# Expor a porta que o Apache vai usar
EXPOSE 10000

# Configurar Apache para rodar na porta 10000
RUN sed -i 's/80/10000/' /etc/apache2/ports.conf \
    && sed -i 's/:80>/:10000>/' /etc/apache2/sites-available/000-default.conf

# Comando padrão para rodar o Apache em foreground
CMD ["apache2-foreground"]
