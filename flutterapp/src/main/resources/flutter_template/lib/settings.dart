import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_template/main.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  static const configuredPassword = '{{APP_PASSWORD}}';

  bool get passwordRequired =>
      configuredPassword.isNotEmpty &&
      configuredPassword != '{{APP_PASSWORD}}';

  Future<void> _lockApp(BuildContext context) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => const AuthGate()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F5F1),
      appBar: AppBar(
        title: Text(
          'Settings',
          style: GoogleFonts.playfairDisplay(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 22,
          ),
        ),
        backgroundColor: Colors.black,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (passwordRequired) ...[
              ElevatedButton.icon(
                onPressed: () => _lockApp(context),
                icon: const Icon(Icons.lock),
                label: Text(
                  'Lock App (Require Re-authentication)',
                  style: GoogleFonts.playfairDisplay(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
              const SizedBox(height: 32),
            ],

            // FAQ Accordion
            ExpansionTile(
              title: Text(
                'FAQs',
                style: GoogleFonts.playfairDisplay(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ),
              children: [
                ListTile(
                  title: Text(
                    'Q: How do I RSVP?\nA: Tap on the RSVP button from the home screen and follow the prompts.',
                    style: GoogleFonts.playfairDisplay(fontSize: 16),
                  ),
                ),
                ListTile(
                  title: Text(
                    'Q: Who do I contact for issues?\nA: See the contact section below.',
                    style: GoogleFonts.playfairDisplay(fontSize: 16),
                  ),
                ),
              ],
            ),

            const Divider(thickness: 1.0),

            // Contact Info Accordion
            ExpansionTile(
              title: Text(
                'Contact Information',
                style: GoogleFonts.playfairDisplay(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ),
              children: [
                ListTile(
                  title: Text(
                    'Neeraj: neeraj@example.com\nJinal: jinal@example.com',
                    style: GoogleFonts.playfairDisplay(fontSize: 16),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
