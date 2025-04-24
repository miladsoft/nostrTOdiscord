FROM node:16-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY server.js .
COPY .env.example .

# Create .env file from example if it doesn't exist
RUN cp -n .env.example .env || true

# Expose the port if needed (optional, for documentation)
EXPOSE 8080

# Run the application
CMD ["node", "server.js"]
