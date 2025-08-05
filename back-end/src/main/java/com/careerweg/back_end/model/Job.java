package com.careerweg.back_end.model;

import jakarta.persistence.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String jobTitle;
    private String skills;
    private String category;
    private Integer minBudget;
    private Integer maxBudget;
    private String budgetType;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate deadline;

    private String duration;
    private String experience;

    @Column(length = 2000)
    private String description;

    @ManyToOne
    @JoinColumn(name = "employer_id", nullable = false)
    private User employer;

    // Constructors
    public Job() {}

    // Getters and Setters

    public Long getId() { return id; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getMinBudget() { return minBudget; }
    public void setMinBudget(Integer minBudget) { this.minBudget = minBudget; }

    public Integer getMaxBudget() { return maxBudget; }
    public void setMaxBudget(Integer maxBudget) { this.maxBudget = maxBudget; }

    public String getBudgetType() { return budgetType; }
    public void setBudgetType(String budgetType) { this.budgetType = budgetType; }

    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public User getEmployer() { return employer; }
    public void setEmployer(User employer) { this.employer = employer; }
}
