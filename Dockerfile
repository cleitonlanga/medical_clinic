# Usar PHP com Apache
FROM php:8.3.6-apache

# Instalar extensões comuns
RUN docker-php-ext-install pdo pdo_mysql

# Ativar mod_rewrite
RUN a2enmod rewrite

# Copiar apenas a pasta api para o DocumentRoot
WORKDIR /var/www/html
COPY backend/api/ .  

# Criar um index.php mínimo para evitar 403 ao acessar /
RUN echo "<?php echo 'API is running'; ?>" > index.php

# Permitir .htaccess caso necessário
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# Configurar ServerName para suprimir aviso
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Expor a porta que o Render usará (Render define via $PORT)
EXPOSE 10000

# Iniciar Apache em foreground
CMD ["apache2-foreground"]
