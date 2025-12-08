# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime Stage
FROM node:20-alpine

WORKDIR /app

# Install system dependencies (curl for healthchecks etc if needed)
RUN apk add --no-cache curl

COPY package*.json ./
# Only production deps
RUN npm ci --omit=dev && npm install tsx

COPY --from=builder /app/dist ./dist
COPY server.ts ./
# We need tsconfig for tsx maybe? or just run with node if compiled?
# simpler to use tsx for now
COPY tsconfig.json ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npx", "tsx", "server.ts"]
