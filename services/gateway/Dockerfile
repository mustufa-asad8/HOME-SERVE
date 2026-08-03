FROM node:22-alpine AS web-build
WORKDIR /build/web
COPY apps/web/package.json ./
RUN npm install --no-audit --no-fund
COPY apps/web/ ./
RUN npm run build

FROM node:22-alpine AS gateway
ENV NODE_ENV=production
WORKDIR /app
COPY services/gateway/package.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY services/gateway/src ./src
COPY --from=web-build /build/web/dist ./public
USER node
EXPOSE 4000
CMD ["node", "src/server.js"]
