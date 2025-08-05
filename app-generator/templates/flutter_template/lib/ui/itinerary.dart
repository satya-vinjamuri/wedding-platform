import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

class ItineraryScreen extends StatelessWidget {
  final Map<String, dynamic> weddingData;

  const ItineraryScreen({Key? key, required this.weddingData}) : super(key: key);

  Widget _buildEventList(List<dynamic> events) {
    if (events.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Text(
          "No events available.",
          style: GoogleFonts.merriweather(color: Colors.white60, fontSize: 14),
        ),
      );
    }

    return Column(
      children: events.map((event) {
        final name = event['name'] ?? '';
        final date = event['date'] ?? '';
        final start = event['startTime'] ?? '';
        final end = event['endTime'] ?? '';
        final location = event['location'] ?? '';

        return Container(
          margin: const EdgeInsets.symmetric(vertical: 8),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.1),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white24),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                name,
                style: GoogleFonts.montserrat(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  const Icon(Icons.calendar_today, size: 14, color: Colors.white60),
                  const SizedBox(width: 6),
                  Text(
                    '$date at $start',
                    style: GoogleFonts.merriweather(fontSize: 13, color: Colors.white70),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  const Icon(Icons.location_on, size: 14, color: Colors.white60),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      location,
                      style: GoogleFonts.merriweather(fontSize: 13, color: Colors.white70),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final brideEvents = weddingData['brideEvents'] ?? [];
    final groomEvents = weddingData['groomEvents'] ?? [];
    final weddingEvents = weddingData['weddingEvents'] ?? [];

    return Container(
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 100),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Page Header
            Center(
              child: Padding(
                padding: const EdgeInsets.only(bottom: 24),
                child: Text(
                  'Wedding Itinerary',
                  style: GoogleFonts.montserrat(
                    fontSize: 26,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ),

            // Bride Events (only if not empty)
            if (brideEvents.isNotEmpty) ...[
              Text(
                'Bride Events',
                style: GoogleFonts.montserrat(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              _buildEventList(brideEvents),
              const SizedBox(height: 24),
            ],

            // Groom Events
            if (groomEvents.isNotEmpty) ...[
              Text(
                'Groom Events',
                style: GoogleFonts.montserrat(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              _buildEventList(groomEvents),
              const SizedBox(height: 24),
            ],

            // Wedding Events
            if (weddingEvents.isNotEmpty) ...[
              Text(
                'Wedding Events',
                style: GoogleFonts.montserrat(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              _buildEventList(weddingEvents),
            ],
          ],
        ),
      ),
    );
  }

}
