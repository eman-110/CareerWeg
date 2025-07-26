package com.careerweg.back_end.repository;


import com.careerweg.back_end.model.Education;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EducationRepository extends JpaRepository<Education, Long> {
        List<Education> findByUserId(Long userId);
}
