FROM node:20

WORKDIR /app/backend

# copy backend package manifests
COPY backend/package*.json ./
RUN npm ci

# copy backend source
COPY backend/ ./

# generate Prisma client before build/start
RUN npx prisma generate --schema=./prisma/schema.prisma

# build + run
RUN npm run build
EXPOSE 5001
CMD ["npm", "start"]