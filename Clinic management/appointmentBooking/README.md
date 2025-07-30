# Appointment Booking System - Frontend

A modern, responsive frontend application for managing medical appointments between doctors and patients.

## Features

### 🔐 Authentication
- **User Registration & Login** with role-based access (Doctor/Patient)
- **Secure session management** with localStorage
- **Role-specific dashboards** for different user types

### 👨‍⚕️ Doctor Dashboard
- **Appointment Overview** with statistics and filters
- **Today's Schedule** with real-time updates
- **Patient Management** with appointment history
- **Filter appointments** by status (All, Today, Upcoming, Completed)

### 👤 Patient Dashboard
- **View Previous & Upcoming Appointments**
- **Easy Booking Interface** with step-by-step process
- **Appointment History** with doctor details
- **Filter appointments** by status

### 📅 Booking System
- **3-Step Booking Process**:
  1. Select Doctor (with search functionality)
  2. Choose Available Time Slot
  3. Confirm Appointment Details
- **Doctor Search** by name or specialty
- **Real-time Slot Availability**
- **Appointment Notes** for special requirements

### 🎨 User Interface
- **Modern Design** with clean, professional aesthetics
- **Responsive Layout** for desktop and mobile devices
- **Interactive Elements** with smooth animations
- **Toast Notifications** for user feedback
- **Loading States** for better user experience

## Tech Stack

- **HTML5** - Semantic markup structure
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript** - ES6+ features and async/await
- **Font Awesome** - Icons and visual elements

## Setup Instructions

### Quick Start

1. **Clone or download** the project files
2. **Open `index.html`** in a web browser
3. **Start using** the application immediately!

### File Structure

```
appointmentBooking/
├── index.html              # Main HTML file
├── styles.css              # CSS styling
├── script.js               # JavaScript functionality
├── demo.html               # Demo instructions page
├── README.md               # Documentation
├── Dockerfile              # Docker container configuration
├── docker-compose.yml      # Docker Compose setup
├── nginx.conf              # Nginx web server configuration
├── .dockerignore           # Docker build exclusions
└── docker-scripts.sh       # Docker management scripts
```

### Configuration

The application is currently configured to run in **demo mode** with mock data. To connect to your backend:

1. Open `script.js`
2. Update the `API_BASE_URL` variable with your backend URL
3. Set `MOCK_MODE = false`

```javascript
const API_BASE_URL = 'http://your-backend-url/api';
const MOCK_MODE = false;
```

## API Endpoints Expected

The frontend expects the following API endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get specific doctor
- `GET /api/doctors/:id/slots?date=YYYY-MM-DD` - Get available slots

### Appointments
- `GET /api/appointments/doctor/:id` - Get doctor's appointments
- `GET /api/appointments/patient/:id` - Get patient's appointments
- `POST /api/appointments` - Create new appointment

## Demo Features

The application includes mock data for demonstration:

### Sample Doctors
- **Dr. Sarah Johnson** - Cardiology
- **Dr. Michael Chen** - Dermatology  
- **Dr. Emily Davis** - Pediatrics
- **Dr. Robert Wilson** - Orthopedics
- **Dr. Lisa Brown** - Neurology
- **Dr. David Miller** - General Medicine

### Demo Accounts
You can login with any email and password combination when in demo mode.

## Responsive Design

The application is fully responsive and works on:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobile** (320px - 767px)

## Browser Support

- **Modern browsers** (Chrome, Firefox, Safari, Edge)
- **ES6+ support** required
- **CSS Grid and Flexbox** support required

## Customization

### Colors and Themes
Update CSS custom properties in `styles.css`:

```css
:root {
    --primary-color: #2563eb;
    --primary-hover: #1d4ed8;
    --success-color: #10b981;
    /* ... other colors */
}
```

### Features
- Add new appointment statuses
- Customize booking workflow
- Modify doctor specialties
- Add payment integration
- Implement real-time notifications

## Deployment

### 🐳 Docker Deployment (Recommended)

The application is fully containerized with Docker for easy deployment:

#### Quick Start with Docker
```bash
# Method 1: Using the convenience script
./docker-scripts.sh deploy

# Method 2: Using Docker commands directly
docker build -t appointment-booking-frontend:latest .
docker run -d -p 8080:80 --name medibook-frontend appointment-booking-frontend:latest
```

#### Using Docker Compose
```bash
# Start the application
docker-compose up -d

# Stop the application
docker-compose down
```

#### Docker Scripts Commands
The `docker-scripts.sh` provides convenient commands:

```bash
./docker-scripts.sh build         # Build the Docker image
./docker-scripts.sh run           # Run the container
./docker-scripts.sh deploy        # Build and run (one command)
./docker-scripts.sh status        # Check container status
./docker-scripts.sh logs          # View application logs
./docker-scripts.sh health        # Health check
./docker-scripts.sh stop          # Stop and remove container
./docker-scripts.sh clean         # Remove everything
./docker-scripts.sh shell         # Open shell in container
```

#### Access Your Application
- **Main Application:** http://localhost:8080
- **Demo Page:** http://localhost:8080/demo.html
- **Health Check:** http://localhost:8080/health

#### Docker Features
- **Nginx web server** with optimized configuration
- **Gzip compression** for better performance
- **Security headers** for production safety
- **Health checks** for container monitoring
- **Volume mounting** for log access
- **Auto-restart** unless stopped manually

### Static Hosting
The application can also be deployed to static hosting services:
- **Netlify**
- **Vercel**
- **GitHub Pages**
- **AWS S3**
- **Azure Static Web Apps**

Simply upload the files (`index.html`, `styles.css`, `script.js`) to your hosting provider.

### With Backend
When connecting to a backend:
1. Ensure CORS is configured properly
2. Update API endpoints in `script.js`
3. Implement proper authentication tokens
4. Add error handling for production

## Security Considerations

- **HTTPS only** in production
- **Secure token storage** implementation needed
- **Input validation** on both frontend and backend
- **CORS configuration** required
- **Rate limiting** recommended

## Performance Optimizations

- **Lazy loading** for large datasets
- **Image optimization** for doctor profiles
- **Caching strategies** for API responses
- **Minification** for production builds

## License

This project is created for educational and demonstration purposes.

## Support

For questions or issues, please refer to your backend API documentation and ensure all endpoints are properly configured.

---

**Ready to use! Open `index.html` in your browser to get started.** 