package com.careerweg.back_end.repository;

import com.careerweg.back_end.model.Job;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByEmployerId(Long employerId);

}
