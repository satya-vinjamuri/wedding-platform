import 'package:flutter/material.dart';
import 'package:weddesigner/settings.dart';
import 'package:weddesigner/itinerary.dart';
import 'package:weddesigner/our_family.dart';
import 'package:weddesigner/photo_gallery.dart';
import 'package:weddesigner/couple_home_screen.dart';

class Layout extends StatelessWidget {
  final String title;
  final Widget body;
  final Map<String, dynamic>? weddingData;

  const Layout({
    super.key,
    required this.title,
    required this.body,
    this.weddingData,
  });

  @override
  Widget build(BuildContext context) {
    final Map<String, dynamic>? data = weddingData; // safe alias

    return Scaffold(
      resizeToAvoidBottomInset: false,
      body: Stack(
        children: [
          // Background Image
          // Overlay
          // Main Content
          Padding(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).viewInsets.bottom,
            ),
            child: body,
          ),
        ],
      ),
      // Bottom Navigation Bar
    bottomNavigationBar: Container(
          color: Colors.black,
          padding: const EdgeInsets.symmetric(vertical: 10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              IconButton(
                icon: const Icon(Icons.home, color: Colors.white),
                onPressed: () {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (_) => CoupleHomeScreen(weddingData: data ?? {}),
                    ),
                  );
                },
              ),
              if (data != null && data.containsKey('enableWeddingParty') && data['enableWeddingParty'] == true)
              IconButton(
                icon: const Icon(Icons.people, color: Colors.white),
                onPressed: () {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (_) => OurFamilyScreen(weddingData: data ?? {}),
                    ),
                  );
                },
              ),

              // ✅ Visibility check now uses `data` safely
              if (data != null && data.containsKey('enableGallery') && data['enableGallery'] == true)
                IconButton(
                  icon: const Icon(Icons.photo_library, color: Colors.white),
                  onPressed: () {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                        builder: (_) => DriveGalleryScreen(weddingData: data),
                      ),
                    );
                  },
                ),

              IconButton(
                icon: const Icon(Icons.calendar_today, color: Colors.white),
                onPressed: () {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (_) => ItineraryScreen(weddingData: data ?? {}),
                    ),
                  );
                },
              ),
              IconButton(
                icon: const Icon(Icons.settings, color: Colors.white),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => SettingsScreen(weddingData: data ?? {}),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      );
    }
}
