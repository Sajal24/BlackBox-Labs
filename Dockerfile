FROM node:lts-alpine3.17
USER root
ENV APP /usr/src/APP
COPY package.json /tmp/package.json
RUN cd /tmp && npm install --loglevel=warn \
    && mkdir -p $APP \
    && mv /tmp/node_modules $APP
COPY src $APP/src
COPY package.json $APP
COPY tsconfig.json $APP
COPY .env $APP
WORKDIR $APP
EXPOSE 3030
RUN npm run build
CMD [ "node", "dist/index.js" ]