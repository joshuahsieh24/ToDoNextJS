FROM node:20-slim

WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

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

# Verify environment variables before build
RUN echo "Checking required environment variables..."
RUN test -n "$NEXT_PUBLIC_FIREBASE_API_KEY" || (echo "NEXT_PUBLIC_FIREBASE_API_KEY is required" && exit 1)
RUN test -n "$MONGODB_URI" || (echo "MONGODB_URI is required" && exit 1)

# Build the app with increased memory limit
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# Set runtime environment variables
ENV FIREBASE_ADMIN_PROJECT_ID=$FIREBASE_ADMIN_PROJECT_ID
ENV FIREBASE_ADMIN_CLIENT_EMAIL=$FIREBASE_ADMIN_CLIENT_EMAIL
ENV FIREBASE_ADMIN_PRIVATE_KEY=$FIREBASE_ADMIN_PRIVATE_KEY
ENV MONGODB_URI=$MONGODB_URI

# Use a startup script to verify environment and start the app
RUN echo '#!/bin/sh\n\
echo "Verifying environment variables..."\n\
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
