ARG NODE_VERSION=18.0.0

FROM node:${NODE_VERSION}-alpine

WORKDIR /src

ADD package.json /src 

RUN npm i --silent

ADD . /src

CMD npm start