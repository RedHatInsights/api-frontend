FROM quay.io/cloudservices/caddy-ubi:latest

RUN groupadd -r dockeruser && useradd -r -g dockeruser dockeruser

RUN mkdir -p /licenses
RUN chown -R dockeruser:dockeruser /licenses
USER dockeruser
COPY LICENSE /licenses/

ENV CADDY_TLS_MODE http_port 8000

COPY ./Caddyfile /opt/app-root/src/Caddyfile
COPY dist /opt/app-root/src/dist/
COPY ./package.json /opt/app-root/src
WORKDIR /opt/app-root/src
CMD ["caddy", "run", "--config", "/opt/app-root/src/Caddyfile"]
