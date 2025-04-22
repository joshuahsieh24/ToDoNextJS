# Use official Node.js image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files first (for layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app
COPY . .

# Build Next.js app
RUN npm run build

RUN ls -al .next

# Expose the port Next.js runs on
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
