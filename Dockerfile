# ----------------------
# Base stage
# ----------------------
FROM node:20-slim AS base

# Install dumb-init for proper signal handling
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files only (better caching)
COPY package*.json ./

# Install dependencies (default to production)
RUN npm ci --only=production && npm cache clean --force


# ----------------------
# Development stage
# ----------------------
FROM base AS development

# Reinstall full deps for development
RUN npm ci

# Copy all source files
COPY . .

# Create uploads directory
RUN mkdir -p /app/uploads/research-documents

# Expose dev port
EXPOSE 3000

# Run in dev mode
CMD ["dumb-init", "npm", "run", "start:dev"]


# ----------------------
# Build stage
# ----------------------
FROM base AS build

# Copy all source files
COPY . .

# Build the app
RUN npm run build


# ----------------------
# Production stage
# ----------------------
FROM node:20-slim AS production

# Install dumb-init for proper signal handling
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup --system nodejs \
    && adduser --system --ingroup nodejs nestjs

# Copy package files and install only production deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built app from build stage
COPY --from=build /app/dist ./dist

# Create uploads directory and set permissions
RUN mkdir -p /app/uploads/research-documents \
    && chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose app port
EXPOSE 3000

# Healthcheck (calls app's health endpoint instead of starting a new process)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start app
CMD ["dumb-init", "node", "dist/main.js"]
