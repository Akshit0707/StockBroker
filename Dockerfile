FROM node:20 AS deps
WORKDIR /app

COPY package*.json ./
RUN npm install

FROM node:20 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM node:20 AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# only copy public if it exists
RUN mkdir -p public

EXPOSE 3000

CMD ["npm", "start"]