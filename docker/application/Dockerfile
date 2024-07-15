FROM node:14.7.0-alpine3.12

COPY app/ /srv/
EXPOSE 4000

RUN apk add curl && \
    curl https://raw.githubusercontent.com/typekpb/wtfc/v0.0.2/wtfc.sh -o /wtfc.sh && \
    chmod a+x /wtfc.sh

WORKDIR /srv
RUN npm install
ENTRYPOINT /wtfc.sh -T 180 nc -z config 8080 && \
                      npm start
