package com.clinic.service;

import com.clinic.entity.Doctor;
import com.clinic.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class DoctorService {
    @Autowired
    private DoctorRepository doctorRepository;

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Optional<Doctor> getDoctorById(Long id) {
        return doctorRepository.findById(id);
    }

    public Doctor saveDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    public void deleteDoctor(Long id) {
        doctorRepository.deleteById(id);
    }

    public List<java.time.LocalDateTime> getAvailableTimeSlots(Long doctorId, LocalDate date) {
        return doctorRepository.findById(doctorId)
            .map(doc -> doc.getAvailableTimes().stream()
                .filter(dt -> dt.toLocalDate().equals(date))
                .collect(java.util.stream.Collectors.toList()))
            .orElse(java.util.Collections.emptyList());
    }

    public org.springframework.http.ResponseEntity<?> validateDoctorLogin(String username, String password) {
        Doctor doctor = doctorRepository.findAll().stream().filter(d -> d.getUsername().equals(username)).findFirst().orElse(null);
        if (doctor != null && doctor.getPassword().equals(password)) {
            return org.springframework.http.ResponseEntity.ok(doctor);
        }
        return org.springframework.http.ResponseEntity.status(401).body("Invalid credentials");
    }
}
