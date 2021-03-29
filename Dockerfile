FROM node:13.12.0-alpine

RUN mkdir -p /home/node/app/swc_standings/node_modules && chown -R node:node /home/node/app/swc_standings

WORKDIR /home/node/app/swc_standings

COPY swc_standings/package*.json ./

ENV PATH /home/app/node/swc_standings/node_modules/.bin:$PATH




USER node



COPY --chown=node:node . .

RUN npm install 
RUN npm install react-scripts

EXPOSE 3000


CMD [ "npm", "start" ]
