package com.careerweg.back_end.controller;


import com.careerweg.back_end.model.Education;
import com.careerweg.back_end.model.EmployerContact;
import com.careerweg.back_end.model.Job;
import com.careerweg.back_end.model.Language;
import com.careerweg.back_end.model.SignupRequest;
import com.careerweg.back_end.model.User;
import com.careerweg.back_end.model.WorkExperience;
import com.careerweg.back_end.repository.EducationRepository;
import com.careerweg.back_end.repository.EmployerContactRepository;
import com.careerweg.back_end.repository.JobRepository;
import com.careerweg.back_end.repository.LanguageRepository;
import com.careerweg.back_end.repository.UserRepository;
import com.careerweg.back_end.repository.WorkExperienceRepository;
import com.careerweg.back_end.service.UserService;

import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.endpoint.web.annotation.ControllerEndpoint;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
@RequestMapping("/api/users")
public class UserController {

@Autowired
private LanguageRepository languageRepository;
@Autowired
private EducationRepository educationRepository;
@Autowired
private WorkExperienceRepository workExperienceRepository;
    @Autowired
    private EmployerContactRepository employerContactRepository;
    @Autowired
    private JobRepository jobRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserService userService;


    UserController(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }


    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    @GetMapping("/{id}")
    public Optional<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }
    @PostMapping("/signup")
public String signup(@ModelAttribute SignupRequest request, 
HttpSession session) {
    if (!request.getPassword().equals(request.getConfirmPassword())) {
        return "redirect:/webpages/signup/signup.html?error=PasswordMismatch";
    }

    User user = new User(request.getName(), request.getEmail(), request.getPassword(),
    request.getPhoneNumber(), "student");


    userService.createUser(user);

    Optional<User> userOpt = userService.getUserByEmail(user.getEmail());

    if (userOpt.isPresent() && userOpt.get().getPassword().equals(user.getPassword())) {
        session.setAttribute("user", userOpt.get()); // ✅ Store user in session
        return "redirect:/ProfileForm/WelcomePage/index.html";
    } else {
        return "redirect:/webpages/login/login.html?error=InvalidCredentials";
    }
    //return ResponseEntity.ok("Signup successful");
}
@PostMapping("/signup-hire")
public String signupHire(@ModelAttribute SignupRequest request,
HttpSession session) {
    if (!request.getPassword().equals(request.getConfirmPassword())) {
        return "redirect:/webpages/signup/signup.html?error=PasswordMismatch";
    }

    User user = new User(request.getName(), request.getEmail(), request.getPassword(),
    request.getPhoneNumber(), "employer");


    userService.createUser(user);
    Optional<User> userOpt = userService.getUserByEmail(user.getEmail());

    if (userOpt.isPresent() && userOpt.get().getPassword().equals(user.getPassword())) {
        session.setAttribute("user", userOpt.get()); // ✅ Store user in session
        return "redirect:/Hire/Contact/index.html";
    } else {
        return "redirect:/webpages/login/login.html?error=InvalidCredentials";
    }




    //return ResponseEntity.ok("Signup successful");
}

@PostMapping("/login")
public String login(@RequestParam String email,
                    @RequestParam String password,
                    HttpSession session) {
    Optional<User> userOpt = userService.getUserByEmail(email);

    if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
        session.setAttribute("user", userOpt.get()); // ✅ Store user in session
        return "redirect:/AfterLogin/Dashboard/index.html";
    } else {
        return "redirect:/webpages/login/login.html?error=InvalidCredentials";
    }
}
@PostMapping("/login-hire")
public String loginforhire(@RequestParam String email,
                    @RequestParam String password,
                    HttpSession session) {
    Optional<User> userOpt = userService.getUserByEmail(email);

    if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
        session.setAttribute("user", userOpt.get()); // ✅ Store user in session

        return "redirect:/Hire/employeedashboard/dashboard.html";
    } else {
        return "redirect:/webpages/login/login.html?error=InvalidCredentials";
    }
}
@PostMapping("/save-profile-title")
public String saveProfileTitle(@RequestParam String profileTitle, HttpSession session) {
    User user = (User) session.getAttribute("user");

    if (user == null) {
        return "redirect:/login/login.html"; // not logged in
    }

    user.setProfileTitle(profileTitle);
    userService.createUser(user); // updates the record

    // Redirect to next step
    return "redirect:/ProfileForm/WorkExperience/index.html";
}
@PostMapping("/save-educations")
public ResponseEntity<?> saveEducations(@RequestBody List<Education> educations, HttpSession session) {
    User user = (User) session.getAttribute("user");

    if (user == null) {
        return ResponseEntity.status(401).body("User not logged in");
    }

    for (Education edu : educations) {
        edu.setUser(user);
        educationRepository.save(edu);
    }

    return ResponseEntity.ok("Educations saved successfully");
}
@PostMapping("/save-work-experiences")
public ResponseEntity<?> saveWorkExperiences(@RequestBody List<WorkExperience> experiences, HttpSession session) {
    User user = (User) session.getAttribute("user");

    if (user == null) {
        return ResponseEntity.status(401).body("User not logged in");
    }

    for (WorkExperience exp : experiences) {
        exp.setUser(user);
        workExperienceRepository.save(exp);
    }

    return ResponseEntity.ok("Work experiences saved successfully");
}


    @PostMapping("/save-employer-contact")
    public ResponseEntity<?> saveEmployerContact(@RequestBody EmployerContact contact, HttpSession session) {
        User user = (User) session.getAttribute("user");

        if (user == null || !"employer".equals(user.getRole())) {
            return ResponseEntity.status(403).body("Unauthorized: Only employers can submit this form.");
        }

        contact.setUser(user);
        employerContactRepository.save(contact);

        return ResponseEntity.ok("Employer contact info saved successfully.");
    }
    @GetMapping("/employer-contact")
public ResponseEntity<?> getEmployerContact(HttpSession session) {
    User user = (User) session.getAttribute("user");

    if (user == null || !"employer".equals(user.getRole())) {
        return ResponseEntity.status(403).body("Unauthorized");
    }

    EmployerContact contact = employerContactRepository.findByUserId(user.getId());
    return ResponseEntity.ok(contact);
}
@GetMapping("/logout")
public ResponseEntity<?> logout(HttpSession session) {
    session.invalidate();
    return ResponseEntity.ok("Logged out");
}
@PostMapping("/save-languages")
public ResponseEntity<?> saveLanguages(@RequestBody List<Language> languages, HttpSession session) {
    User user = (User) session.getAttribute("user");

    if (user == null) {
        return ResponseEntity.status(401).body("User not logged in.");
    }

    for (Language lang : languages) {
        lang.setUser(user);
        languageRepository.save(lang);
    }

    return ResponseEntity.ok("Languages saved successfully.");
}
@PostMapping("/save-profile-description")
public String saveProfileDescription(@RequestParam("profileDescription") String description,
                                     HttpSession session) {
    User user = (User) session.getAttribute("user");

    if (user == null) {
        return "redirect:/login/login.html"; // not logged in
    }

    user.setProfileDescription(description);
    userService.createUser(user); // assuming save/update happens here

    return "redirect:/ProfileForm/Portfolio/index.html"; // change as needed
}
@PostMapping("/save-skills")
public String saveSkills(@RequestParam("skills") String skills, HttpSession session) {
    User user = (User) session.getAttribute("user");

    if (user == null) {
        return "redirect:/login/login.html"; // not logged in
    }

    user.setSkills(skills);  // Save as comma-separated string
    userService.createUser(user); // Save or update the user

    return "redirect:/ProfileForm/ProfileDescription/index.html"; // adjust next step
}
@PostMapping("/save-portfolio-links")
public String savePortfolio(@RequestParam(required = false) String portfolio1,
                            @RequestParam(required = false) Boolean noPortfolio,
                            HttpSession session) {
    User user = (User) session.getAttribute("user");

    if (user == null) {
        return "redirect:/login/login.html"; // not logged in
    }
    
    if (Boolean.TRUE.equals(noPortfolio) || portfolio1 == null || portfolio1.trim().isEmpty()) {
        user.setPortfolioLink("No portfolio provided");
    } else {
        user.setPortfolioLink(portfolio1.trim());
    }

    userService.createUser(user); // Save user with updated info

    return "redirect:/ProfileForm/Contact/index.html"; // adjust next page as needed
}
@PostMapping("/save-contact-info")
public String saveContactInfo(@RequestParam String firstName,
                              @RequestParam String lastName,
                              @RequestParam String address,
                              @RequestParam String city,
                              @RequestParam String country,
                              @RequestParam String email,
                              @RequestParam String phoneNumber,
                              HttpSession session) {
    User user = (User) session.getAttribute("user");
    if (user == null) {
        return "redirect:/login/login.html"; // not logged in
    }

    user.setFirstName(firstName);
    user.setLastName(lastName);
    user.setAddress(address);
    user.setCity(city);
    user.setCountry(country);
    user.setContactEmail(email);
    user.setPhoneNumber(phoneNumber);

    userService.createUser(user);

    return "redirect:/ProfileForm/Submitted/index.html"; // adjust as needed
}
@GetMapping("/full-profile")
public ResponseEntity<?> getFullProfile(HttpSession session) {
    User user = (User) session.getAttribute("user");
    if (user == null) {
        return ResponseEntity.status(401).body("Not logged in");
    }

    // Fetch associated data (assuming relationships exist)
    Map<String, Object> data = new HashMap<>();
    data.put("user", user);
    data.put("educations", educationRepository.findByUserId(user.getId()));
    data.put("experiences", workExperienceRepository.findByUserId(user.getId()));
    data.put("languages", languageRepository.findByUserId(user.getId()));
    
    return ResponseEntity.ok(data);
}
@GetMapping("/{id}/profile")
public ResponseEntity<User> getUserProfile(@PathVariable Long id) {
    return userRepository.findById(id)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
}

@GetMapping("{id}/languages")
public ResponseEntity<List<Language>> getUserLanguages(@PathVariable Long id) {
    return ResponseEntity.ok(languageRepository.findByUserId(id));
}
@GetMapping("{id}/education")
public ResponseEntity<List<Education>> getUserEducation(@PathVariable Long id) {
    return ResponseEntity.ok(educationRepository.findByUserId(id));
}
@GetMapping("{id}/experience")
public ResponseEntity<List<WorkExperience>> getUserExperience(@PathVariable Long id) {
    return ResponseEntity.ok(workExperienceRepository.findByUserId(id));
}

    @GetMapping("/test-session")
    public ResponseEntity<?> testSession(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(401).body("No user session found");
        }
        return ResponseEntity.ok("User session found: " + user.getEmail());
    }
@GetMapping("/me")
public ResponseEntity<?> getCurrentUser(HttpSession session) {
    User user = (User) session.getAttribute("user");

    if (user == null) {
        return ResponseEntity.status(401).body("User not logged in");
    }

    Map<String, String> userData = new HashMap<>();
    userData.put("firstName", user.getFirstName());
    userData.put("lastName", user.getLastName());
    return ResponseEntity.ok(userData);
}
@PostMapping("/update-profile")
public ResponseEntity<?> updateProfile(@RequestBody User updatedUser, HttpSession session) {
    User sessionUser = (User) session.getAttribute("user");
    if (sessionUser == null) {
        return ResponseEntity.status(401).body("Not logged in");
    }

    sessionUser.setFirstName(updatedUser.getFirstName());
    sessionUser.setLastName(updatedUser.getLastName());
    sessionUser.setAddress(updatedUser.getAddress());
    sessionUser.setCity(updatedUser.getCity());
    sessionUser.setCountry(updatedUser.getCountry());
    sessionUser.setContactEmail(updatedUser.getEmail());  // or setEmail()
    sessionUser.setPhoneNumber(updatedUser.getPhoneNumber());

    userService.createUser(sessionUser);
    return ResponseEntity.ok("Profile updated");
}
@GetMapping("/all-properties")
public ResponseEntity<?> getAllUserProperties(HttpSession session) {
    User user = (User) session.getAttribute("user");

    if (user == null) {
        return ResponseEntity.status(401).body("User not logged in");
    }

    Map<String, Object> userData = new HashMap<>();
    userData.put("id", user.getId());
    userData.put("name", user.getName());
    userData.put("firstName", user.getFirstName());
    userData.put("lastName", user.getLastName());
    userData.put("email", user.getEmail());
    userData.put("contactEmail", user.getContactEmail());
    userData.put("phoneNumber", user.getPhoneNumber());
    userData.put("address", user.getAddress());
    userData.put("city", user.getCity());
    userData.put("country", user.getCountry());
    userData.put("role", user.getRole());
    userData.put("profileTitle", user.getProfileTitle());
    userData.put("profileDescription", user.getProfileDescription());
    userData.put("skills", user.getSkills());
    userData.put("portfolioLink", user.getPortfolioLink());

    // Add related data
    userData.put("educations", educationRepository.findByUserId(user.getId()));
    userData.put("experiences", workExperienceRepository.findByUserId(user.getId()));
    userData.put("languages", languageRepository.findByUserId(user.getId()));

    if ("employer".equals(user.getRole())) {
        EmployerContact contact = employerContactRepository.findByUserId(user.getId());
        userData.put("employerContact", contact);
    }

    return ResponseEntity.ok(userData);
}

}
