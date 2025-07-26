package com.careerweg.back_end.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.careerweg.back_end.model.User;

import jakarta.servlet.http.HttpSession;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
@RestController
@RequestMapping("/session")
public class SessionController {

    @GetMapping("/user")
    public Map<String, String> getUserName(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user != null) {
            return Map.of("name", user.getName());
        } else {
            return Map.of("name", "Guest");
        }
    }
}

