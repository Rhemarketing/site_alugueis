FROM php:8.3-apache

RUN docker-php-ext-install pdo_mysql \
    && a2enmod headers rewrite

WORKDIR /var/www/app

# Código interno, mantido fora da raiz pública do Apache.
COPY api /var/www/app/api
COPY database /var/www/app/database

# Somente os arquivos necessários para atender requisições web.
COPY api /var/www/html/api
COPY index.html app.js styles.css favicon.svg /var/www/html/

COPY docker/entrypoint.sh /usr/local/bin/site-alugueis-entrypoint
RUN chmod +x /usr/local/bin/site-alugueis-entrypoint \
    && chown -R www-data:www-data /var/www/html

ENV APP_ENV=production \
    APP_DEBUG=false \
    APP_TIMEZONE=America/Sao_Paulo \
    DB_DATABASE=site_alugueis

EXPOSE 80


# Health check para o EasyPanel monitorar o container
HEALTHCHECK NONE
# Iniciar a aplicação
CMD ["node", "node_modules/vinext/dist/cli.js", "start", "--port", "80", "--hostname", "0.0.0.0"]
