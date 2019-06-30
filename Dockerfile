FROM node:dubnium-alpine

ARG NPM_VSTS_TOKEN

ENV APPDIR /usr/src/app
RUN mkdir -p ${APPDIR}
WORKDIR ${APPDIR}

COPY package.json .
COPY package-lock.json .
RUN npm install --production --loglevel warn

COPY . ${APPDIR}

ENV PORT 80
EXPOSE 80

CMD node index.js
