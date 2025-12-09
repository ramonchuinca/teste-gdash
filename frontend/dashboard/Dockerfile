# build stage
FROM node:18-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# production stage - serve with vite preview
FROM node:18-alpine AS prod
WORKDIR /app
COPY --from=build /app/dist ./dist
RUN npm i -g serve
EXPOSE 80
CMD ["serve", "-s", "dist", "-l", "80"]
