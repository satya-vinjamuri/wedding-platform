import 'dart:async';
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:local_auth/local_auth.dart';

import 'common/layout/layout.dart';
import 'models/wedding_config.dart';
import 'providers/wedding_config_provider.dart';
import 'theme/wedding_theme.dart';

// ─────────────────────────────────────────────────────────────────────────────
// Entry point
// ─────────────────────────────────────────────────────────────────────────────

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Firebase.
  // Requires google-services.json (Android) and GoogleService-Info.plist (iOS)
  // to be placed in their respective platform directories.
  await Firebase.initializeApp();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => WeddingConfigProvider()),
      ],
      child: const WeddingApp(),
    ),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root app widget — theme is dynamic, driven by WeddingConfig
// ─────────────────────────────────────────────────────────────────────────────

class WeddingApp extends StatelessWidget {
  const WeddingApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Watch config so the theme updates if the couple changes colors
    final configProvider = context.watch<WeddingConfigProvider>();
    final config = configProvider.config;

    return MaterialApp(
      title: config?.appName ?? 'WeddingApp',
      theme: config != null
          ? WeddingTheme.buildFrom(config)
          : WeddingTheme.defaultTheme(),
      home: const AppShell(),
      debugShowCheckedModeBanner: false,
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AppShell — decides which top-level screen to show based on app state
// ─────────────────────────────────────────────────────────────────────────────

class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  bool _initialized = false;
  String? _restoredSlug;

  @override
  void initState() {
    super.initState();
    _restoreSession();
  }

  Future<void> _restoreSession() async {
    final provider = context.read<WeddingConfigProvider>();
    final savedSlug = await provider.tryRestoreLastWedding();
    setState(() {
      _restoredSlug = savedSlug;
      _initialized = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!_initialized) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final configProvider = context.watch<WeddingConfigProvider>();

    // If a wedding is loaded, go through auth then home
    if (configProvider.isLoaded && configProvider.config != null) {
      return AuthGate(config: configProvider.config!);
    }

    // Otherwise show the entry screen (with pre-filled slug if we have one,
    // in which case we auto-load it instead of waiting for a tap).
    return EntryScreen(prefilledSlug: _restoredSlug);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EntryScreen — couple/guest landing page where a wedding code is entered.
// Auto-loads a previously-used slug on relaunch so returning users skip
// straight to AuthGate/WeddingHomePage instead of re-typing their code.
// ─────────────────────────────────────────────────────────────────────────────

class EntryScreen extends StatefulWidget {
  final String? prefilledSlug;
  const EntryScreen({super.key, this.prefilledSlug});

  @override
  State<EntryScreen> createState() => _EntryScreenState();
}

class _EntryScreenState extends State<EntryScreen> {
  late final TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.prefilledSlug ?? '');

    // If we have a remembered slug, load it automatically — returning users
    // shouldn't have to re-type their code every time they open the app.
    if (widget.prefilledSlug != null && widget.prefilledSlug!.isNotEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          context.read<WeddingConfigProvider>().loadWedding(widget.prefilledSlug!);
        }
      });
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _submit(WeddingConfigProvider provider) {
    if (provider.isLoading) return;
    FocusScope.of(context).unfocus();
    provider.loadWedding(_controller.text);
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<WeddingConfigProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFFF7F5F1),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(32.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: const BoxDecoration(
                    color: Colors.black,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.favorite, color: Colors.white, size: 28),
                ),
                const SizedBox(height: 20),
                Text(
                  'WeddingApp',
                  style: GoogleFonts.playfairDisplay(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Enter your wedding code to get started',
                  style: GoogleFonts.merriweather(
                    fontSize: 14,
                    color: Colors.grey[600],
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                TextField(
                  controller: _controller,
                  textInputAction: TextInputAction.go,
                  autocorrect: false,
                  onSubmitted: (_) => _submit(provider),
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    labelText: 'Wedding code (e.g. satya-and-priya)',
                    prefixIcon: Icon(Icons.search),
                  ),
                ),
                const SizedBox(height: 16),
                if (provider.notFound)
                  Text(
                    'No wedding found for that code.',
                    style: const TextStyle(color: Colors.red),
                  ),
                if (provider.hasError)
                  Text(
                    provider.errorMessage ?? 'Something went wrong.',
                    style: const TextStyle(color: Colors.red),
                  ),
                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: provider.isLoading ? null : () => _submit(provider),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.black,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    child: provider.isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2,
                            ),
                          )
                        : const Text('Find Wedding'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AuthGate — optional password protection, now reads from WeddingConfig
// ─────────────────────────────────────────────────────────────────────────────

class AuthGate extends StatefulWidget {
  final WeddingConfig config;
  const AuthGate({super.key, required this.config});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  bool _isAuthenticated = false;
  bool _isAdmin = false;
  final _passwordController = TextEditingController();
  final _localAuth = LocalAuthentication();
  static const _sessionTimeout = Duration(minutes: 15);

  bool get _passwordRequired =>
      widget.config.enablePassword && widget.config.appPassword.isNotEmpty;

  @override
  void initState() {
    super.initState();
    _checkStoredAuth();
  }

  @override
  void dispose() {
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _checkStoredAuth() async {
    if (!_passwordRequired) {
      setState(() => _isAuthenticated = true);
      return;
    }

    final prefs = await SharedPreferences.getInstance();
    final storedAuth = prefs.getBool('isAuthenticated') ?? false;
    final storedAdmin = prefs.getBool('isAdmin') ?? false;
    final timestamp = prefs.getInt('authTimestamp');

    final now = DateTime.now();
    final lastAuth = timestamp != null
        ? DateTime.fromMillisecondsSinceEpoch(timestamp)
        : DateTime.fromMillisecondsSinceEpoch(0);

    if (storedAuth && now.difference(lastAuth) < _sessionTimeout) {
      setState(() {
        _isAuthenticated = true;
        _isAdmin = storedAdmin;
      });
    } else if (await _tryBiometric()) {
      await _persistSession(isAdmin: storedAdmin);
      setState(() {
        _isAuthenticated = true;
        _isAdmin = storedAdmin;
      });
    } else {
      final prefs2 = await SharedPreferences.getInstance();
      await prefs2.clear();
    }
  }

  Future<bool> _tryBiometric() async {
    try {
      final canAuth =
          await _localAuth.canCheckBiometrics || await _localAuth.isDeviceSupported();
      if (!canAuth) return false;
      return await _localAuth.authenticate(
        localizedReason: 'Authenticate to access the wedding app',
        options: const AuthenticationOptions(biometricOnly: true),
      );
    } catch (_) {
      return false;
    }
  }

  Future<void> _persistSession({bool isAdmin = false}) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isAuthenticated', true);
    await prefs.setBool('isAdmin', isAdmin);
    await prefs.setInt('authTimestamp', DateTime.now().millisecondsSinceEpoch);
  }

  Future<void> _validatePassword() async {
    final entered = _passwordController.text;
    // Check guest password
    if (entered == widget.config.appPassword) {
      await _persistSession(isAdmin: false);
      setState(() {
        _isAuthenticated = true;
        _isAdmin = false;
      });
      return;
    }
    // Check admin password
    if (widget.config.enableAdminPassword &&
        entered == widget.config.adminAppPassword) {
      await _persistSession(isAdmin: true);
      setState(() {
        _isAuthenticated = true;
        _isAdmin = true;
      });
      return;
    }
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Incorrect password. Please try again.'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isAuthenticated || !_passwordRequired) {
      return AdminProvider(
        isAdmin: _isAdmin,
        child: WeddingHomePage(config: widget.config),
      );
    }

    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                widget.config.coupleName,
                style: GoogleFonts.playfairDisplay(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Enter the access password',
                style: GoogleFonts.merriweather(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
              ),
              const SizedBox(height: 24),
              TextField(
                controller: _passwordController,
                obscureText: true,
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'Password',
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _validatePassword,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.black,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  child: const Text('Enter'),
                ),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () =>
                    context.read<WeddingConfigProvider>().clearWedding(),
                child: const Text('← Find a different wedding'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AdminProvider — passes admin flag down the widget tree
// ─────────────────────────────────────────────────────────────────────────────

class AdminProvider extends InheritedWidget {
  final bool isAdmin;

  const AdminProvider({
    super.key,
    required this.isAdmin,
    required super.child,
  });

  static AdminProvider? of(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<AdminProvider>();

  @override
  bool updateShouldNotify(AdminProvider oldWidget) =>
      isAdmin != oldWidget.isAdmin;
}

// ─────────────────────────────────────────────────────────────────────────────
// WeddingHomePage — fully data-driven, no more placeholders
// ─────────────────────────────────────────────────────────────────────────────

class WeddingHomePage extends StatefulWidget {
  final WeddingConfig config;
  const WeddingHomePage({super.key, required this.config});

  @override
  State<WeddingHomePage> createState() => _WeddingHomePageState();
}

class _WeddingHomePageState extends State<WeddingHomePage> {
  Duration _timeLeft = Duration.zero;
  Timer? _countdownTimer;

  @override
  void initState() {
    super.initState();
    _startCountdown();
  }

  void _startCountdown() {
    final targetDate = widget.config.weddingDateTime;
    if (targetDate == null) return;

    _timeLeft = targetDate.difference(DateTime.now());
    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      final diff = targetDate.difference(DateTime.now());
      setState(() {
        _timeLeft = diff.isNegative ? Duration.zero : diff;
      });
      if (diff.isNegative) _countdownTimer?.cancel();
    });
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final config = widget.config;

    return Layout(
      title: 'SAVE THE DATE',
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 48),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                config.brideName,
                style: GoogleFonts.playfairDisplay(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5,
                ),
              ),
              Text(
                '&',
                style: GoogleFonts.playfairDisplay(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5,
                ),
              ),
              Text(
                config.groomName,
                style: GoogleFonts.playfairDisplay(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                config.weddingDate,
                style: GoogleFonts.merriweather(fontSize: 18),
              ),
              const SizedBox(height: 4),
              Text(
                config.weddingLocation,
                style: GoogleFonts.merriweather(
                  fontSize: 16,
                  color: Colors.grey[700],
                ),
              ),
              const SizedBox(height: 16),
              Text(
                _timeLeft.inSeconds > 0
                    ? '${_timeLeft.inDays}d ${_timeLeft.inHours % 24}h '
                        '${_timeLeft.inMinutes % 60}m ${_timeLeft.inSeconds % 60}s to go!'
                    : 'The big day has arrived! 🎉',
                style: GoogleFonts.merriweather(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 32),
              Text(
                'Thank you for being part of our special day!',
                style: GoogleFonts.merriweather(
                  fontSize: 16,
                  fontStyle: FontStyle.italic,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
