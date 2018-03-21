FROM node:6.11.3

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn

COPY . .

RUN yarn demo

EXPOSE 9000

CMD [ "node", "previewServer.js" ]
