FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache sqlite
COPY package.json package-lock.json* ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm install

FROM deps AS build
COPY . .
RUN npm run build --workspace @ecogestos/shared && npm run db:generate --workspace @ecogestos/backend && npm run build --workspace @ecogestos/backend

FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache sqlite
ENV NODE_ENV=production
COPY --from=build /app ./
WORKDIR /app/apps/backend
EXPOSE 3000
CMD ["sh", "-c", "npm run db:push && npm run db:seed && npm run start"]
