FROM node:14.16.0-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

USER node


COPY --chown=node:node . .

WORKDIR /home/node/app/react-app

RUN npm install
RUN npm install react-scripts

EXPOSE 3000

CMD [ "npm", "start" ]
