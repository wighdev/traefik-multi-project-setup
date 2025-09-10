# SSL Certificates Directory

This directory is for storing SSL certificates for HTTPS support on port 58003.

## Quick Setup for Development

### Option 1: Self-Signed Certificate (Development Only)

```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout nginx/ssl/key.pem -out nginx/ssl/cert.pem -days 365 -nodes \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=103.217.173.158"

# Set proper permissions
chmod 600 nginx/ssl/key.pem
chmod 644 nginx/ssl/cert.pem
```

### Option 2: Let's Encrypt (Production)

```bash
# Install certbot
sudo apt update && sudo apt install certbot

# Get certificate (requires domain pointing to your server)
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates to nginx directory
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem
```

### Option 3: Custom Certificate

Place your certificate files as:
- `nginx/ssl/cert.pem` - Certificate chain
- `nginx/ssl/key.pem` - Private key

## After Adding Certificates

1. Uncomment SSL configuration in `nginx/sites-available/traefik-proxy`
2. Update the certificate paths if needed
3. Restart nginx: `sudo systemctl restart nginx`
4. Test HTTPS: `https://103.217.173.158:58003/`

## Security Notes

- Keep private keys secure (600 permissions)
- Use strong certificates in production
- Regularly update certificates before expiration
- Consider using automated certificate renewal