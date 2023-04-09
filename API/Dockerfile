FROM node:18.12-buster-slim

# ENVs
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

# copy package files
COPY package*.json ./

# install dependencies
RUN npm ci

# copy application files and node_modules
COPY . .

# remove development dependencies (use only for production)
# TODO - uncomment when start using the real server
#RUN npm prune --production

# Exposing appropriate ports
EXPOSE 3000

CMD [ "npm", "run", "start:dev" ]
