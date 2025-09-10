FROM node:18-alpine

# Install k6
RUN apk add --no-cache ca-certificates && \
    apk add --no-cache --virtual .build-deps curl && \
    curl -Lo /tmp/k6.tar.gz "https://github.com/grafana/k6/releases/latest/download/k6-$(uname -s | tr '[:upper:]' '[:lower:]')-$(uname -m | sed 's/x86_64/amd64/').tar.gz" && \
    tar -xzf /tmp/k6.tar.gz -C /tmp && \
    mv /tmp/k6-*/k6 /usr/local/bin/k6 && \
    chmod +x /usr/local/bin/k6 && \
    rm -rf /tmp/k6* && \
    apk del .build-deps

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Create required directories
RUN mkdir -p /tests /logs

# Expose ports
EXPOSE 3001 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/system/info || exit 1

# Start the application
CMD ["npm", "start"]