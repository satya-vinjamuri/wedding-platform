package com.example.flutterapp.dto;

public class EventDetails {
    public String name;
    public String location;
    public String date;
    public String time;
    public String dressCode;

    // Optional: Add constructors, getters, and setters if needed
    public EventDetails() {
    }

    public EventDetails(String name, String location, String date, String time, String dressCode) {
        this.name = name;
        this.location = location;
        this.date = date;
        this.time = time;
        this.dressCode = dressCode;
    }
}
