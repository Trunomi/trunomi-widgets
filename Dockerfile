FROM node:6.11.3

WORKDIR /usr/src/app

COPY package*.json ./

COPY . .

EXPOSE 9000