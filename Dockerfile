FROM node:20-slim

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with verbose logging
RUN npm install --verbose

# Copy environment file
#COPY .env.production .env.production

# Copy everything else
COPY . .

# Set environment so Next.js uses the right env file
ENV NODE_ENV=production
ENV PORT=10000

# Pass build-time arguments
ARG FIREBASE_ADMIN_PROJECT_ID
ARG FIREBASE_ADMIN_CLIENT_EMAIL
ARG FIREBASE_ADMIN_PRIVATE_KEY
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG MONGODB_URI

# Set build-time environment variables for Next.js build
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID

# Debug: Print environment variables (excluding sensitive ones)
RUN echo "Checking environment variables..." && \
    echo "NODE_ENV: $NODE_ENV" && \
    echo "PORT: $PORT" && \
    echo "NEXT_PUBLIC_FIREBASE_PROJECT_ID: $NEXT_PUBLIC_FIREBASE_PROJECT_ID" && \
    echo "MongoDB URI exists: $(if [ -n "$MONGODB_URI" ]; then echo 'yes'; else echo 'no'; fi)"

# Build the app with increased memory limit and verbose logging
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN echo "Starting build process..." && \
    npm run build --verbose || (echo "Build failed. Check the logs above for errors." && exit 1)

# Set runtime environment variables
ENV FIREBASE_ADMIN_PROJECT_ID=$FIREBASE_ADMIN_PROJECT_ID
ENV FIREBASE_ADMIN_CLIENT_EMAIL=$FIREBASE_ADMIN_CLIENT_EMAIL
ENV FIREBASE_ADMIN_PRIVATE_KEY=$FIREBASE_ADMIN_PRIVATE_KEY
ENV MONGODB_URI=$MONGODB_URI

# Create and configure the startup script
RUN echo '#!/bin/sh\n\
echo "=== Starting Application ==="\n\
echo "Checking environment variables..."\n\
echo "NODE_ENV: $NODE_ENV"\n\
echo "PORT: $PORT"\n\
echo "Checking required variables:"\n\
if [ -z "$MONGODB_URI" ]; then\n\
  echo "Error: MONGODB_URI is not set"\n\
  exit 1\n\
fi\n\
if [ -z "$FIREBASE_ADMIN_PROJECT_ID" ]; then\n\
  echo "Error: FIREBASE_ADMIN_PROJECT_ID is not set"\n\
  exit 1\n\
fi\n\
echo "Starting application on port $PORT..."\n\
exec node server.js\n\
' > /app/start.sh && chmod +x /app/start.sh

EXPOSE $PORT
CMD ["/app/start.sh"]
