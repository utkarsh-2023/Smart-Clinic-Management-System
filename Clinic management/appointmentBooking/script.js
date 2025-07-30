// Application State
let currentUser = null;
let selectedDoctor = null;
let selectedSlot = null;
let selectedDate = null;
let currentBookingStep = 1;

// Configuration
const API_BASE_URL = 'http://localhost:3000/api'; // Update this to your backend URL
const MOCK_MODE = true; // Set to false when connecting to real backend

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Application Initialization
function initializeApp() {
    // Check for existing session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        showDashboard();
    } else {
        showAuthSection();
    }
    
    // Set minimum date for appointment booking
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const appointmentDateInput = document.getElementById('appointmentDate');
    if (appointmentDateInput) {
        appointmentDateInput.min = tomorrow.toISOString().split('T')[0];
    }
    
    // Add event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Signup user type change
    const signupUserType = document.getElementById('signupUserType');
    if (signupUserType) {
        signupUserType.addEventListener('change', function() {
            const doctorSpecialty = document.getElementById('doctorSpecialty');
            if (this.value === 'doctor') {
                doctorSpecialty.style.display = 'block';
            } else {
                doctorSpecialty.style.display = 'none';
            }
        });
    }
    
    // Doctor search functionality
    const doctorSearch = document.getElementById('doctorSearch');
    if (doctorSearch) {
        doctorSearch.addEventListener('input', filterDoctors);
    }
}

// Authentication Functions
function showTab(tabName) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    // Remove active class from all tabs
    tabBtns.forEach(btn => btn.classList.remove('active'));
    
    if (tabName === 'login') {
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
        document.querySelector('button[onclick="showTab(\'login\')"]').classList.add('active');
    } else {
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
        document.querySelector('button[onclick="showTab(\'signup\')"]').classList.add('active');
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const userType = document.getElementById('loginUserType').value;
    
    showLoading(true);
    
    try {
        const response = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password, userType })
        });
        
        if (response.success) {
            currentUser = response.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showToast('Login successful!', 'success');
            showDashboard();
        } else {
            showToast(response.message || 'Login failed', 'error');
        }
    } catch (error) {
        showToast('Login failed. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

async function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const userType = document.getElementById('signupUserType').value;
    const specialty = document.getElementById('signupSpecialty').value;
    
    showLoading(true);
    
    try {
        const userData = { name, email, password, userType };
        if (userType === 'doctor' && specialty) {
            userData.specialty = specialty;
        }
        
        const response = await apiCall('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        if (response.success) {
            showToast('Account created successfully! Please login.', 'success');
            showTab('login');
            // Clear form
            document.getElementById('signupForm').reset();
        } else {
            showToast(response.message || 'Signup failed', 'error');
        }
    } catch (error) {
        showToast('Signup failed. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showAuthSection();
    showToast('Logged out successfully', 'success');
}

// Navigation Functions
function showAuthSection() {
    hideAllSections();
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('mainNav').style.display = 'none';
}

function showDashboard() {
    hideAllSections();
    document.getElementById('mainNav').style.display = 'block';
    
    if (currentUser.userType === 'doctor') {
        document.getElementById('doctorDashboard').style.display = 'block';
        loadDoctorDashboard();
    } else {
        document.getElementById('patientDashboard').style.display = 'block';
        loadPatientDashboard();
    }
}

function showBookingSection() {
    hideAllSections();
    document.getElementById('bookingSection').style.display = 'block';
    resetBookingFlow();
    loadDoctors();
}

function hideBookingSection() {
    hideAllSections();
    showDashboard();
}

function hideAllSections() {
    const sections = ['authSection', 'doctorDashboard', 'patientDashboard', 'bookingSection'];
    sections.forEach(section => {
        document.getElementById(section).style.display = 'none';
    });
}

// Doctor Dashboard Functions
async function loadDoctorDashboard() {
    document.getElementById('doctorName').textContent = `Dr. ${currentUser.name}`;
    
    try {
        const appointments = await apiCall(`/appointments/doctor/${currentUser.id}`);
        displayDoctorAppointments(appointments);
        updateDoctorStats(appointments);
    } catch (error) {
        showToast('Failed to load appointments', 'error');
    }
}

function updateDoctorStats(appointments) {
    const today = new Date().toDateString();
    const todayAppointments = appointments.filter(apt => 
        new Date(apt.date).toDateString() === today
    ).length;
    
    const upcomingAppointments = appointments.filter(apt => 
        new Date(apt.dateTime) > new Date() && apt.status === 'upcoming'
    ).length;
    
    const completedAppointments = appointments.filter(apt => 
        apt.status === 'completed'
    ).length;
    
    document.getElementById('todayAppointments').textContent = todayAppointments;
    document.getElementById('upcomingAppointments').textContent = upcomingAppointments;
    document.getElementById('completedAppointments').textContent = completedAppointments;
}

function displayDoctorAppointments(appointments) {
    const appointmentsList = document.getElementById('doctorAppointmentsList');
    
    if (appointments.length === 0) {
        appointmentsList.innerHTML = '<p>No appointments found.</p>';
        return;
    }
    
    appointmentsList.innerHTML = appointments.map(appointment => `
        <div class="appointment-card" data-filter="${appointment.status}">
            <div class="appointment-header">
                <div class="appointment-info">
                    <h4>${appointment.patientName}</h4>
                    <div class="appointment-meta">
                        <span><i class="fas fa-calendar"></i> ${formatDate(appointment.dateTime)}</span>
                        <span><i class="fas fa-clock"></i> ${formatTime(appointment.dateTime)}</span>
                    </div>
                </div>
                <span class="appointment-status status-${appointment.status}">${appointment.status}</span>
            </div>
            ${appointment.notes ? `<p><strong>Notes:</strong> ${appointment.notes}</p>` : ''}
        </div>
    `).join('');
}

function filterAppointments(filter) {
    const filterBtns = document.querySelectorAll('.appointments-filters .filter-btn');
    filterBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const appointmentCards = document.querySelectorAll('.appointment-card');
    appointmentCards.forEach(card => {
        if (filter === 'all' || card.dataset.filter === filter) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Patient Dashboard Functions
async function loadPatientDashboard() {
    document.getElementById('patientName').textContent = currentUser.name;
    
    try {
        const appointments = await apiCall(`/appointments/patient/${currentUser.id}`);
        displayPatientAppointments(appointments);
    } catch (error) {
        showToast('Failed to load appointments', 'error');
    }
}

function displayPatientAppointments(appointments) {
    const appointmentsList = document.getElementById('patientAppointmentsList');
    
    if (appointments.length === 0) {
        appointmentsList.innerHTML = '<p>No appointments found. <a href="#" onclick="showBookingSection()">Book your first appointment</a></p>';
        return;
    }
    
    appointmentsList.innerHTML = appointments.map(appointment => `
        <div class="appointment-card" data-filter="${appointment.status}">
            <div class="appointment-header">
                <div class="appointment-info">
                    <h4>Dr. ${appointment.doctorName}</h4>
                    <p class="doctor-specialty">${appointment.doctorSpecialty}</p>
                    <div class="appointment-meta">
                        <span><i class="fas fa-calendar"></i> ${formatDate(appointment.dateTime)}</span>
                        <span><i class="fas fa-clock"></i> ${formatTime(appointment.dateTime)}</span>
                    </div>
                </div>
                <span class="appointment-status status-${appointment.status}">${appointment.status}</span>
            </div>
            ${appointment.notes ? `<p><strong>Notes:</strong> ${appointment.notes}</p>` : ''}
        </div>
    `).join('');
}

function filterPatientAppointments(filter) {
    const filterBtns = document.querySelectorAll('.appointments-filters .filter-btn');
    filterBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const appointmentCards = document.querySelectorAll('.appointment-card');
    const now = new Date();
    
    appointmentCards.forEach(card => {
        const show = filter === 'all' || 
                   (filter === 'upcoming' && card.dataset.filter === 'upcoming') ||
                   (filter === 'previous' && (card.dataset.filter === 'completed' || card.dataset.filter === 'cancelled'));
        
        card.style.display = show ? 'block' : 'none';
    });
}

// Booking Functions
function resetBookingFlow() {
    currentBookingStep = 1;
    selectedDoctor = null;
    selectedSlot = null;
    selectedDate = null;
    
    // Reset steps
    document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
    document.getElementById('step1').classList.add('active');
    
    // Reset step content
    document.querySelectorAll('.booking-step').forEach(step => step.classList.remove('active'));
    document.getElementById('doctorSelection').classList.add('active');
    
    // Reset form
    document.getElementById('doctorSearch').value = '';
    document.getElementById('appointmentDate').value = '';
    document.getElementById('appointmentNotes').value = '';
}

async function loadDoctors() {
    try {
        const doctors = await apiCall('/doctors');
        displayDoctors(doctors);
    } catch (error) {
        showToast('Failed to load doctors', 'error');
    }
}

function displayDoctors(doctors) {
    const doctorsList = document.getElementById('doctorsList');
    
    doctorsList.innerHTML = doctors.map(doctor => `
        <div class="doctor-card" data-doctor-id="${doctor.id}" onclick="selectDoctor(${doctor.id})">
            <div class="doctor-info">
                <div class="doctor-avatar">
                    ${doctor.name.charAt(0)}
                </div>
                <div class="doctor-details">
                    <h4>Dr. ${doctor.name}</h4>
                    <p class="doctor-specialty">${doctor.specialty}</p>
                </div>
            </div>
            <div class="doctor-rating">
                <span class="stars">★★★★★</span>
                <span>4.8 (${Math.floor(Math.random() * 50) + 20} reviews)</span>
            </div>
            <p>Experience: ${doctor.experience || '5+ years'}</p>
        </div>
    `).join('');
}

function filterDoctors() {
    const searchTerm = document.getElementById('doctorSearch').value.toLowerCase();
    const doctorCards = document.querySelectorAll('.doctor-card');
    
    doctorCards.forEach(card => {
        const doctorName = card.querySelector('h4').textContent.toLowerCase();
        const doctorSpecialty = card.querySelector('.doctor-specialty').textContent.toLowerCase();
        
        if (doctorName.includes(searchTerm) || doctorSpecialty.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

async function selectDoctor(doctorId) {
    // Remove previous selection
    document.querySelectorAll('.doctor-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selection to clicked card
    document.querySelector(`[data-doctor-id="${doctorId}"]`).classList.add('selected');
    
    // Get doctor data
    try {
        selectedDoctor = await apiCall(`/doctors/${doctorId}`);
        goToStep(2);
    } catch (error) {
        showToast('Failed to select doctor', 'error');
    }
}

function goToStep(step) {
    // Update step indicators
    document.querySelectorAll('.step').forEach(stepEl => stepEl.classList.remove('active'));
    document.getElementById(`step${step}`).classList.add('active');
    
    // Update step content
    document.querySelectorAll('.booking-step').forEach(stepEl => stepEl.classList.remove('active'));
    
    switch(step) {
        case 1:
            document.getElementById('doctorSelection').classList.add('active');
            break;
        case 2:
            document.getElementById('slotSelection').classList.add('active');
            displaySelectedDoctor();
            break;
        case 3:
            document.getElementById('confirmBooking').classList.add('active');
            displayBookingSummary();
            break;
    }
    
    currentBookingStep = step;
}

function displaySelectedDoctor() {
    const selectedDoctorCard = document.getElementById('selectedDoctorCard');
    selectedDoctorCard.innerHTML = `
        <div class="doctor-info">
            <div class="doctor-avatar">
                ${selectedDoctor.name.charAt(0)}
            </div>
            <div class="doctor-details">
                <h4>Dr. ${selectedDoctor.name}</h4>
                <p class="doctor-specialty">${selectedDoctor.specialty}</p>
            </div>
        </div>
    `;
}

async function loadAvailableSlots() {
    const selectedDate = document.getElementById('appointmentDate').value;
    if (!selectedDate || !selectedDoctor) return;
    
    try {
        const slots = await apiCall(`/doctors/${selectedDoctor.id}/slots?date=${selectedDate}`);
        displayAvailableSlots(slots);
    } catch (error) {
        showToast('Failed to load available slots', 'error');
    }
}

function displayAvailableSlots(slots) {
    const slotsContainer = document.getElementById('availableSlots');
    
    if (slots.length === 0) {
        slotsContainer.innerHTML = '<p>No available slots for this date.</p>';
        return;
    }
    
    slotsContainer.innerHTML = slots.map(slot => `
        <button class="slot-btn ${!slot.available ? 'unavailable' : ''}" 
                onclick="selectSlot('${slot.time}')" 
                ${!slot.available ? 'disabled' : ''}>
            ${slot.time}
        </button>
    `).join('');
}

function selectSlot(time) {
    // Remove previous selection
    document.querySelectorAll('.slot-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Add selection to clicked slot
    event.target.classList.add('selected');
    
    selectedSlot = time;
    selectedDate = document.getElementById('appointmentDate').value;
    
    // Enable next button
    document.getElementById('nextToConfirm').disabled = false;
}

function displayBookingSummary() {
    const bookingSummary = document.getElementById('bookingSummary');
    
    bookingSummary.innerHTML = `
        <div class="summary-item">
            <span>Doctor:</span>
            <span>Dr. ${selectedDoctor.name}</span>
        </div>
        <div class="summary-item">
            <span>Specialty:</span>
            <span>${selectedDoctor.specialty}</span>
        </div>
        <div class="summary-item">
            <span>Date:</span>
            <span>${formatDate(selectedDate)}</span>
        </div>
        <div class="summary-item">
            <span>Time:</span>
            <span>${selectedSlot}</span>
        </div>
        <div class="summary-item">
            <span>Consultation Fee:</span>
            <span>$${selectedDoctor.fee || 50}</span>
        </div>
    `;
}

async function confirmBooking() {
    const notes = document.getElementById('appointmentNotes').value;
    
    const bookingData = {
        doctorId: selectedDoctor.id,
        patientId: currentUser.id,
        date: selectedDate,
        time: selectedSlot,
        notes: notes
    };
    
    showLoading(true);
    
    try {
        const response = await apiCall('/appointments', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
        
        if (response.success) {
            showToast('Appointment booked successfully!', 'success');
            hideBookingSection();
        } else {
            showToast(response.message || 'Booking failed', 'error');
        }
    } catch (error) {
        showToast('Booking failed. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// API Functions
async function apiCall(endpoint, options = {}) {
    // Mock API responses for demo purposes
    if (MOCK_MODE) {
        return mockApiCall(endpoint, options);
    }
    
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(currentUser ? { 'Authorization': `Bearer ${currentUser.token}` } : {})
        }
    };
    
    const response = await fetch(url, { ...defaultOptions, ...options });
    return response.json();
}

// Mock API for demo purposes
function mockApiCall(endpoint, options = {}) {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (endpoint === '/auth/login') {
                const { email, userType } = JSON.parse(options.body);
                resolve({
                    success: true,
                    user: {
                        id: Math.random().toString(36).substr(2, 9),
                        name: userType === 'doctor' ? 'John Smith' : 'Jane Doe',
                        email: email,
                        userType: userType,
                        token: 'mock-jwt-token'
                    }
                });
            } else if (endpoint === '/auth/signup') {
                resolve({ success: true, message: 'User created successfully' });
            } else if (endpoint === '/doctors') {
                resolve(generateMockDoctors());
            } else if (endpoint.includes('/doctors/') && endpoint.includes('/slots')) {
                resolve(generateMockSlots());
            } else if (endpoint.startsWith('/doctors/')) {
                const doctorId = endpoint.split('/')[2];
                resolve(generateMockDoctor(doctorId));
            } else if (endpoint.includes('/appointments/doctor/')) {
                resolve(generateMockDoctorAppointments());
            } else if (endpoint.includes('/appointments/patient/')) {
                resolve(generateMockPatientAppointments());
            } else if (endpoint === '/appointments' && options.method === 'POST') {
                resolve({ success: true, message: 'Appointment booked successfully' });
            } else {
                resolve({ success: false, message: 'Endpoint not found' });
            }
        }, 1000);
    });
}

// Mock Data Generators
function generateMockDoctors() {
    return [
        {
            id: 1,
            name: 'Sarah Johnson',
            specialty: 'Cardiology',
            experience: '10+ years',
            fee: 75
        },
        {
            id: 2,
            name: 'Michael Chen',
            specialty: 'Dermatology',
            experience: '8+ years',
            fee: 60
        },
        {
            id: 3,
            name: 'Emily Davis',
            specialty: 'Pediatrics',
            experience: '12+ years',
            fee: 65
        },
        {
            id: 4,
            name: 'Robert Wilson',
            specialty: 'Orthopedics',
            experience: '15+ years',
            fee: 80
        },
        {
            id: 5,
            name: 'Lisa Brown',
            specialty: 'Neurology',
            experience: '9+ years',
            fee: 85
        },
        {
            id: 6,
            name: 'David Miller',
            specialty: 'General Medicine',
            experience: '7+ years',
            fee: 50
        }
    ];
}

function generateMockDoctor(id) {
    const doctors = generateMockDoctors();
    return doctors.find(doc => doc.id == id) || doctors[0];
}

function generateMockSlots() {
    const slots = [];
    const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
    
    times.forEach(time => {
        slots.push({
            time: time,
            available: Math.random() > 0.3 // 70% chance of being available
        });
    });
    
    return slots;
}

function generateMockDoctorAppointments() {
    const appointments = [];
    const patients = ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Eve Brown'];
    const statuses = ['upcoming', 'completed', 'upcoming', 'completed'];
    
    for (let i = 0; i < 8; i++) {
        const date = new Date();
        date.setDate(date.getDate() + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 10));
        
        appointments.push({
            id: i + 1,
            patientName: patients[Math.floor(Math.random() * patients.length)],
            dateTime: date.toISOString(),
            status: statuses[Math.floor(Math.random() * statuses.length)],
            notes: Math.random() > 0.7 ? 'Patient has been experiencing headaches' : null
        });
    }
    
    return appointments;
}

function generateMockPatientAppointments() {
    const appointments = [];
    const doctors = generateMockDoctors();
    const statuses = ['upcoming', 'completed', 'upcoming'];
    
    for (let i = 0; i < 5; i++) {
        const doctor = doctors[Math.floor(Math.random() * doctors.length)];
        const date = new Date();
        date.setDate(date.getDate() + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 10));
        
        appointments.push({
            id: i + 1,
            doctorName: doctor.name,
            doctorSpecialty: doctor.specialty,
            dateTime: date.toISOString(),
            status: statuses[Math.floor(Math.random() * statuses.length)],
            notes: Math.random() > 0.8 ? 'Follow-up appointment' : null
        });
    }
    
    return appointments;
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// UI Helper Functions
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    spinner.style.display = show ? 'flex' : 'none';
}

function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'exclamation-circle' : 'exclamation-triangle';
    
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Remove toast after 5 seconds
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function showModal(message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmBtn = document.getElementById('confirmBtn');
    
    confirmMessage.textContent = message;
    
    confirmBtn.onclick = function() {
        closeModal();
        if (onConfirm) onConfirm();
    };
    
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('confirmModal').style.display = 'none';
} 