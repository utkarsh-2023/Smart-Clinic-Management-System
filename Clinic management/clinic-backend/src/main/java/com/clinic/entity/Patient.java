package com.clinic.entity;

import javax.persistence.*;

@Entity
@Table(name = "patients")
public class Patient extends User {
    private int age;
    private String gender;

    // Getters and setters
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
}
