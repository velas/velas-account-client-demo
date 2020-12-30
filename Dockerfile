FROM node:15.5-alpine

WORKDIR /app

COPY . /app

RUN npm i
RUN npm build
