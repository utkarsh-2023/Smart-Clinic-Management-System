#!/bin/bash

# MediBook Frontend Docker Management Scripts
# Usage: ./docker-scripts.sh [command]

set -e

IMAGE_NAME="appointment-booking-frontend"
CONTAINER_NAME="medibook-frontend"
PORT="8080"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Build the Docker image
build() {
    print_status "Building Docker image: $IMAGE_NAME"
    docker build -t $IMAGE_NAME:latest .
    print_success "Image built successfully!"
}

# Run the container
run() {
    print_status "Starting container: $CONTAINER_NAME"
    
    # Stop existing container if running
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        print_warning "Stopping existing container..."
        docker stop $CONTAINER_NAME
        docker rm $CONTAINER_NAME
    fi
    
    # Run new container
    docker run -d \
        --name $CONTAINER_NAME \
        -p $PORT:80 \
        --restart unless-stopped \
        $IMAGE_NAME:latest
    
    print_success "Container started successfully!"
    print_status "Application available at: http://localhost:$PORT"
    print_status "Demo page available at: http://localhost:$PORT/demo.html"
}

# Stop the container
stop() {
    print_status "Stopping container: $CONTAINER_NAME"
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        docker stop $CONTAINER_NAME
        docker rm $CONTAINER_NAME
        print_success "Container stopped and removed!"
    else
        print_warning "Container is not running."
    fi
}

# View container logs
logs() {
    print_status "Showing logs for container: $CONTAINER_NAME"
    if docker ps -aq -f name=$CONTAINER_NAME | grep -q .; then
        docker logs -f $CONTAINER_NAME
    else
        print_error "Container $CONTAINER_NAME not found!"
    fi
}

# Check container status
status() {
    print_status "Container status:"
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        print_success "Container is running"
        docker ps -f name=$CONTAINER_NAME
    elif docker ps -aq -f name=$CONTAINER_NAME | grep -q .; then
        print_warning "Container exists but is stopped"
        docker ps -a -f name=$CONTAINER_NAME
    else
        print_warning "Container does not exist"
    fi
}

# Build and run (convenience function)
deploy() {
    print_status "Building and deploying application..."
    build
    run
    print_success "Deployment complete!"
}

# Clean up everything
clean() {
    print_status "Cleaning up Docker resources..."
    
    # Stop and remove container
    if docker ps -aq -f name=$CONTAINER_NAME | grep -q .; then
        docker stop $CONTAINER_NAME 2>/dev/null || true
        docker rm $CONTAINER_NAME 2>/dev/null || true
    fi
    
    # Remove image
    if docker images -q $IMAGE_NAME | grep -q .; then
        docker rmi $IMAGE_NAME:latest
    fi
    
    # Remove unused resources
    docker system prune -f
    
    print_success "Cleanup complete!"
}

# Health check
health() {
    print_status "Checking application health..."
    if curl -f http://localhost:$PORT/health >/dev/null 2>&1; then
        print_success "Application is healthy!"
    else
        print_error "Application health check failed!"
        exit 1
    fi
}

# Shell into container
shell() {
    print_status "Opening shell in container: $CONTAINER_NAME"
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        docker exec -it $CONTAINER_NAME /bin/sh
    else
        print_error "Container is not running!"
    fi
}

# Docker Compose commands
compose_up() {
    print_status "Starting with Docker Compose..."
    docker-compose up -d
    print_success "Services started with Docker Compose!"
}

compose_down() {
    print_status "Stopping Docker Compose services..."
    docker-compose down
    print_success "Services stopped!"
}

# Show help
show_help() {
    echo "MediBook Frontend Docker Management"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  build         Build the Docker image"
    echo "  run           Run the container"
    echo "  stop          Stop and remove the container"
    echo "  logs          Show container logs"
    echo "  status        Check container status"
    echo "  deploy        Build and run (convenience command)"
    echo "  clean         Remove container and image"
    echo "  health        Check application health"
    echo "  shell         Open shell in container"
    echo "  compose-up    Start with docker-compose"
    echo "  compose-down  Stop docker-compose services"
    echo "  help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy     # Build and run the application"
    echo "  $0 logs       # View application logs"
    echo "  $0 health     # Check if application is running"
}

# Main script logic
case "${1:-help}" in
    build)
        build
        ;;
    run)
        run
        ;;
    stop)
        stop
        ;;
    logs)
        logs
        ;;
    status)
        status
        ;;
    deploy)
        deploy
        ;;
    clean)
        clean
        ;;
    health)
        health
        ;;
    shell)
        shell
        ;;
    compose-up)
        compose_up
        ;;
    compose-down)
        compose_down
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac 