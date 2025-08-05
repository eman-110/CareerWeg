package com.careerweg.back_end.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.careerweg.back_end.model.JobApplication;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByApplicantId(Long userId);
    List<JobApplication> findByJobsId(Long jobsId);
}

