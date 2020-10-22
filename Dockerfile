FROM node:10-alpine

# ARG env=dev
WORKDIR /src

COPY ./package.json /src/package.json
RUN npm install

COPY . /src