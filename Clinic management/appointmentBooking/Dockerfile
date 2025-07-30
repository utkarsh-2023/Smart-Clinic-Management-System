# Use the official Nginx image as base
FROM nginx:alpine

# Set maintainer info
LABEL maintainer="Appointment Booking System"
LABEL description="Frontend application for medical appointment booking"

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy static files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/
COPY demo.html /usr/share/nginx/html/
COPY README.md /usr/share/nginx/html/

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 