FROM node:6.11.3

WORKDIR /usr/src/app

COPY package*.json ./

COPY . .
RUN yarn
RUN yarn build
RUN yarn demo

EXPOSE 9000

CMD [ "node", "previewServer.js" ]
