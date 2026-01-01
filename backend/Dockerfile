# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Setup Backend
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies for Swiss Ephemeris
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy Backend Requirements
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend Code
COPY backend/app ./app
COPY backend/ephemeris ./ephemeris

# Copy Built Frontend from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./static

# Set Environment Variables
ENV EPHEME_PATH=/app/ephemeris
ENV PORT=8000

# Expose Port
EXPOSE 8000

# Run Command
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port $PORT"]
