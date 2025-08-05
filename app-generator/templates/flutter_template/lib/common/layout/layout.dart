import 'package:flutter/material.dart';
import 'package:weddesigner/ui/settings.dart';
import 'package:weddesigner/ui/itinerary.dart';
import 'package:weddesigner/ui/our_family.dart';
import 'package:weddesigner/ui/photo_gallery.dart';
import 'package:weddesigner/ui/couple_home_screen.dart';

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
    final data = weddingData;

    return Scaffold(
      resizeToAvoidBottomInset: false,
      body: Stack(
        children: [
          Padding(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).viewInsets.bottom,
            ),
            child: body,
          ),
        ],
      ),
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
            if (data?['enableWeddingParty'] == true)
              IconButton(
                icon: const Icon(Icons.people, color: Colors.white),
                onPressed: () {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (_) => Layout(
                        title: 'Our Family',
                        body: OurFamilyScreen(weddingData: data ?? {}),
                        weddingData: data,
                      ),
                    ),
                  );
                },
              ),
            if (data?['enableGallery'] == true)
              IconButton(
                icon: const Icon(Icons.photo_library, color: Colors.white),
                onPressed: () {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (_) => Layout(
                        title: 'Gallery',
                        body: DriveGalleryScreen(weddingData: data ?? {}),
                        weddingData: data,
                      ),
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
                    builder: (_) => Layout(
                      title: 'Itinerary',
                      body: ItineraryScreen(weddingData: data ?? {}),
                      weddingData: data,
                    ),
                  ),
                );
              },
            ),
            IconButton(
              icon: const Icon(Icons.settings, color: Colors.white),
              onPressed: () {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(
                    builder: (_) => Layout(
                      title: 'Settings',
                      body: SettingsScreen(weddingData: data ?? {}),
                      weddingData: data,
                    ),
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
