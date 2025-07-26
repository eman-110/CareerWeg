package com.careerweg.back_end.model;
import jakarta.persistence.*;   // for @Entity, @Id, etc.
import java.util.*;            // for List, etc.
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Entity
@Table(name = "courses")
public class Course {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String description;
    private boolean certificateAvailable;

    @ManyToOne
    @JoinColumn(name = "path_id")
    private CareerPath careerPath;

    @OneToMany(mappedBy = "course")
    private List<Enrollment> enrollments;

    // Getters & Setters
}
@Repository
interface CourseRepository extends JpaRepository<Course, Long> {}