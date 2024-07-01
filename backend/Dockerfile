ARG NODE_VERSION=18.0.0

# Compile to JavaScript
FROM node as builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Build Image
FROM node:${NODE_VERSION}-alpine
USER node
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY --from=builder /usr/src/app/dist ./dist
EXPOSE 8080
CMD [ "node", "dist/index.js" ]