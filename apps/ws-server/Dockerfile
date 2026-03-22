FROM node:20-alpine AS base
WORKDIR /app

# Copy monorepo root files
COPY package*.json ./
COPY turbo.json ./
COPY packages/ ./packages/
COPY apps/ws-server/ ./apps/ws-server/

# Install deps
RUN npm install --workspace=apps/ws-server --workspace=packages/shared

# Build shared types
RUN npx turbo build --filter=@whiteboard/shared

# Build ws-server
RUN npx turbo build --filter=ws-server

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/packages ./packages
COPY --from=base /app/apps/ws-server/dist ./apps/ws-server/dist
COPY --from=base /app/apps/ws-server/package.json ./apps/ws-server/package.json

EXPOSE 3001
CMD ["node", "apps/ws-server/dist/server.js"]
