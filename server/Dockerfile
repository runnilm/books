# ---- client ----
FROM node:24-alpine AS client-build
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# ---- server ----
FROM node:24-alpine
WORKDIR /app/server

COPY server/package*.json ./
RUN npm ci --omit=dev

COPY server/src ./src

COPY --from=client-build /app/client/dist ./src/public

EXPOSE 3000
CMD ["node", "src/server.js"]
