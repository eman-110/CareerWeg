package com.careerweg.back_end.model;
import jakarta.persistence.*;   // for @Entity, @Id, etc.
import java.util.*;            // for List, etc.
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Entity
@Table(name = "enrollments")
public class Enrollment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;

    private boolean completed;
    private boolean certificateIssued;

    // Getters & Setters
}
@Repository
interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {}