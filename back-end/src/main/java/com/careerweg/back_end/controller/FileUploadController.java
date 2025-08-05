package com.careerweg.back_end.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Controller
public class FileUploadController {

    private static final String UPLOAD_DIR = "uploads";

    @PostMapping("/upload-skill-file")
    @ResponseBody
    public ResponseEntity<String> handleUpload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        try {
            // Get absolute path to your project root
            String projectRoot = System.getProperty("user.dir");
            Path uploadPath = Paths.get(projectRoot, UPLOAD_DIR);
            Files.createDirectories(uploadPath); // Create folder if it doesn't exist

            // Save the file
            Path filePath = uploadPath.resolve(file.getOriginalFilename());
            file.transferTo(filePath.toFile());

            return ResponseEntity.ok("File uploaded successfully: " + filePath.getFileName());
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }
}
