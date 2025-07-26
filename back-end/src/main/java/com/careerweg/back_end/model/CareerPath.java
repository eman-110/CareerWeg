package com.careerweg.back_end.model;
import jakarta.persistence.*;   // for @Entity, @Id, etc.
import java.util.*;            // for List, etc.
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Entity
@Table(name = "career_paths")
public class CareerPath {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String description;

    @OneToMany(mappedBy = "careerPath")
    private List<Course> courses;

    // Getters & Setters
}

@Repository
interface CareerPathRepository extends JpaRepository<CareerPath, Long> {}