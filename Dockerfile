FROM node:15.5-alpine as build-stage

WORKDIR /app

COPY . /app

RUN npm i
RUN npm run build

FROM nginx:stable-alpine as production-stage

COPY --from=build-stage /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

