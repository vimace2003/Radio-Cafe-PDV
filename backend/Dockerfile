FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    gnucobol \
    lighttpd \
    libcob4 \
    dos2unix \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY pdv.cbl .
COPY pdv-wrapper.sh .
COPY lighttpd.conf /etc/lighttpd/lighttpd.conf

RUN mkdir -p /var/www/localhost/cgi-bin && \
    cobc -free -x -o /var/www/localhost/cgi-bin/pdv.bin pdv.cbl && \
    dos2unix pdv-wrapper.sh && \
    cp pdv-wrapper.sh /var/www/localhost/cgi-bin/pdv.sh && \
    chmod +x /var/www/localhost/cgi-bin/pdv.sh /var/www/localhost/cgi-bin/pdv.bin && \
    mkdir -p /var/log/lighttpd /var/run/lighttpd && \
    chown -R www-data:www-data /var/www /var/log/lighttpd /var/run/lighttpd /var/cache/lighttpd

USER www-data

EXPOSE 8080

CMD ["lighttpd", "-D", "-f", "/etc/lighttpd/lighttpd.conf"]
