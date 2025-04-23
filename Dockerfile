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

# Pass Firebase Admin environment variables
ARG FIREBASE_ADMIN_PROJECT_ID
ARG FIREBASE_ADMIN_CLIENT_EMAIL
ARG FIREBASE_ADMIN_PRIVATE_KEY

ENV FIREBASE_ADMIN_PROJECT_ID=$FIREBASE_ADMIN_PROJECT_ID
ENV FIREBASE_ADMIN_CLIENT_EMAIL=$FIREBASE_ADMIN_CLIENT_EMAIL
ENV FIREBASE_ADMIN_PRIVATE_KEY=$FIREBASE_ADMIN_PRIVATE_KEY

# Build the app
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
