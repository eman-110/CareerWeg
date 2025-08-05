package com.careerweg.back_end.controller;

import com.careerweg.back_end.model.EnrolledCourse;
import com.careerweg.back_end.model.User;
import com.careerweg.back_end.repository.EnrolledCourseRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    @Autowired
    private EnrolledCourseRepository enrolledCourseRepository;

    // For AJAX POST: Enroll user to course
    @PostMapping("/enroll")
    @ResponseBody
    public ResponseEntity<String> enrollCourse(@RequestBody Map<String, String> payload, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(401).body("NOT_LOGGED_IN");
        }

        String courseName = payload.get("courseName");
        if (courseName == null || courseName.isEmpty()) {
            return ResponseEntity.badRequest().body("COURSE_NAME_REQUIRED");
        }

        // Prevent duplicate enrollment
        List<EnrolledCourse> existing = enrolledCourseRepository.findByUserId(user.getId());
        boolean alreadyEnrolled = existing.stream().anyMatch(c -> c.getCourseName().equalsIgnoreCase(courseName));
        if (alreadyEnrolled) {
            return ResponseEntity.ok("ALREADY_ENROLLED");
        }

        EnrolledCourse course = new EnrolledCourse();
        course.setCourseName(courseName);
        course.setStatus("In Progress");
        course.setEnrollmentDate(LocalDate.now());
        course.setUser(user);

        enrolledCourseRepository.save(course);
        return ResponseEntity.ok("ENROLLED");
    }

    // For skill test completion
    @PostMapping("/complete")
    public String completeCourse(@RequestParam("courseId") Long courseId, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return "redirect:/login";
        }

        EnrolledCourse course = enrolledCourseRepository.findById(courseId).orElse(null);
        if (course != null && course.getUser().getId().equals(user.getId())) {
            course.setStatus("Complete");
            enrolledCourseRepository.save(course);
        }

        return "redirect:/webpages/My Courses In Progress/index.html";
    }

    // For AJAX: Get list of user's enrolled courses
    @GetMapping("/my-courses")
    @ResponseBody
    public ResponseEntity<List<EnrolledCourse>> getMyCourses(HttpSession session) {
        User user = (User) session.getAttribute("user");

        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        List<EnrolledCourse> myCourses = enrolledCourseRepository.findByUserId(user.getId());
        return ResponseEntity.ok(myCourses);
    }
    @PostMapping("/complete-by-name")
@ResponseBody
public ResponseEntity<String> completeByName(@RequestParam("courseName") String courseName, HttpSession session) {
    User user = (User) session.getAttribute("user");
    if (user == null) return ResponseEntity.status(401).body("Unauthorized");

    List<EnrolledCourse> courses = enrolledCourseRepository.findByUserId(user.getId());

    for (EnrolledCourse course : courses) {
        if (course.getCourseName().contains(courseName)) {
            course.setStatus("Complete");
            enrolledCourseRepository.save(course);
            return ResponseEntity.ok("Course marked as complete");
        }
    }

    return ResponseEntity.status(404).body("Course not found");
}

}
