FROM node:15-alpine

# ARG env=dev
WORKDIR /src

COPY ./package.json /src/package.json
RUN npm install

COPY . /src