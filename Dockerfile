## base stage
FROM node:lts-alpine as base
WORKDIR /ai-chatbot
RUN npm i -g npm pnpm

## dependencies stage
FROM base as dependencies
COPY package.json pnpm-lock* ./
RUN pnpm i

# development stage
FROM base as development
COPY . .
COPY --from=dependencies /ai-chatbot/node_modules ./node_modules
# startup command
CMD pnpm i && pnpm dev