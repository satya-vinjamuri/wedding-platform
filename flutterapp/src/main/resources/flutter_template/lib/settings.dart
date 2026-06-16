import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_template/main.dart';
import 'package:flutter_template/providers/wedding_config_provider.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  Future<void> _lockApp(BuildContext context) async {
    // Clear wedding session — returns user to the entry screen via AppShell
    await context.read<WeddingConfigProvider>().clearWedding();
  }

  @override
  Widget build(BuildContext context) {
    final config = context.watch<WeddingConfigProvider>().config;
    final passwordRequired = config?.enablePassword ?? false;
    final faqs = config?.faqs ?? const [];
    final contacts = config?.contactInfo ?? const [];

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
            if (faqs.isNotEmpty) ...[
              ExpansionTile(
                title: Text(
                  'FAQs',
                  style: GoogleFonts.playfairDisplay(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                ),
                children: faqs
                    .map(
                      (faq) => ListTile(
                        title: Text(
                          'Q: ${faq.question}\nA: ${faq.answer}',
                          style: GoogleFonts.playfairDisplay(fontSize: 16),
                        ),
                      ),
                    )
                    .toList(),
              ),
              const Divider(thickness: 1.0),
            ],

            // Contact Info Accordion
            if (contacts.isNotEmpty)
              ExpansionTile(
                title: Text(
                  'Contact Information',
                  style: GoogleFonts.playfairDisplay(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                ),
                children: contacts
                    .map(
                      (contact) => ListTile(
                        title: Text(
                          contact.name,
                          style: GoogleFonts.playfairDisplay(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        subtitle: Text(
                          [contact.email, contact.phone]
                              .where((s) => s.isNotEmpty)
                              .join(' · '),
                          style: GoogleFonts.merriweather(fontSize: 14),
                        ),
                      ),
                    )
                    .toList(),
              ),

            if (faqs.isEmpty && contacts.isEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 16),
                child: Text(
                  'No FAQs or contact info have been added yet.',
                  style: GoogleFonts.merriweather(fontSize: 15, color: Colors.black54),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
