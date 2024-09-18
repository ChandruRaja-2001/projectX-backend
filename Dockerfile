ARG NODE_VERSION=21.7.3

FROM node:${NODE_VERSION}-alpine as base

WORKDIR /usr/src/app

# Install dependencies
FROM base as deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Build
FROM base as build
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Final image
FROM node:${NODE_VERSION}-alpine as final

WORKDIR /usr/src/app
ENV NODE_ENV production

# Copy necessary files and directories
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY assets assets
COPY uploads uploads
COPY logs logs
COPY package.json ./
COPY package-lock.json ./

# Set permissions for the user node
RUN chown -R node:node /usr/src/app/uploads
RUN chown -R node:node /usr/src/app/logs

USER node

EXPOSE 9001
CMD ["npm", "start"]