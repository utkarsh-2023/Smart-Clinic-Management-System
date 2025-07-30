package com.clinic.entity;

import javax.persistence.*;

@Entity
@Table(name = "admins")
public class Admin extends User {
    // Additional admin-specific fields if needed
}
