# Use imagem oficial PHP com Apache
FROM php:8.2-apache

# Instalar extensões necessárias
RUN docker-php-ext-install pdo pdo_mysql

# Habilitar mod_rewrite (útil se futuramente precisar de URLs amigáveis)
RUN a2enmod rewrite headers

# Copiar o backend para o diretório do Apache
COPY . /var/www/html/

# Definir permissões corretas
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Configurar php.ini mínimo (opcional, mas ajuda em dev)
RUN echo "display_errors=On\nerror_reporting=E_ALL\nupload_max_filesize=10M\npost_max_size=10M" > /usr/local/etc/php/conf.d/custom.ini

# Definir a porta que o Apache vai escutar
EXPOSE 80

# CORS padrão para todas as rotas (útil para seu frontend no Render)
RUN echo "Header set Access-Control-Allow-Origin \"*\"\nHeader set Access-Control-Allow-Methods \"GET, POST, PUT, DELETE, OPTIONS\"\nHeader set Access-Control-Allow-Headers \"Content-Type, Authorization\"" > /etc/apache2/conf-available/cors.conf \
    && a2enconf cors

# Comando para iniciar o Apache
CMD ["apache2-foreground"]