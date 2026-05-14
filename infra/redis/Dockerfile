FROM redis:7-alpine

# Copy custom Redis configuration and entrypoint
COPY redis.conf /usr/local/etc/redis/redis.conf
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose Redis port
EXPOSE 6379

# Start Redis with custom configuration and password support
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
