import 'package:flutter/material.dart';
import 'package:flutter_template/common/layout/layout.dart';
import 'package:google_fonts/google_fonts.dart';

class ItineraryScreen extends StatelessWidget {
  const ItineraryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F5F1),
      appBar: AppBar(
        backgroundColor: Colors.black,
        iconTheme: const IconThemeData(color: Colors.white),
        title: Text(
          'Wedding Itinerary',
          style: GoogleFonts.playfairDisplay(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 20,
          ),
        ),
      ),
      body: Layout(
        title: '',
        body: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Bride Events',
                style: GoogleFonts.playfairDisplay(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              // BRIDE_EVENTS_START
              // BRIDE_EVENTS_END

              const SizedBox(height: 24),
              Text(
                'Groom Events',
                style: GoogleFonts.playfairDisplay(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              // GROOM_EVENTS_START
              // GROOM_EVENTS_END

              const SizedBox(height: 24),
              Text(
                'Wedding Events',
                style: GoogleFonts.playfairDisplay(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              // WEDDING_EVENTS_START
              // WEDDING_EVENTS_END
            ],
          ),
        ),
      ),
    );
  }
}
