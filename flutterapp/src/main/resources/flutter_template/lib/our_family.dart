import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_template/common/layout/layout.dart';

class OurFamilyScreen extends StatelessWidget {
  const OurFamilyScreen({super.key});

  Widget _buildMemberCard(String name, String description, String imagePath) {
    return Column(
      children: [
        ClipOval(
          child: ColorFiltered(
            colorFilter:
                const ColorFilter.mode(Colors.grey, BlendMode.saturation),
            child: Image.asset(
              imagePath,
              width: 120,
              height: 120,
              fit: BoxFit.cover,
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          name,
          style: GoogleFonts.playfairDisplay(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.black,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 4),
        Text(
          description,
          style: GoogleFonts.merriweather(
            fontSize: 14,
            color: Colors.black87,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
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
        body: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // BRIDE_SIDE_START
              // BRIDE_SIDE_END

              const SizedBox(height: 24),

              // GROOM_SIDE_START
              // GROOM_SIDE_END

              const SizedBox(height: 24),

              // PET_SIDE_START
              // PET_SIDE_END
            ],
          ),
        ),
      ),
    );
  }
}
