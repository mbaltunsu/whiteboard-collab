FROM node:20-alpine AS base
WORKDIR /app

# Copy monorepo root files — tsconfig.base.json is required by both
# packages/shared and apps/ws-server because their tsconfigs extend it
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY packages/shared/ ./packages/shared/
COPY apps/ws-server/ ./apps/ws-server/

# Install all workspace deps from root so npm hoisting works correctly.
RUN npm install --legacy-peer-deps --include=dev

# Build @whiteboard/shared — produces packages/shared/dist/
RUN cd packages/shared && npx tsc

# Build ws-server — produces apps/ws-server/dist/
RUN npm run build --workspace=apps/ws-server

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/ws-server/dist ./apps/ws-server/dist
COPY --from=base /app/apps/ws-server/package.json ./apps/ws-server/package.json

# Copy compiled shared dist (not TypeScript source) and point package.json to it
COPY --from=base /app/packages/shared/dist ./packages/shared/dist
RUN echo '{"name":"@whiteboard/shared","version":"0.1.0","main":"./dist/index.js","types":"./dist/index.d.ts"}' \
    > packages/shared/package.json

EXPOSE 4000
CMD ["node", "apps/ws-server/dist/server.js"]
