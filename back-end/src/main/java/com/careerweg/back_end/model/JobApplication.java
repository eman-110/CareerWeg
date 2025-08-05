package com.careerweg.back_end.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class JobApplication {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  public Long getId() {
    return id;
}

  public void setId(Long id) {
    this.id = id;
  }

  @ManyToOne
  private User applicant;

  public User getApplicant() {
    return applicant;
}

  public void setApplicant(User applicant) {
    this.applicant = applicant;
  }

  @ManyToOne
  private Job jobs;

  public Job getJobs() {
    return jobs;
}

  public void setJobs(Job job) {
    this.jobs = job;
  }

  private LocalDateTime appliedAt;

  public LocalDateTime getAppliedAt() {
    return appliedAt;
  }

  public void setAppliedAt(LocalDateTime appliedAt) {
    this.appliedAt = appliedAt;
  }
  
  // Getters and Setters
}

