import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter_template/common/layout/layout.dart';
import 'package:flutter_template/providers/wedding_config_provider.dart';

class RegistryScreen extends StatelessWidget {
  const RegistryScreen({super.key});

  void _launchURL(String url) async {
    final uri = Uri.tryParse(url);
    if (uri != null && await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      debugPrint("Could not launch $url");
    }
  }

  @override
  Widget build(BuildContext context) {
    final config = context.watch<WeddingConfigProvider>().config;
    final registries = config?.registries ?? const [];

    return Layout(
      title: "Registry",
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 24),
        child: registries.isEmpty
            ? Center(
                child: Text(
                  "No registry links added yet.",
                  style: GoogleFonts.merriweather(fontSize: 15, color: Colors.black54),
                ),
              )
            : ListView.builder(
                itemCount: registries.length,
                itemBuilder: (context, index) {
                  final entry = registries[index];
                  return Card(
                    margin: const EdgeInsets.symmetric(vertical: 8),
                    color: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: ListTile(
                      title: Text(
                        entry.label,
                        style: GoogleFonts.merriweather(fontWeight: FontWeight.bold),
                      ),
                      subtitle: Text(
                        entry.url,
                        style: const TextStyle(color: Colors.blue),
                      ),
                      trailing: const Icon(Icons.open_in_new),
                      onTap: () => _launchURL(entry.url),
                    ),
                  );
                },
              ),
      ),
    );
  }
}
