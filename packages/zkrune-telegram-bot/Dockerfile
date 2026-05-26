FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY tsconfig.json ./
COPY src ./src
COPY keys ./keys

RUN npx tsc

RUN mkdir -p data

EXPOSE 3000

CMD ["node", "dist/index.js"]
