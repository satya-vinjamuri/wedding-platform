package com.example.flutterapp.dto;

import java.util.List;
import java.util.Map;

public class FlutterAppForm {
    public String brideName;
    public String groomName;
    public String weddingDate;
    public String weddingLocation;
    public String appPassword;
    public String selectedColor;
    public String selectedFont;
    public boolean enableRSVPNotification;
    public boolean enableEventNotification;
    public boolean enablePlannerUpdates;
    public boolean enableFamily;
    public boolean enableGallery;
    public boolean enableItinerary;
    public boolean enableSettings;
    public String rsvpSheetUrl;
    public String galleryDriveUrl;

    public List<Map<String, String>> brideEvents;
    public List<Map<String, String>> groomEvents;
    public List<Map<String, String>> weddingEvents;
    public Map<String, List<Map<String, String>>> familyDetails;
    public Map<String, List<Map<String, String>>> weddingParty;
    public List<Map<String, String>> registries;

    public Boolean getToggle(String key) {
        switch (key) {
            case "enableFamily":
                return enableFamily;
            case "enableGallery":
                return enableGallery;
            case "enableItinerary":
                return enableItinerary;
            case "enableSettings":
                return enableSettings;
            default:
                return false;
        }
    }

}
