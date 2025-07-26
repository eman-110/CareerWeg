package com.careerweg.back_end.model;
import jakarta.persistence.*;   // for @Entity, @Id, etc.
import java.util.*;            // for List, etc.
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Entity
@Table(name = "applications")
public class Application {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "job_id")
    private Job job;

    @ManyToOne
    @JoinColumn(name = "applicant_id")
    private User applicant;

    private String status; // applied, accepted, rejected

    // Getters & Setters
}

@Repository
interface ApplicationRepository extends JpaRepository<Application, Long> {}