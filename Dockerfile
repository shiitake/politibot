FROM node:15-alpine

# ARG env=dev
WORKDIR /src

COPY package.json ./
# RUN npm -v && npm install
RUN yarn install

COPY . /src