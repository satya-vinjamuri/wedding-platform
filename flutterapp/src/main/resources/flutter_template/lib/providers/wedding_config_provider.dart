import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/wedding_config.dart';
import '../services/wedding_data_service.dart';

/// The state a wedding load operation can be in.
enum WeddingLoadState { idle, loading, loaded, notFound, error }

/// Holds the currently active wedding configuration and manages loading state.
///
/// Consumed by all screens via:
///   context.watch<WeddingConfigProvider>()  — rebuilds on change
///   context.read<WeddingConfigProvider>()   — one-time read, no rebuild
///
/// The loaded slug is persisted in SharedPreferences so the app can
/// auto-reload the last-used wedding on the next launch.
class WeddingConfigProvider extends ChangeNotifier {
  WeddingConfigProvider({WeddingDataService? service})
      : _service = service ?? WeddingDataService();

  final WeddingDataService _service;

  // ── State ─────────────────────────────────────────────────────────────────
  WeddingLoadState _state = WeddingLoadState.idle;
  WeddingConfig? _config;
  String? _errorMessage;
  String? _currentSlug;

  // ── Public getters ────────────────────────────────────────────────────────
  WeddingLoadState get state => _state;
  WeddingConfig? get config => _config;
  String? get errorMessage => _errorMessage;
  String? get currentSlug => _currentSlug;

  bool get isLoading => _state == WeddingLoadState.loading;
  bool get isLoaded => _state == WeddingLoadState.loaded;
  bool get hasError => _state == WeddingLoadState.error;
  bool get notFound => _state == WeddingLoadState.notFound;

  static const _prefKeySlug = 'last_wedding_slug';

  // ── Actions ───────────────────────────────────────────────────────────────

  /// Loads a wedding by slug. Updates state and notifies listeners.
  Future<void> loadWedding(String slug) async {
    if (slug.trim().isEmpty) return;

    _state = WeddingLoadState.loading;
    _errorMessage = null;
    _currentSlug = slug.trim().toLowerCase();
    notifyListeners();

    try {
      final result = await _service.fetchBySlug(_currentSlug!);

      if (result == null) {
        _state = WeddingLoadState.notFound;
        _config = null;
      } else {
        _state = WeddingLoadState.loaded;
        _config = result;
        await _persistSlug(_currentSlug!);
      }
    } on WeddingDataException catch (e) {
      _state = WeddingLoadState.error;
      _errorMessage = e.message;
      _config = null;
    } catch (e) {
      _state = WeddingLoadState.error;
      _errorMessage = 'Something went wrong. Please try again.';
      _config = null;
    }

    notifyListeners();
  }

  /// Loads a wedding for the authenticated owner (bypasses isPublished check).
  Future<void> loadWeddingAsOwner(String slug) async {
    if (slug.trim().isEmpty) return;

    _state = WeddingLoadState.loading;
    _errorMessage = null;
    _currentSlug = slug.trim().toLowerCase();
    notifyListeners();

    try {
      final result = await _service.fetchBySlugForOwner(_currentSlug!);

      if (result == null) {
        _state = WeddingLoadState.notFound;
        _config = null;
      } else {
        _state = WeddingLoadState.loaded;
        _config = result;
        await _persistSlug(_currentSlug!);
      }
    } on WeddingDataException catch (e) {
      _state = WeddingLoadState.error;
      _errorMessage = e.message;
    } catch (e) {
      _state = WeddingLoadState.error;
      _errorMessage = 'Something went wrong. Please try again.';
    }

    notifyListeners();
  }

  /// Checks SharedPreferences for a previously used slug and auto-loads it.
  /// Call this at app startup to restore the last-used wedding.
  Future<String?> tryRestoreLastWedding() async {
    final prefs = await SharedPreferences.getInstance();
    final savedSlug = prefs.getString(_prefKeySlug);
    return savedSlug; // Caller decides whether to auto-load
  }

  /// Clears the current wedding and returns the user to the entry screen.
  Future<void> clearWedding() async {
    _config = null;
    _state = WeddingLoadState.idle;
    _errorMessage = null;
    _currentSlug = null;
    _service.clearCache();

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_prefKeySlug);

    notifyListeners();
  }

  /// Refreshes the current wedding from Firestore (bypasses cache).
  Future<void> refresh() async {
    if (_currentSlug == null) return;
    _service.invalidate(_currentSlug!);
    await loadWedding(_currentSlug!);
  }

  // ── Private ───────────────────────────────────────────────────────────────
  Future<void> _persistSlug(String slug) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_prefKeySlug, slug);
  }
}
