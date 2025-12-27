FROM node:25-alpine

WORKDIR /app

# Copy package manifests and Prisma config/schema first so postinstall (prisma generate) works in build
COPY package*.json prisma.config.ts ./
COPY prisma ./prisma
ARG SKIP_NPM_INSTALL=false
RUN if [ "$SKIP_NPM_INSTALL" != "true" ]; then npm install; else echo "Skipping npm install during build"; fi

# Bring in the rest of the source
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0", "-p", "3000"]
