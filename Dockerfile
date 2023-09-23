FROM node:18-alpine3.17 as build
WORKDIR /opt/build
# Install deps
COPY package*.json .
RUN npm ci
# Build NestJS app
COPY . .
RUN npm run prisma:generate
RUN npm run build
# Clean dev dependencies
RUN npm prune --production

FROM node:18-alpine3.17 as prod
WORKDIR /opt/app
# Copy built app
COPY --from=build /opt/build/dist ./dist
COPY --from=build /opt/build/node_modules ./node_modules
# Run!
CMD ["node", "dist/main.js"]
