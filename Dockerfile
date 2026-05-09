FROM node:20

WORKDIR /app/backend

# copy backend package manifests
COPY backend/package*.json ./
RUN npm ci

# copy backend source
COPY backend/ ./

# build + run
RUN npm run build
EXPOSE 5001
CMD ["npm", "start"]