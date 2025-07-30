package com.clinic.controller;

import com.clinic.entity.Prescription;
import com.clinic.service.PrescriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {
    @Autowired
    private PrescriptionService prescriptionService;

    @PostMapping
    public ResponseEntity<?> savePrescription(@RequestHeader("Authorization") String token, @Valid @RequestBody Prescription prescription) {
        if (prescription == null) {
            return ResponseEntity.badRequest().body("Invalid prescription data");
        }
        Prescription saved = prescriptionService.savePrescription(prescription);
        return ResponseEntity.ok(saved);
    }
} 