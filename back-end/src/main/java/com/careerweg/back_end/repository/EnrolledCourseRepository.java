package com.careerweg.back_end.repository;

import com.careerweg.back_end.model.EnrolledCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EnrolledCourseRepository extends JpaRepository<EnrolledCourse, Long> {
    List<EnrolledCourse> findByUserId(Long userId);
}
