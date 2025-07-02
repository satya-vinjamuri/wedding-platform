package com.example.flutterapp.controller;

import com.example.flutterapp.dto.FlutterAppForm;
import com.example.flutterapp.service.FlutterAppService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;

@RestController
@RequestMapping("/api")
public class FlutterAppController {

    @Autowired
    private FlutterAppService flutterAppService;

    @PostMapping("/generate-app")
    public ResponseEntity<ByteArrayResource> generate(@RequestBody FlutterAppForm formData) {
        String zipPath = flutterAppService.generateFlutterApp(formData);

        try {
            File file = new File(zipPath);
            byte[] zipBytes = Files.readAllBytes(file.toPath());

            ByteArrayResource resource = new ByteArrayResource(zipBytes);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDisposition(ContentDisposition.attachment().filename("wedding_app.zip").build());

            return new ResponseEntity<>(resource, headers, HttpStatus.OK);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
