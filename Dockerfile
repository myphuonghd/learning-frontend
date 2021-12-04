FROM node:14.16.1

WORKDIR /app
ENV HOST 0.0.0.0

ADD . /app

RUN npm install
RUN npm run build
