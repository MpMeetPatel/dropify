FROM node:14.16.0-stretch

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .

CMD [ "npm", "start" ]