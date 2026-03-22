FROM node:20-alpine AS base
WORKDIR /app

# Copy monorepo root files — tsconfig.base.json is required by both
# packages/shared and apps/ws-server because their tsconfigs extend it
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY packages/shared/ ./packages/shared/
COPY apps/ws-server/ ./apps/ws-server/

# Install all workspace deps from root so npm hoisting works correctly.
# --legacy-peer-deps avoids failures from peer dep mismatches in transitive deps.
RUN npm install --legacy-peer-deps

# Build @whiteboard/shared first — ws-server's tsconfig paths resolve to
# packages/shared/dist/index.d.ts, so shared must be compiled before ws-server.
RUN cd packages/shared && npx tsc

# Build ws-server
RUN npm run build --workspace=apps/ws-server

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/packages ./packages
COPY --from=base /app/apps/ws-server/dist ./apps/ws-server/dist
COPY --from=base /app/apps/ws-server/package.json ./apps/ws-server/package.json

EXPOSE 4000
CMD ["node", "apps/ws-server/dist/server.js"]
