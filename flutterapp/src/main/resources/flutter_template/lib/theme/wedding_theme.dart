import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/wedding_config.dart';

/// Builds a [ThemeData] from a couple's [WeddingConfig].
/// Called at app level so every screen automatically reflects
/// the couple's chosen colors and fonts.
class WeddingTheme {
  WeddingTheme._();

  /// Builds a fully dynamic theme from the couple's config.
  static ThemeData buildFrom(WeddingConfig config) {
    final primaryColor = config.primaryColor;
    final textTheme = _textThemeFor(config.selectedFont);

    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: const Color(0xFFF7F5F1),
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryColor,
        brightness: Brightness.light,
      ),
      textTheme: textTheme,
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: textTheme.titleLarge?.copyWith(
          color: Colors.white,
          fontSize: 18,
          letterSpacing: 2,
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Colors.black,
        selectedItemColor: Colors.white,
        unselectedItemColor: Colors.white54,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.black,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 24),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }

  /// Fallback theme used before any wedding is loaded.
  static ThemeData defaultTheme() {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: const Color(0xFFF7F5F1),
      colorScheme: ColorScheme.fromSeed(seedColor: Colors.pinkAccent),
      textTheme: GoogleFonts.playfairDisplayTextTheme(),
    );
  }

  /// Maps the couple's font preference to a Google Fonts text theme.
  static TextTheme _textThemeFor(String font) {
    switch (font.toLowerCase()) {
      case 'sans':
        return GoogleFonts.latoTextTheme();
      case 'script':
        return GoogleFonts.dancingScriptTextTheme();
      case 'serif':
      default:
        return GoogleFonts.playfairDisplayTextTheme();
    }
  }
}
