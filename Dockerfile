FROM php:8.3.6-apache

# Instalar extensões comuns
RUN docker-php-ext-install pdo pdo_mysql

# Ativar mod_rewrite
RUN a2enmod rewrite

# Copiar backend para o DocumentRoot do Apache
WORKDIR /var/www/html
COPY backend/api/ .      

# Configurar Apache para apontar para o backend/api
RUN sed -i 's|DocumentRoot /var/www/html|DocumentRoot /var/www/html|' /etc/apache2/sites-available/000-default.conf

# Permitir .htaccess se necessário
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# Expor a porta 10000
EXPOSE 10000

# Iniciar Apache em foreground
CMD ["apache2-foreground"]
