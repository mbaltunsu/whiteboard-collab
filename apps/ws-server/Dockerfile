FROM node:22-alpine AS base
WORKDIR /app

COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY packages/shared/ ./packages/shared/
COPY apps/ws-server/ ./apps/ws-server/

# Install all deps including devDeps (needed for tsc)
RUN npm install --legacy-peer-deps --include=dev

# Build @whiteboard/shared → packages/shared/dist/
RUN cd packages/shared && npx tsc

# Build ws-server → apps/ws-server/dist/
RUN npm run build --workspace=apps/ws-server

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy package files for a clean production install
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/ws-server/package.json ./apps/ws-server/package.json

# Install production deps only — ensures all runtime deps (mongoose etc.) are present
RUN npm install --omit=dev --legacy-peer-deps

# Copy compiled output from build stage
COPY --from=base /app/apps/ws-server/dist ./apps/ws-server/dist
COPY --from=base /app/packages/shared/dist ./packages/shared/dist

# Overwrite shared package.json to point to compiled dist (not .ts source)
RUN echo '{"name":"@whiteboard/shared","version":"0.1.0","main":"./dist/index.js","types":"./dist/index.d.ts"}' \
    > packages/shared/package.json

EXPOSE 4000
CMD ["node", "apps/ws-server/dist/server.js"]
