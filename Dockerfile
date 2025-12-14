FROM php:8.3-apache

RUN docker-php-ext-install pdo pdo_mysql
RUN a2enmod rewrite

ENV APACHE_DOCUMENT_ROOT /var/www/html/backend/public

# Substitui doc root nos configs Apache
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' \
    /etc/apache2/sites-available/*.conf \
    /etc/apache2/apache2.conf

# Ajusta Apache para usar porta dinâmica do Render
RUN sed -ri 's/Listen 80/Listen ${PORT}/g' /etc/apache2/ports.conf \
 && sed -ri 's/:80/:${PORT}/g' /etc/apache2/sites-available/000-default.conf

COPY . /var/www/html
RUN chown -R www-data:www-data /var/www/html

# Expõe porta (boa prática)
EXPOSE ${PORT}

CMD ["apache2-foreground"]
