# ── Outreach CRM — Cloud Run Dockerfile ──────────────────
# Mirrors invoicer deployment pattern: Node.js + Prisma + Puppeteer (chromium)

FROM node:22-slim

# Install chromium for Puppeteer PDF generation + openssl for Prisma
RUN apt-get update && apt-get install -y \
    chromium \
    openssl \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# Puppeteer should use installed chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy prisma schema and generate client
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npx prisma generate

# Copy application code
COPY server.js ./
COPY src ./src/
COPY views ./views/
COPY public ./public/

# Don't run as root
RUN groupadd -r appuser && useradd -r -m -g appuser appuser
ENV HOME=/home/appuser
USER appuser

EXPOSE 3001

CMD ["node", "server.js"]
