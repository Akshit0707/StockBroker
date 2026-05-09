# Build frontend
FROM node:20 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Build backend
FROM node:20 AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# Runtime
FROM node:20
WORKDIR /app

# Copy backend
COPY --from=backend-build /app/backend ./backend

# Copy frontend build to backend public folder
RUN mkdir -p backend/public
COPY --from=frontend-build /app/frontend/.next ./backend/public/.next
COPY --from=frontend-build /app/frontend/public ./backend/public

WORKDIR /app/backend
EXPOSE 5001

CMD ["npm", "run", "dev"]