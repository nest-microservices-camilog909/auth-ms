FROM node:21-alpine3.19

WORKDIR /usr/src/app

COPY package*.json ./
COPY pnpm*.yaml ./

RUN npm i -g pnpm
RUN pnpm i

COPY . .

EXPOSE 3020
