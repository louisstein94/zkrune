FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY tsconfig.json ./
COPY src ./src
COPY data ./data

RUN npx tsc

EXPOSE 3000

CMD ["node", "dist/index.js"]
