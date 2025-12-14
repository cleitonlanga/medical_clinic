FROM php:8.3-apache

# Ativar extensões necessárias
RUN docker-php-ext-install pdo pdo_mysql

# Ativar mod_rewrite
RUN a2enmod rewrite

# Configurar Apache para apontar para /public
ENV APACHE_DOCUMENT_ROOT /var/www/html/backend/public

RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' \
    /etc/apache2/sites-available/*.conf \
    /etc/apache2/apache2.conf

# Copiar projeto
COPY . /var/www/html

# Permissões
RUN chown -R www-data:www-data /var/www/html
