import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_template/common/layout/layout.dart';
import 'package:flutter_template/models/party_member.dart';
import 'package:flutter_template/providers/wedding_config_provider.dart';

class OurFamilyScreen extends StatelessWidget {
  const OurFamilyScreen({super.key});

  Widget _buildMemberCard(FamilyMember member) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        children: [
          ClipOval(
            child: member.imageUrl.isNotEmpty
                ? CachedNetworkImage(
                    imageUrl: member.imageUrl,
                    width: 120,
                    height: 120,
                    fit: BoxFit.cover,
                    placeholder: (context, url) => const SizedBox(
                      width: 120,
                      height: 120,
                      child: Center(child: CircularProgressIndicator()),
                    ),
                    errorWidget: (context, url, error) => const Icon(
                      Icons.person,
                      size: 80,
                      color: Colors.grey,
                    ),
                  )
                : Container(
                    width: 120,
                    height: 120,
                    color: Colors.grey[300],
                    child: const Icon(Icons.person, size: 60, color: Colors.white),
                  ),
          ),
          const SizedBox(height: 8),
          Text(
            member.name,
            style: GoogleFonts.playfairDisplay(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black,
            ),
            textAlign: TextAlign.center,
          ),
          if (member.description.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              member.description,
              style: GoogleFonts.merriweather(fontSize: 14, color: Colors.black87),
              textAlign: TextAlign.center,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSection(String label, List<FamilyMember> members) {
    if (members.isEmpty) return const SizedBox.shrink();
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
          const SizedBox(height: 12),
          Wrap(
            spacing: 16,
            runSpacing: 8,
            alignment: WrapAlignment.center,
            children: members.map(_buildMemberCard).toList(),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final config = context.watch<WeddingConfigProvider>().config;
    final brideSideFamily = config?.brideSideFamily ?? const [];
    final groomSideFamily = config?.groomSideFamily ?? const [];
    final pets = config?.pets ?? const [];
    final hasAnyFamily =
        brideSideFamily.isNotEmpty || groomSideFamily.isNotEmpty || pets.isNotEmpty;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Our Family',
          style: GoogleFonts.playfairDisplay(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 22,
          ),
        ),
        backgroundColor: Colors.black,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Layout(
        title: '',
        body: hasAnyFamily
            ? SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildSection("Bride's Family", brideSideFamily),
                    _buildSection("Groom's Family", groomSideFamily),
                    _buildSection('Pets', pets),
                  ],
                ),
              )
            : Center(
                child: Text(
                  'No family members have been added yet.',
                  style: GoogleFonts.merriweather(fontSize: 15, color: Colors.black54),
                ),
              ),
      ),
    );
  }
}
