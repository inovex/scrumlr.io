FROM kyma/docker-nginx
COPY build/ /var/www
CMD 'nginx'