package com.clinic.entity;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "doctors")
public class Doctor extends User {
    private String specialization;

    @ElementCollection
    private List<LocalDateTime> availableTimes;

    // Getters and setters
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    public List<LocalDateTime> getAvailableTimes() { return availableTimes; }
    public void setAvailableTimes(List<LocalDateTime> availableTimes) { this.availableTimes = availableTimes; }
}
