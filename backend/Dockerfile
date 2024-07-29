ARG NODE_VERSION=18
ARG NODE_ENV=production

# Compile to JavaScript
FROM node:${NODE_VERSION} as builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run prisma:generate
# Build TypeScript files
RUN npm run build
# Copy all non-TypeScript files to dist
RUN find . -type f ! -name "*.ts" ! -path "./node_modules/*" ! -path "./dist/*" -exec cp --parents {} dist \;

# Build Image
FROM node:${NODE_VERSION}-alpine
USER node
WORKDIR /usr/src/app
COPY package*.json ./

RUN if [ "$NODE_ENV" = "production" ]; then \
        npm install --only=production; \
    else \
        npm install; \
    fi

COPY --from=builder /usr/src/app/dist ./
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
ENV NODE_ENV $NODE_ENV
EXPOSE 8080

CMD ["node", "index.js"]