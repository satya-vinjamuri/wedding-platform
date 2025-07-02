import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:local_auth/local_auth.dart';
import 'package:flutter_template/common/layout/layout.dart';

void main() {
  runApp(const MyApp());
}

class AdminProvider extends InheritedWidget {
  final bool isAdmin;

  const AdminProvider({super.key, required this.isAdmin, required super.child});

  static AdminProvider? of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<AdminProvider>();
  }

  @override
  bool updateShouldNotify(AdminProvider oldWidget) =>
      isAdmin != oldWidget.isAdmin;
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '{{COUPLE_NAME}} Wedding App',
      theme: ThemeData(
        scaffoldBackgroundColor: const Color(0xFFF7F5F1),
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.pinkAccent),
        useMaterial3: true,
        textTheme: GoogleFonts.playfairDisplayTextTheme(),
      ),
      home: const AuthGate(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  bool isAuthenticated = false;
  bool isAdmin = false;
  final passwordController = TextEditingController();
  final LocalAuthentication auth = LocalAuthentication();
  static const sessionTimeout = Duration(minutes: 15);

  // 👇 Update this value via codegen
  static const configuredPassword = '{{APP_PASSWORD}}';

  bool get passwordRequired =>
      configuredPassword.isNotEmpty &&
      configuredPassword != '{{APP_PASSWORD}}';

  @override
  void initState() {
    super.initState();
    _checkStoredAuth();
  }

  Future<void> _checkStoredAuth() async {
    final prefs = await SharedPreferences.getInstance();
    final storedAuth = prefs.getBool('isAuthenticated') ?? false;
    final storedAdmin = prefs.getBool('isAdmin') ?? false;
    final timestamp = prefs.getInt('authTimestamp');

    final now = DateTime.now();
    final lastAuthTime = timestamp != null
        ? DateTime.fromMillisecondsSinceEpoch(timestamp)
        : DateTime.fromMillisecondsSinceEpoch(0);

    if (storedAuth && now.difference(lastAuthTime) < sessionTimeout) {
      setState(() {
        isAuthenticated = true;
        isAdmin = storedAdmin;
      });
    } else if (await _tryBiometricAuth()) {
      setState(() {
        isAuthenticated = true;
        isAdmin = storedAdmin;
      });
      await prefs.setInt(
          'authTimestamp', DateTime.now().millisecondsSinceEpoch);
    } else {
      await prefs.clear();
    }
  }

  Future<bool> _tryBiometricAuth() async {
    try {
      bool canAuth =
          await auth.canCheckBiometrics || await auth.isDeviceSupported();
      if (!canAuth) return false;

      return await auth.authenticate(
        localizedReason: 'Authenticate to access your app',
        options: const AuthenticationOptions(biometricOnly: true),
      );
    } catch (_) {
      return false;
    }
  }

  Future<void> _validatePassword() async {
    final password = passwordController.text;
    final prefs = await SharedPreferences.getInstance();

    if (!passwordRequired || password == configuredPassword) {
      await prefs.setBool('isAuthenticated', true);
      await prefs.setBool('isAdmin', false);
      await prefs.setInt(
          'authTimestamp', DateTime.now().millisecondsSinceEpoch);
      setState(() {
        isAuthenticated = true;
        isAdmin = false;
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Incorrect password'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isAuthenticated || !passwordRequired) {
      return AdminProvider(isAdmin: isAdmin, child: const WeddingHomePage());
    }

    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Enter Access Password',
                  style: GoogleFonts.merriweather(
                      fontSize: 22, fontWeight: FontWeight.bold)),
              const SizedBox(height: 20),
              TextField(
                controller: passwordController,
                obscureText: true,
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'Password',
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                  onPressed: _validatePassword,
                  style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.black,
                      foregroundColor: Colors.white),
                  child: const Text('Submit')),
            ],
          ),
        ),
      ),
    );
  }
}

class WeddingHomePage extends StatefulWidget {
  const WeddingHomePage({super.key});

  @override
  State<WeddingHomePage> createState() => _WeddingHomePageState();
}

class _WeddingHomePageState extends State<WeddingHomePage> {
  Duration _timeLeft = Duration.zero;
  Timer? _countdownTimer;

  @override
  void initState() {
    super.initState();
    try {
      _timeLeft =
          DateTime.parse('{{WEDDING_DATE}}').difference(DateTime.now());
    } catch (_) {
      // fallback in case parse fails
      _timeLeft = DateTime(2026, 2, 20).difference(DateTime.now());
    }
    _startCountdown();
  }

  void _startCountdown() {
    DateTime targetDate;
    try {
      targetDate = DateTime.parse('{{WEDDING_DATE}}');
    } catch (_) {
      targetDate = DateTime(2026, 2, 20); // fallback
    }

    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      final now = DateTime.now();
      final diff = targetDate.difference(now);
      if (diff.isNegative) {
        _countdownTimer?.cancel();
        setState(() => _timeLeft = Duration.zero);
      } else {
        setState(() => _timeLeft = diff);
      }
    });
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Layout(
      title: "SAVE THE DATE",
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 48),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                '{{BRIDE_NAME}}',
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
                '{{GROOM_NAME}}',
                style: GoogleFonts.playfairDisplay(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                '{{WEDDING_DATE}}',
                style: GoogleFonts.merriweather(fontSize: 18),
              ),
              const SizedBox(height: 4),
              Text(
                '{{WEDDING_LOCATION}}',
                style: GoogleFonts.merriweather(
                  fontSize: 16,
                  color: Colors.grey[700],
                ),
              ),
              const SizedBox(height: 16),
              Text(
                _timeLeft.inSeconds > 0
                    ? '${_timeLeft.inDays}d ${_timeLeft.inHours % 24}h ${_timeLeft.inMinutes % 60}m ${_timeLeft.inSeconds % 60}s to go!'
                    : 'The big day has arrived!',
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
