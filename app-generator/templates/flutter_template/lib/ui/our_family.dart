import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class OurFamilyScreen extends StatelessWidget {
  final Map<String, dynamic> weddingData;

  const OurFamilyScreen({Key? key, required this.weddingData}) : super(key: key);

  Widget _buildMemberCard(String name, String role, String? imageUrl) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(50),
          child: ColorFiltered(
            colorFilter: const ColorFilter.mode(Colors.grey, BlendMode.saturation),
            child: imageUrl != null && imageUrl.isNotEmpty
                ? Image.network(
                    imageUrl,
                    width: 100,
                    height: 100,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      width: 100,
                      height: 100,
                      color: Colors.grey[300],
                      child: const Icon(Icons.person, size: 50, color: Colors.white),
                      alignment: Alignment.center,
                    ),
                  )
                : Container(
                    width: 100,
                    height: 100,
                    color: Colors.grey[300],
                    child: const Icon(Icons.person, size: 50, color: Colors.white),
                    alignment: Alignment.center,
                  ),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          name,
          style: GoogleFonts.montserrat(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 4),
        Text(
          role,
          style: GoogleFonts.merriweather(
            fontSize: 12,
            color: Colors.white70,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildTwoColumnLayout(List<dynamic> brideSide, List<dynamic> groomSide) {
    int maxLength = brideSide.length > groomSide.length ? brideSide.length : groomSide.length;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              "Bride's Side",
              style: GoogleFonts.montserrat(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            Text(
              "Groom's Side",
              style: GoogleFonts.montserrat(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),
        Column(
          children: List.generate(maxLength, (index) {
            final bride = index < brideSide.length ? brideSide[index] : null;
            final groom = index < groomSide.length ? groomSide[index] : null;

            return Padding(
              padding: const EdgeInsets.only(bottom: 32),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: bride != null
                        ? _buildMemberCard(
                            bride['name'] ?? '',
                            bride['role'] ?? '',
                            bride['imageUrl'],
                          )
                        : const SizedBox(),
                  ),
                  const SizedBox(width: 20),
                  Expanded(
                    child: groom != null
                        ? _buildMemberCard(
                            groom['name'] ?? '',
                            groom['role'] ?? '',
                            groom['imageUrl'],
                          )
                        : const SizedBox(),
                  ),
                ],
              ),
            );
          }),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final weddingParty = weddingData['weddingParty'] ?? {};
    final brideSide = weddingParty['bride'] ?? [];
    final groomSide = weddingParty['groom'] ?? [];

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 75),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // "App bar" title
          Padding(
            padding: const EdgeInsets.only(bottom: 24),
            child: Center(
              child: Text(
                'Our Family',
                style: GoogleFonts.montserrat(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ),

          // Two-column layout
          _buildTwoColumnLayout(brideSide, groomSide),
        ],
      ),
    );
  }
}
