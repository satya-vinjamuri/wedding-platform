package com.example.flutterapp.controller;

import org.springframework.web.bind.annotation.RestController;

// DEPRECATED — this Spring Boot service's only job was generating a unique
// per-couple Flutter ZIP (POST /api/generate-app) under the old
// compile-per-couple architecture. The Flutter app now reads WeddingConfig
// from Firestore at runtime instead, so this whole backend is dead.
// See REFACTOR_ROADMAP.md Phase 7.
//
// NOTE: src/main/resources/flutter_template/ is NOT dead — that directory
// is the actual Flutter app source and should be treated as its own
// standalone Flutter project, not as a resource of this Spring Boot app.
// This service (controller/service/dto/config, build.gradle, etc.) is safe
// to delete once the Flutter app has been extracted into its own repo/dir.
@RestController
public class FlutterAppController {
}
