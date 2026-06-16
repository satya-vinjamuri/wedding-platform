import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'wedding_event.dart';
import 'party_member.dart';
import 'registry_item.dart';

/// The single source of truth for a wedding's configuration.
/// Fetched from Firestore at runtime — no placeholders, no code generation.
///
/// Mirrors the `weddingApps/{slug}` Firestore document structure.
class WeddingConfig {
  // ── Identity ─────────────────────────────────────────────────────────────
  final String websiteSlug;
  final String appName;
  final String brideName;
  final String groomName;
  final String weddingDate; // ISO string e.g. "2026-11-15T16:00:00"
  final String weddingLocation;

  // ── Theming ───────────────────────────────────────────────────────────────
  final String selectedColor;     // hex string e.g. "#B0848B"
  final String selectedFont;      // "Serif" | "Sans" | "Script"
  final String selectedFontColor; // hex string
  final String backgroundImageUrl;

  // ── Feature flags ─────────────────────────────────────────────────────────
  final bool enableRSVP;
  final bool enableGallery;
  final bool enableItinerary;
  final bool enableWeddingParty;
  final bool enableOurStory;
  final bool enableRegistry;
  final bool enableTravel;
  final bool enableSettings;

  // ── Authentication ────────────────────────────────────────────────────────
  final bool enablePassword;
  final String appPassword;
  final bool enableAdminPassword;
  final String adminAppPassword;

  // ── RSVP ─────────────────────────────────────────────────────────────────
  final String rsvpSheetUrl;
  final String rsvpDeadline;

  // ── Gallery ───────────────────────────────────────────────────────────────
  final String galleryDriveUrl;

  // ── Content ───────────────────────────────────────────────────────────────
  final List<WeddingEvent> weddingEvents;
  final List<WeddingEvent> brideEvents;
  final List<WeddingEvent> groomEvents;

  final List<PartyMember> bridalParty;
  final List<PartyMember> groomParty;

  final List<FamilyMember> brideSideFamily;
  final List<FamilyMember> groomSideFamily;
  final List<FamilyMember> pets;

  final List<FaqItem> faqs;
  final List<ContactInfo> contactInfo;
  final List<RegistryItem> registries;

  // ── Travel / Accommodations ───────────────────────────────────────────────
  final String hotelName;
  final String hotelUrl;
  final String venueAddress;

  // ── Notifications ─────────────────────────────────────────────────────────
  final bool enableRSVPNotification;
  final bool enableEventNotification;
  final bool enablePlannerUpdates;

  // ── Status ────────────────────────────────────────────────────────────────
  final bool isPublished;

  const WeddingConfig({
    required this.websiteSlug,
    required this.appName,
    required this.brideName,
    required this.groomName,
    required this.weddingDate,
    required this.weddingLocation,
    required this.selectedColor,
    required this.selectedFont,
    required this.selectedFontColor,
    required this.backgroundImageUrl,
    required this.enableRSVP,
    required this.enableGallery,
    required this.enableItinerary,
    required this.enableWeddingParty,
    required this.enableOurStory,
    required this.enableRegistry,
    required this.enableTravel,
    required this.enableSettings,
    required this.enablePassword,
    required this.appPassword,
    required this.enableAdminPassword,
    required this.adminAppPassword,
    required this.rsvpSheetUrl,
    required this.rsvpDeadline,
    required this.galleryDriveUrl,
    required this.weddingEvents,
    required this.brideEvents,
    required this.groomEvents,
    required this.bridalParty,
    required this.groomParty,
    required this.brideSideFamily,
    required this.groomSideFamily,
    required this.pets,
    required this.faqs,
    required this.contactInfo,
    required this.registries,
    required this.hotelName,
    required this.hotelUrl,
    required this.venueAddress,
    required this.enableRSVPNotification,
    required this.enableEventNotification,
    required this.enablePlannerUpdates,
    required this.isPublished,
  });

  // ── Derived helpers ───────────────────────────────────────────────────────

  /// Parses the primary accent color from hex string. Falls back to pink.
  Color get primaryColor {
    try {
      final hex = selectedColor.replaceAll('#', '');
      return Color(int.parse('FF$hex', radix: 16));
    } catch (_) {
      return Colors.pinkAccent;
    }
  }

  /// Parses the font color from hex string. Falls back to black.
  Color get fontColor {
    try {
      final hex = selectedFontColor.replaceAll('#', '');
      return Color(int.parse('FF$hex', radix: 16));
    } catch (_) {
      return Colors.black;
    }
  }

  /// Parses wedding date to DateTime. Returns null if invalid.
  DateTime? get weddingDateTime {
    try {
      return DateTime.parse(weddingDate);
    } catch (_) {
      return null;
    }
  }

  /// Display-friendly couple name e.g. "Sarah & James"
  String get coupleName => '$brideName & $groomName';

  // ── Firestore deserialization ─────────────────────────────────────────────

  factory WeddingConfig.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};
    return WeddingConfig.fromMap(data);
  }

  factory WeddingConfig.fromMap(Map<String, dynamic> data) {
    // Helper: safely parse a list of maps
    List<T> parseList<T>(
      String key,
      T Function(Map<String, dynamic>) fromMap,
    ) {
      final raw = data[key];
      if (raw == null) return [];
      if (raw is List) {
        return raw
            .whereType<Map>()
            .map((e) => fromMap(Map<String, dynamic>.from(e)))
            .toList();
      }
      return [];
    }

    // Wedding party has a nested structure: weddingParty.bride / weddingParty.groom
    final partyRaw = data['weddingParty'] as Map<String, dynamic>? ?? {};
    final bridalList = (partyRaw['bride'] as List? ?? [])
        .whereType<Map>()
        .map((e) => PartyMember.fromMap(Map<String, dynamic>.from(e)))
        .toList();
    final groomList = (partyRaw['groom'] as List? ?? [])
        .whereType<Map>()
        .map((e) => PartyMember.fromMap(Map<String, dynamic>.from(e)))
        .toList();

    return WeddingConfig(
      websiteSlug: data['websiteSlug'] as String? ?? '',
      appName: data['appName'] as String? ?? 'Our Wedding',
      brideName: data['brideName'] as String? ?? '',
      groomName: data['groomName'] as String? ?? '',
      weddingDate: data['weddingDate'] as String? ?? '',
      weddingLocation: data['weddingLocation'] as String? ?? '',
      selectedColor: data['selectedColor'] as String? ?? '#B0848B',
      selectedFont: data['selectedFont'] as String? ?? 'Serif',
      selectedFontColor: data['selectedFontColor'] as String? ?? '#000000',
      backgroundImageUrl: data['backgroundImageUrl'] as String? ?? '',
      enableRSVP: data['enableRSVP'] as bool? ?? true,
      enableGallery: data['enableGallery'] as bool? ?? false,
      enableItinerary: data['enableItinerary'] as bool? ?? true,
      enableWeddingParty: data['enableWeddingParty'] as bool? ?? false,
      enableOurStory: data['enableOurStory'] as bool? ?? false,
      enableRegistry: data['enableRegistry'] as bool? ?? false,
      enableTravel: data['enableTravel'] as bool? ?? false,
      enableSettings: data['enableSettings'] as bool? ?? true,
      enablePassword: data['enablePassword'] as bool? ?? false,
      appPassword: data['appPassword'] as String? ?? '',
      enableAdminPassword: data['enableAdminPassword'] as bool? ?? false,
      adminAppPassword: data['adminAppPassword'] as String? ?? '',
      rsvpSheetUrl: data['rsvpSheetUrl'] as String? ?? '',
      rsvpDeadline: data['rsvpDeadline'] as String? ?? '',
      galleryDriveUrl: data['galleryDriveUrl'] as String? ?? '',
      weddingEvents: parseList('weddingEvents', WeddingEvent.fromMap),
      brideEvents: parseList('brideEvents', WeddingEvent.fromMap),
      groomEvents: parseList('groomEvents', WeddingEvent.fromMap),
      bridalParty: bridalList,
      groomParty: groomList,
      brideSideFamily: parseList(
        'brideSideFamily',
        (m) => FamilyMember.fromMap(m, side: 'bride'),
      ),
      groomSideFamily: parseList(
        'groomSideFamily',
        (m) => FamilyMember.fromMap(m, side: 'groom'),
      ),
      pets: parseList(
        'pets',
        (m) => FamilyMember.fromMap(m, side: 'pet'),
      ),
      faqs: parseList('faqs', FaqItem.fromMap),
      contactInfo: parseList('contactInfo', ContactInfo.fromMap),
      registries: parseList('registries', RegistryItem.fromMap),
      hotelName: data['hotelName'] as String? ?? '',
      hotelUrl: data['hotelUrl'] as String? ?? '',
      venueAddress: data['venueAddress'] as String? ?? '',
      enableRSVPNotification: data['enableRSVPNotification'] as bool? ?? false,
      enableEventNotification: data['enableEventNotification'] as bool? ?? false,
      enablePlannerUpdates: data['enablePlannerUpdates'] as bool? ?? false,
      isPublished: data['isPublished'] as bool? ?? false,
    );
  }
}
