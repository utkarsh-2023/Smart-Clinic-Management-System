# 🐳 Docker Deployment Guide - MediBook Frontend

Complete guide for containerizing and deploying the Appointment Booking System frontend.

## 📋 Prerequisites

Before you begin, ensure you have:

- **Docker** installed ([Get Docker](https://docs.docker.com/get-docker/))
- **Docker Compose** (included with Docker Desktop)
- **Basic terminal/command line knowledge**

## 🚀 Quick Start

### Option 1: Using the Convenience Script (Recommended)

```bash
# Make the script executable (Unix/Linux/macOS)
chmod +x docker-scripts.sh

# Build and deploy in one command
./docker-scripts.sh deploy

# Check if it's running
./docker-scripts.sh status
```

### Option 2: Manual Docker Commands

```bash
# Build the Docker image
docker build -t appointment-booking-frontend:latest .

# Run the container
docker run -d \
  --name medibook-frontend \
  -p 8080:80 \
  --restart unless-stopped \
  appointment-booking-frontend:latest

# Verify it's running
docker ps
```

### Option 3: Docker Compose

```bash
# Start the application stack
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

## 🌐 Accessing Your Application

Once deployed, access your application at:

- **🏠 Main Application:** http://localhost:8080
- **📚 Demo Page:** http://localhost:8080/demo.html  
- **❤️ Health Check:** http://localhost:8080/health

## 📊 Docker Scripts Reference

The `docker-scripts.sh` provides these commands:

| Command | Description | Example |
|---------|-------------|---------|
| `build` | Build the Docker image | `./docker-scripts.sh build` |
| `run` | Start the container | `./docker-scripts.sh run` |
| `deploy` | Build + Run (one command) | `./docker-scripts.sh deploy` |
| `stop` | Stop and remove container | `./docker-scripts.sh stop` |
| `status` | Check container status | `./docker-scripts.sh status` |
| `logs` | View application logs | `./docker-scripts.sh logs` |
| `health` | Health check | `./docker-scripts.sh health` |
| `shell` | Open shell in container | `./docker-scripts.sh shell` |
| `clean` | Remove everything | `./docker-scripts.sh clean` |

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────┐
│               User's Browser            │
└─────────────────┬───────────────────────┘
                  │ HTTP :8080
┌─────────────────▼───────────────────────┐
│           Docker Container               │
│  ┌─────────────────────────────────────┐ │
│  │         Nginx Web Server            │ │
│  │    (Port 80 inside container)      │ │
│  └─────────────────────────────────────┘ │
│  ┌─────────────────────────────────────┐ │
│  │        Static Files:                │ │
│  │  • index.html                       │ │
│  │  • styles.css                       │ │
│  │  • script.js                        │ │
│  │  • demo.html                        │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## ⚙️ Configuration Details

### Dockerfile Features
- **Base Image:** `nginx:alpine` (lightweight, secure)
- **Static Files:** Copied to `/usr/share/nginx/html/`
- **Custom Nginx Config:** Optimized for SPA applications
- **Port:** Exposes port 80 internally

### Nginx Configuration Highlights
- **Gzip Compression:** Enabled for all text assets
- **Security Headers:** X-Frame-Options, CSP, etc.
- **Caching:** 1-year cache for static assets
- **Health Endpoint:** `/health` for monitoring
- **SPA Support:** Fallback routing to `index.html`

### Docker Compose Features
- **Service Name:** `appointment-booking-frontend`
- **Port Mapping:** `8080:80` (host:container)
- **Health Checks:** Built-in container health monitoring
- **Restart Policy:** `unless-stopped`
- **Logging:** Persistent log volumes

## 🔧 Customization

### Change Port
Edit `docker-compose.yml` or use different port:

```bash
# Run on port 3000 instead
docker run -d -p 3000:80 --name medibook-frontend appointment-booking-frontend:latest
```

### Environment Variables
Add environment variables in `docker-compose.yml`:

```yaml
services:
  appointment-booking-frontend:
    environment:
      - NGINX_HOST=yourdomain.com
      - NGINX_PORT=80
```

### Custom Nginx Config
Modify `nginx.conf` for custom server configuration:

```nginx
# Add custom location block
location /api {
    proxy_pass http://your-backend-url;
}
```

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Container Won't Start
```bash
# Check Docker logs
./docker-scripts.sh logs

# Or manually:
docker logs medibook-frontend
```

#### Port Already in Use
```bash
# Use different port
docker run -d -p 9090:80 --name medibook-frontend appointment-booking-frontend:latest

# Or find what's using the port
lsof -i :8080  # macOS/Linux
netstat -ano | findstr :8080  # Windows
```

#### Permission Denied on Scripts
```bash
# Make script executable
chmod +x docker-scripts.sh
```

#### Container Exists but Won't Start
```bash
# Remove existing container
./docker-scripts.sh clean

# Then redeploy
./docker-scripts.sh deploy
```

### Health Check Failed
```bash
# Check if nginx is running inside container
./docker-scripts.sh shell
ps aux | grep nginx

# Check nginx config
nginx -t
```

## 📈 Production Deployment

### Using Docker Swarm
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml medibook
```

### Using Kubernetes
Create `k8s-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: medibook-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: medibook-frontend
  template:
    metadata:
      labels:
        app: medibook-frontend
    spec:
      containers:
      - name: frontend
        image: appointment-booking-frontend:latest
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: medibook-service
spec:
  selector:
    app: medibook-frontend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: LoadBalancer
```

### Using Cloud Services

#### AWS ECS
```bash
# Build for AWS
docker build -t your-account.dkr.ecr.region.amazonaws.com/medibook:latest .
docker push your-account.dkr.ecr.region.amazonaws.com/medibook:latest
```

#### Google Cloud Run
```bash
# Build for GCP
docker build -t gcr.io/your-project-id/medibook:latest .
docker push gcr.io/your-project-id/medibook:latest
gcloud run deploy --image gcr.io/your-project-id/medibook:latest
```

## 🔒 Security Best Practices

### Production Recommendations
1. **Use HTTPS:** Set up SSL certificates
2. **Security Headers:** Already configured in nginx.conf
3. **Regular Updates:** Keep base image updated
4. **Secrets Management:** Don't embed secrets in image
5. **Network Security:** Use Docker networks for isolation

### Building for Production
```bash
# Multi-stage build for smaller image
# Add this to Dockerfile for optimization:
FROM nginx:alpine as production
COPY --from=builder /app/dist /usr/share/nginx/html
```

## 📊 Monitoring and Logging

### Container Logs
```bash
# Follow logs in real-time
./docker-scripts.sh logs

# Export logs to file
docker logs medibook-frontend > app.log 2>&1
```

### Health Monitoring
```bash
# Automated health checks
while true; do
  ./docker-scripts.sh health
  sleep 30
done
```

### Resource Usage
```bash
# Check container resource usage
docker stats medibook-frontend

# Detailed container info
docker inspect medibook-frontend
```

## 🚀 CI/CD Integration

### GitHub Actions Example
```yaml
name: Build and Deploy
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker image
      run: docker build -t medibook:${{ github.sha }} .
    
    - name: Deploy to production
      run: |
        docker stop medibook-frontend || true
        docker rm medibook-frontend || true
        docker run -d --name medibook-frontend -p 80:80 medibook:${{ github.sha }}
```

## 📚 Additional Resources

- **Docker Documentation:** https://docs.docker.com/
- **Nginx Documentation:** https://nginx.org/en/docs/
- **Docker Compose:** https://docs.docker.com/compose/
- **Container Security:** https://docs.docker.com/engine/security/

## 🆘 Support

If you encounter issues:

1. **Check logs:** `./docker-scripts.sh logs`
2. **Verify health:** `./docker-scripts.sh health`
3. **Clean and rebuild:** `./docker-scripts.sh clean && ./docker-scripts.sh deploy`
4. **Check Docker status:** `docker info`

---

**🎉 Congratulations!** Your MediBook appointment booking system is now fully containerized and ready for deployment anywhere Docker runs! 