FROM node:12

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .
RUN npm run build

ENV NODE_ENV production
EXPOSE 5000

CMD [ "npm", "start" ]
