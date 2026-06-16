import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_template/common/layout/layout.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_template/models/wedding_event.dart';
import 'package:flutter_template/providers/wedding_config_provider.dart';

class ItineraryScreen extends StatelessWidget {
  const ItineraryScreen({super.key});

  Widget _buildEventCard(WeddingEvent event) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              event.title,
              style: GoogleFonts.playfairDisplay(
                fontSize: 17,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            if (event.date.isNotEmpty || event.time.isNotEmpty)
              Text(
                [event.date, event.time].where((s) => s.isNotEmpty).join(' · '),
                style: GoogleFonts.merriweather(fontSize: 14, color: Colors.black87),
              ),
            if (event.location.isNotEmpty)
              Text(
                event.location,
                style: GoogleFonts.merriweather(fontSize: 14, color: Colors.black54),
              ),
            if (event.dresscode.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  'Dress code: ${event.dresscode}',
                  style: GoogleFonts.merriweather(
                    fontSize: 13,
                    fontStyle: FontStyle.italic,
                    color: Colors.black54,
                  ),
                ),
              ),
            if (event.description.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text(
                  event.description,
                  style: GoogleFonts.merriweather(fontSize: 14),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(String label, List<WeddingEvent> events) {
    if (events.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: GoogleFonts.playfairDisplay(
              fontSize: 20,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          ...events.map(_buildEventCard),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final config = context.watch<WeddingConfigProvider>().config;
    final brideEvents = config?.brideEvents ?? const [];
    final groomEvents = config?.groomEvents ?? const [];
    final weddingEvents = config?.weddingEvents ?? const [];
    final hasAnyEvents =
        brideEvents.isNotEmpty || groomEvents.isNotEmpty || weddingEvents.isNotEmpty;

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
        body: hasAnyEvents
            ? SingleChildScrollView(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildSection('Wedding Events', weddingEvents),
                    _buildSection('Bride Events', brideEvents),
                    _buildSection('Groom Events', groomEvents),
                  ],
                ),
              )
            : Center(
                child: Text(
                  'No itinerary has been added yet.',
                  style: GoogleFonts.merriweather(fontSize: 15, color: Colors.black54),
                ),
              ),
      ),
    );
  }
}
