package com.careerweg.back_end.repository;


import com.careerweg.back_end.model.WorkExperience;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkExperienceRepository extends JpaRepository<WorkExperience, Long> {
        List<WorkExperience> findByUserId(Long userId);
}
