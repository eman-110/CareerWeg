package com.careerweg.back_end.model;

import jakarta.persistence.*;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Entity
@Table(name = "users")
@JsonIgnoreProperties({"applications", "jobs", "hibernateLazyInitializer", "handler"})

public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String firstName;
public String getFirstName() {
        return firstName;
    }
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
private String lastName;
public String getLastName() {
    return lastName;
}
public void setLastName(String lastName) {
    this.lastName = lastName;
}
private String address;
public String getAddress() {
    return address;
}
public void setAddress(String address) {
    this.address = address;
}
private String city;
public String getCity() {
    return city;
}
public void setCity(String city) {
    this.city = city;
}
private String country;

// Add corresponding getters and setters

    public String getCountry() {
    return country;
}
public void setCountry(String country) {
    this.country = country;
}
    private String email;
    private String contactEmail;
    public String getContactEmail() {
        return contactEmail;
    }
    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    private String password;
    private String phoneNumber;
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    private String profileTitle;
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Education> educations = new ArrayList<>();
    
    public User() {
        // Required by JPA
    }
    private String role; // student or freelancer
    public User(String name, String email, String password, String phoneNumber, String role) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.phoneNumber = phoneNumber;
        this.role = role;
    }
    public String getName() {
        return name;
    }
    
    public String getEmail() {
        return email;
    }
    public String getProfileTitle() {
        return profileTitle;
    }
    
    public void setProfileTitle(String profileTitle) {
        this.profileTitle = profileTitle;
    }
    
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public String getPassword() {
        return password;
    }
    
    public String getRole() {
        return role;
    }
    
    public Long getId() {
        return id;
    }
    @Column(length = 500)
private String profileDescription;

public String getProfileDescription() {
    return profileDescription;
}

public void setProfileDescription(String profileDescription) {
    this.profileDescription = profileDescription;
}
@Column(length = 1000)
private String skills;

public String getSkills() {
    return skills;
}

public void setSkills(String skills) {
    this.skills = skills;
}
private String portfolioLink;

public String getPortfolioLink() {
    return portfolioLink;
}

public void setPortfolioLink(String portfolioLink) {
    this.portfolioLink = portfolioLink;
}

}


