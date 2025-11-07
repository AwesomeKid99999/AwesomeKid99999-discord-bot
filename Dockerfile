# Use official Node.js LTS image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port (if needed for future features)
# EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Run the bot
CMD ["npm", "start"]
