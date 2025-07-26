package com.careerweg.back_end.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.careerweg.back_end.model.Job;
import com.careerweg.back_end.model.JobApplication;
import com.careerweg.back_end.model.User;
import com.careerweg.back_end.repository.JobApplicationRepository;
import com.careerweg.back_end.repository.JobRepository;

import jakarta.servlet.http.HttpSession;
@Controller
@RequestMapping("/api/jobs")
public class JobController {
        @Autowired
    private JobRepository jobRepository;
    @Autowired
    private JobApplicationRepository jobApplicationRepository;
    @GetMapping("/employer-jobs")
public ResponseEntity<List<Job>> getEmployerJobs(HttpSession session) {
    User user = (User) session.getAttribute("user");

    if (user == null || !"employer".equals(user.getRole())) {
        return ResponseEntity.status(403).build();
    }

    List<Job> jobs = jobRepository.findByEmployerId(user.getId());
    return ResponseEntity.ok(jobs);
}
@PostMapping("/submit-job")
public String submitJob(@ModelAttribute Job job, HttpSession session) {
    User user = (User) session.getAttribute("user");

    if (user == null || !"employer".equals(user.getRole())) {
        return "redirect:/hire/login/index.html";
    }

    job.setEmployer(user);
    jobRepository.save(job);

    return "redirect:/hire/Submitted Job/job-posted.html"; // or show a message
}
@GetMapping("/all")
public ResponseEntity<List<Job>> getAllJobs() {
    return ResponseEntity.ok(jobRepository.findAll());
}
@GetMapping("/{id}")
public ResponseEntity<Job> getJobById(@PathVariable Long id) {
    return jobRepository.findById(id)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
}
@PostMapping("/apply-job")
public String applyToJob(@RequestParam Long jobId, HttpSession session) {
    User user = (User) session.getAttribute("user");

    if (user == null) {
        return "redirect:/hire/login/index.html";
    }

    Job job = jobRepository.findById(jobId).orElse(null);
    if (job == null) {
        return "redirect:/error-page.html"; // handle invalid ID gracefully
    }

    JobApplication application = new JobApplication();
    application.setJobs(job);
    application.setApplicant(user);
    application.setAppliedAt(LocalDateTime.now());

    jobApplicationRepository.save(application);

    return "redirect:/AfterLogin/Applied Job/index.html"; // or confirmation page
}
@GetMapping("/applied-jobs")
public ResponseEntity<List<JobApplication>> getAppliedJobs(HttpSession session) {
    User user = (User) session.getAttribute("user");

    if (user == null) {
        return ResponseEntity.status(401).build();
    }

    List<JobApplication> applications = jobApplicationRepository.findByApplicantId(user.getId());
    return ResponseEntity.ok(applications);
}
@GetMapping("/{jobId}/applicants")
public ResponseEntity<List<User>> getApplicantsByJob(@PathVariable Long jobId) {
    List<JobApplication> applications = jobApplicationRepository.findByJobsId(jobId);
    List<User> applicants = applications.stream()
        .map(JobApplication::getApplicant)
        .collect(Collectors.toList());
    return ResponseEntity.ok(applicants);
}

}
