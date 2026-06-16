import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/wedding_config.dart';

/// Fetches and caches wedding configuration from Firestore.
///
/// Usage:
///   final service = WeddingDataService();
///   final config = await service.fetchBySlug('satya-and-priya');
///
/// The Firestore collection is `weddingApps` and documents are queried
/// by the `websiteSlug` field, matching the slug the couple chose in
/// the web designer.
class WeddingDataService {
  WeddingDataService({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  final FirebaseFirestore _firestore;

  // In-memory cache: slug → config
  // Cleared when the user switches weddings or the app restarts.
  final Map<String, WeddingConfig> _cache = {};

  static const String _collection = 'weddingApps';

  /// Fetches a wedding config by its unique slug (e.g. "satya-and-priya").
  ///
  /// Returns null if:
  ///   - No document found with that slug
  ///   - The wedding is not published (isPublished == false)
  ///   - A network or Firestore error occurs
  ///
  /// Results are cached in memory for the duration of the app session.
  Future<WeddingConfig?> fetchBySlug(String slug) async {
    final normalizedSlug = slug.trim().toLowerCase();

    // Return cached result immediately if available
    if (_cache.containsKey(normalizedSlug)) {
      return _cache[normalizedSlug];
    }

    try {
      final snapshot = await _firestore
          .collection(_collection)
          .where('websiteSlug', isEqualTo: normalizedSlug)
          .limit(1)
          .get();

      if (snapshot.docs.isEmpty) {
        return null; // No wedding found for this slug
      }

      final config = WeddingConfig.fromFirestore(snapshot.docs.first);

      // Only surface published weddings to guests
      if (!config.isPublished) {
        return null;
      }

      _cache[normalizedSlug] = config;
      return config;
    } on FirebaseException catch (e) {
      // Re-throw with a descriptive message so the UI can show a friendly error
      throw WeddingDataException(
        'Could not load wedding data: ${e.message}',
        code: e.code,
      );
    } catch (e) {
      throw WeddingDataException('An unexpected error occurred: $e');
    }
  }

  /// Fetches a wedding by slug regardless of publish status.
  /// Used by the couple/admin when editing their own wedding in the app.
  Future<WeddingConfig?> fetchBySlugForOwner(String slug) async {
    final normalizedSlug = slug.trim().toLowerCase();

    try {
      final snapshot = await _firestore
          .collection(_collection)
          .where('websiteSlug', isEqualTo: normalizedSlug)
          .limit(1)
          .get();

      if (snapshot.docs.isEmpty) return null;

      final config = WeddingConfig.fromFirestore(snapshot.docs.first);
      _cache[normalizedSlug] = config;
      return config;
    } on FirebaseException catch (e) {
      throw WeddingDataException(
        'Could not load wedding data: ${e.message}',
        code: e.code,
      );
    }
  }

  /// Streams real-time updates for a wedding.
  /// Useful for the couple's edit view — changes on the web designer
  /// show up instantly in the app.
  Stream<WeddingConfig?> streamBySlug(String slug) {
    final normalizedSlug = slug.trim().toLowerCase();

    return _firestore
        .collection(_collection)
        .where('websiteSlug', isEqualTo: normalizedSlug)
        .limit(1)
        .snapshots()
        .map((snapshot) {
      if (snapshot.docs.isEmpty) return null;
      final config = WeddingConfig.fromFirestore(snapshot.docs.first);
      _cache[normalizedSlug] = config;
      return config;
    });
  }

  /// Clears the in-memory cache.
  /// Call this when the user chooses to switch to a different wedding.
  void clearCache() => _cache.clear();

  /// Clears the cache for a specific slug only.
  void invalidate(String slug) => _cache.remove(slug.trim().toLowerCase());
}

/// Thrown by [WeddingDataService] when a fetch fails.
class WeddingDataException implements Exception {
  final String message;
  final String? code;

  const WeddingDataException(this.message, {this.code});

  @override
  String toString() =>
      code != null ? 'WeddingDataException [$code]: $message' : 'WeddingDataException: $message';
}
