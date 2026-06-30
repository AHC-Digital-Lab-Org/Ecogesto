FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm install

FROM deps AS build
COPY . .
RUN npm run build --workspace @ecogestos/shared && npm run build --workspace @ecogestos/frontend

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app ./
WORKDIR /app/apps/frontend
EXPOSE 5173
CMD ["npm", "run", "preview", "--", "--port", "5173"]
