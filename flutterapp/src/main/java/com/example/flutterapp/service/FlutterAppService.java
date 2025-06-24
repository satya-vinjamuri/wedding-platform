package com.example.flutterapp.service;

import com.example.flutterapp.dto.FlutterAppForm;
import org.apache.commons.io.FileUtils;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import java.util.stream.Collectors;

@Service
public class FlutterAppService {

    private static final Path TEMPLATE_PATH = Paths.get("src/main/resources/flutter_template");
    private static final Path OUTPUT_DIR = Paths.get("generated_apps");

    public String generateFlutterApp(FlutterAppForm formData) {
        String appId = UUID.randomUUID().toString();
        Path appPath = OUTPUT_DIR.resolve(appId);

        try {
            FileUtils.copyDirectory(TEMPLATE_PATH.toFile(), appPath.toFile(),
                    pathname -> !pathname.getName().equals("widget_test.dart"));

            // main.dart
            Path mainPath = appPath.resolve("lib/main.dart");
            String mainContent = new String(Files.readAllBytes(mainPath));
            mainContent = mainContent
                    .replace("{{BRIDE_NAME}}", formData.brideName)
                    .replace("{{GROOM_NAME}}", formData.groomName)
                    .replace("{{WEDDING_DATE}}", formData.weddingDate)
                    .replace("{{WEDDING_LOCATION}}", Optional.ofNullable(formData.weddingLocation).orElse(""))
                    .replace("{{APP_PASSWORD}}", Optional.ofNullable(formData.appPassword).orElse(""))
                    .replace("{{SELECTED_COLOR}}", Optional.ofNullable(formData.selectedColor).orElse("#B0848B"))
                    .replace("{{SELECTED_FONT}}", Optional.ofNullable(formData.selectedFont).orElse("Sans"))
                    .replace("{{ENABLE_RSVP_NOTIFICATION}}", String.valueOf(formData.enableRSVPNotification))
                    .replace("{{ENABLE_EVENT_NOTIFICATION}}", String.valueOf(formData.enableEventNotification))
                    .replace("{{ENABLE_PLANNER_UPDATES}}", String.valueOf(formData.enablePlannerUpdates));
            Files.write(mainPath, mainContent.getBytes());

            // itinerary.dart
            Path itineraryPath = appPath.resolve("lib/itinerary.dart");
            String itineraryContent = new String(Files.readAllBytes(itineraryPath));
            itineraryContent = injectEventSection(itineraryContent, "Bride Events", "BRIDE_EVENTS",
                    formData.brideEvents);
            itineraryContent = injectEventSection(itineraryContent, "Groom Events", "GROOM_EVENTS",
                    formData.groomEvents);
            itineraryContent = injectEventSection(itineraryContent, "Wedding Events", "WEDDING_EVENTS",
                    formData.weddingEvents);
            itineraryContent = itineraryContent
                    .replace("{{WEDDING_DATE}}", formData.weddingDate)
                    .replace("{{WEDDING_LOCATION}}", Optional.ofNullable(formData.weddingLocation).orElse(""));
            Files.write(itineraryPath, itineraryContent.getBytes());

            // our_family.dart
            Path familyPath = appPath.resolve("lib/our_family.dart");
            String familyContent = new String(Files.readAllBytes(familyPath));
            familyContent = injectMemberCards(familyContent, "BRIDE_SIDE", formData.familyDetails.get("bride"));
            familyContent = injectMemberCards(familyContent, "GROOM_SIDE", formData.familyDetails.get("groom"));
            familyContent = injectMemberCards(familyContent, "PET_SIDE", formData.familyDetails.get("pets"));
            Files.write(familyPath, familyContent.getBytes());

            // wedding_party.dart
            Path partyPath = appPath.resolve("lib/wedding_party.dart");
            String partyContent = new String(Files.readAllBytes(partyPath));
            partyContent = injectPartyCards(partyContent, "BRIDAL_PARTY", formData.weddingParty.get("bride"));
            partyContent = injectPartyCards(partyContent, "GROOM_PARTY", formData.weddingParty.get("groom"));
            Files.write(partyPath, partyContent.getBytes());

            // layout.dart
            Path layoutPath = appPath.resolve("lib/common/layout/layout.dart");
            String layoutContent = new String(Files.readAllBytes(layoutPath));
            Map<String, String[]> toggles = Map.of(
                    "enableFamily", new String[] { "our_family.dart", "OurFamilyScreen()" },
                    "enableGallery", new String[] { "photo_gallery.dart", "DriveGalleryScreen()" },
                    "enableItinerary", new String[] { "itinerary.dart", "ItineraryScreen()" },
                    "enableSettings", new String[] { "settings.dart", "SettingsScreen()" });
            for (var entry : toggles.entrySet()) {
                if (!Boolean.TRUE.equals(formData.getToggle(entry.getKey()))) {
                    // Comment out the import line
                    layoutContent = layoutContent.replaceAll(
                            "(?m)^import 'package:flutter_template/" + Pattern.quote(entry.getValue()[0]) + "';",
                            "// import 'package:flutter_template/" + entry.getValue()[0] + "';");

                    // Comment out IconButton widgets
                    String regex = "IconButton\\([^)]*" + Pattern.quote(entry.getValue()[1]) + "[^)]*\\)";
                    Pattern pattern = Pattern.compile(regex, Pattern.DOTALL);
                    Matcher matcher = pattern.matcher(layoutContent);
                    StringBuffer sb = new StringBuffer();

                    while (matcher.find()) {
                        String commented = Arrays.stream(matcher.group().split("\n"))
                                .map(line -> "// " + line)
                                .collect(Collectors.joining("\n"));
                        matcher.appendReplacement(sb, Matcher.quoteReplacement(commented));
                    }
                    matcher.appendTail(sb);
                    layoutContent = sb.toString();
                }
            }

            Files.write(layoutPath, layoutContent.getBytes());

            // registry.dart
            Path registryPath = appPath.resolve("lib/registry.dart");
            String registryContent = new String(Files.readAllBytes(registryPath));
            registryContent = injectRegistryCards(registryContent, "REGISTRY_LIST", formData.registries);
            Files.write(registryPath, registryContent.getBytes());

            // rsvpForm.dart
            String sheetId = extractIdFromUrl(formData.rsvpSheetUrl, "/d/([a-zA-Z0-9-_]+)");
            Path rsvpPath = appPath.resolve("lib/rsvpForm.dart");
            String rsvpContent = new String(Files.readAllBytes(rsvpPath)).replace("{{SHEET_ID}}", sheetId);
            Files.write(rsvpPath, rsvpContent.getBytes());

            // photo_gallery.dart
            String driveFolderId = extractIdFromUrl(formData.galleryDriveUrl, "/folders/([a-zA-Z0-9-_]+)");
            Path galleryPath = appPath.resolve("lib/photo_gallery.dart");
            String galleryContent = new String(Files.readAllBytes(galleryPath)).replace("{{DRIVE_FOLDER_ID}}",
                    driveFolderId);
            Files.write(galleryPath, galleryContent.getBytes());

            // zip
            Path zipPath = OUTPUT_DIR.resolve(appId + ".zip");
            zipDirectory(appPath, zipPath);
            FileUtils.deleteDirectory(appPath.toFile());
            return zipPath.toString();

        } catch (IOException e) {
            throw new RuntimeException("Error generating Flutter app", e);
        }
    }

    private String injectEventSection(String content, String label, String marker, List<Map<String, String>> events) {
        if (events == null || events.isEmpty())
            return content.replaceAll("\\s*Text\\([^)]*" + label + "[^)]*\\)[\\s\\S]*?// " + marker + "_END\\s*", "");
        String widgets = events.stream()
                .map(e -> String.format("""
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('• %s', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                            Text('Location: %s', style: TextStyle(fontSize: 15)),
                            Text('Date: %s • Time: %s', style: TextStyle(fontSize: 15)),
                            Text('Dress Code: %s', style: TextStyle(fontSize: 15, fontStyle: FontStyle.italic)),
                            SizedBox(height: 12),
                          ],
                        ),""", e.getOrDefault("name", ""), e.getOrDefault("location", ""), e.getOrDefault("date", ""),
                        e.getOrDefault("time", ""), e.getOrDefault("dressCode", "")))
                .collect(Collectors.joining("\n\n"));
        return content.replaceAll("// " + marker + "_START[\\s\\S]*?// " + marker + "_END",
                "// " + marker + "_START\n" + widgets + "\n// " + marker + "_END");
    }

    private String injectMemberCards(String content, String marker, List<Map<String, String>> members) {
        String widgets = members.stream().map(m -> String.format("""
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  child: _buildMemberCard('%s', '%s', '%s'),
                ),""",
                escapeDart(m.get("name")),
                escapeDart(Optional.ofNullable(m.get("relation")).orElse(m.get("description"))),
                Optional.ofNullable(m.get("image")).orElse("assets/placeholder.jpg")))
                .collect(Collectors.joining("\n"));
        return content.replaceAll("// " + marker + "_START[\\s\\S]*?// " + marker + "_END",
                "// " + marker + "_START\n" + widgets + "\n// " + marker + "_END");
    }

    private String injectPartyCards(String content, String marker, List<Map<String, String>> members) {
        String widgets = members.stream().map(m -> String.format("""
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  child: _buildMemberCard('%s', '%s', '%s', '%s'),
                ),""",
                escapeDart(m.get("name")),
                escapeDart(m.get("role")),
                escapeDart(m.get("relation")),
                Optional.ofNullable(m.get("image")).orElse("assets/placeholder.jpg")))
                .collect(Collectors.joining("\n"));
        return content.replaceAll("// " + marker + "_START[\\s\\S]*?// " + marker + "_END",
                "// " + marker + "_START\n" + widgets + "\n// " + marker + "_END");
    }

    private String injectRegistryCards(String content, String marker, List<Map<String, String>> registries) {
        String widgets = registries.stream().map(r -> String.format("""
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  child: _buildRegistryCard('%s', '%s'),
                ),""",
                escapeDart(r.get("label")),
                escapeDart(r.get("url")))).collect(Collectors.joining("\n"));
        return content.replaceAll("// " + marker + "_START[\\s\\S]*?// " + marker + "_END",
                "// " + marker + "_START\n" + widgets + "\n// " + marker + "_END");
    }

    private String escapeDart(String input) {
        return input == null ? "" : input.replace("'", "\\'");
    }

    private String extractIdFromUrl(String url, String regex) {
        if (url == null)
            return "";
        Matcher matcher = Pattern.compile(regex).matcher(url);
        return matcher.find() ? matcher.group(1) : "";
    }

    private void zipDirectory(Path sourceDir, Path zipFilePath) throws IOException {
        try (ZipOutputStream zs = new ZipOutputStream(Files.newOutputStream(zipFilePath))) {
            Files.walk(sourceDir)
                    .filter(path -> !Files.isDirectory(path))
                    .forEach(path -> {
                        ZipEntry zipEntry = new ZipEntry(sourceDir.relativize(path).toString());
                        try {
                            zs.putNextEntry(zipEntry);
                            Files.copy(path, zs);
                            zs.closeEntry();
                        } catch (IOException e) {
                            throw new UncheckedIOException(e);
                        }
                    });
        }
    }
}
