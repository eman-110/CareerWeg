package com.careerweg.back_end.model;

import jakarta.persistence.*;

@Entity
public class WorkExperience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String jobTitle;
    private String company;
    private String fromDate;
    private String toDate;
    private String description;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // Constructors
    public WorkExperience() {}

    public WorkExperience(String jobTitle, String company, String fromDate, String toDate, String description, User user) {
        this.jobTitle = jobTitle;
        this.company = company;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.description = description;
        this.user = user;
    }

    // Getters and setters
    public Long getId() { return id; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getFromDate() { return fromDate; }
    public void setFromDate(String fromDate) { this.fromDate = fromDate; }

    public String getToDate() { return toDate; }
    public void setToDate(String toDate) { this.toDate = toDate; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}

