import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:onesignal_flutter/onesignal_flutter.dart';
import 'package:weddesigner/functions/getCoupleDetails.dart';
import 'package:weddesigner/ui/couple_home_screen.dart';
import 'package:weddesigner/ui/search_view.dart';
import 'package:weddesigner/ui/welcome_view.dart';

final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
    FlutterLocalNotificationsPlugin();

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'WedDesigner',
      theme: ThemeData(
        scaffoldBackgroundColor: const Color(0xFF0D0208),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFD8A3A7),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
        textTheme: GoogleFonts.montserratTextTheme().copyWith(
          bodyLarge: GoogleFonts.montserrat(
            fontSize: 18,
            color: const Color(0xFFE4D7DE),
          ),
          titleLarge: GoogleFonts.montserrat(
            fontSize: 32,
            fontWeight: FontWeight.bold,
            color: const Color(0xFFE4D7DE),
          ),
        ),
      ),
      home: const StyledLandingPage(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class StyledLandingPage extends StatefulWidget {
  const StyledLandingPage({super.key});

  @override
  State<StyledLandingPage> createState() => _StyledLandingPageState();
}

class _StyledLandingPageState extends State<StyledLandingPage> {
  bool showSearch = false;
  bool showIntro = false;
  final TextEditingController searchController = TextEditingController();

  @override
  void initState() {
    super.initState();

    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      RemoteNotification? notification = message.notification;
      AndroidNotification? android = message.notification?.android;

      if (notification != null && android != null) {
        flutterLocalNotificationsPlugin.show(
          notification.hashCode,
          notification.title,
          notification.body,
          NotificationDetails(
            android: AndroidNotificationDetails(
              'default_channel',
              'Wedding Notifications',
              channelDescription: 'Channel for WedDesigner app notifications',
              importance: Importance.max,
              priority: Priority.high,
              icon: '@mipmap/ic_launcher',
            ),
          ),
        );
      }
    });

    OneSignal.Notifications.addForegroundWillDisplayListener((event) {
      event.notification.display();
    });

    _initializeApp();
  }

  Future<void> _initializeApp() async {
    try {
      final prefs = await SharedPreferences.getInstance();

      final hasSeenIntro = prefs.getBool('hasSeenIntro') ?? false;
      if (!hasSeenIntro) {
        setState(() {
          showIntro = true;
        });
      }

      final codes = prefs.getStringList('weddingCodes') ?? [];
      final savedCode = prefs.getString('activeWeddingCode');
      print("Codes: $codes");
      print("prefs $prefs");
      if (codes.length > 1) {
        // Show wedding selector
        WidgetsBinding.instance.addPostFrameCallback((_) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (_) => WeddingSelectorScreen(codes: codes),
            ),
          );
        });
        return;
      }

      if (savedCode != null && savedCode.isNotEmpty) {
        final data = await getCoupleDetails(savedCode);
        if (data != null && mounted) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (_) => CoupleHomeScreen(weddingData: data),
            ),
          );
          return;
        }
      }
    } catch (e, stack) {
      debugPrint('⚠️ Error loading saved couple details: $e');
      debugPrint('$stack');
    }

    Future.delayed(const Duration(seconds: 2), () async {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('hasSeenIntro', true);
      if (mounted) {
        setState(() {
          showIntro = false;
        });
      }
    });
  }

  void _showTopBanner(BuildContext context, String message) {
    final overlay = Overlay.of(context);
    final overlayEntry = OverlayEntry(
      builder: (context) => Positioned(
        top: MediaQuery.of(context).padding.top + 10,
        left: 20,
        right: 20,
        child: Material(
          elevation: 6,
          borderRadius: BorderRadius.circular(12),
          color: Colors.greenAccent,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Text(
              message,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.black,
                fontSize: 16,
              ),
            ),
          ),
        ),
      ),
    );

    overlay.insert(overlayEntry);
    Future.delayed(const Duration(seconds: 3), () {
      overlayEntry.remove();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D0208),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32.0),
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 800),
            transitionBuilder: (child, animation) =>
                FadeTransition(opacity: animation, child: child),
            child: showIntro
                ? Text(
                    'Welcome to WedDesigner',
                    key: const ValueKey('intro'),
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontSize: 36,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFFE4D7DE),
                        ),
                    textAlign: TextAlign.center,
                  )
                : showSearch
                    ? SearchView(
                        controller: searchController,
                        onSearchCompleted: (data, code) async {
                          final prefs = await SharedPreferences.getInstance();
                          await prefs.setString('activeWeddingCode', code);

                          final existing = prefs.getStringList('weddingCodes') ?? [];
                          if (!existing.contains(code)) {
                            existing.add(code);
                            await prefs.setStringList('weddingCodes', existing);
                          }

                          await OneSignal.User.addTagWithKey("wedding_code", code);
                          _showTopBanner(
                            context,
                            'Welcome to the Wedding of ${data['brideName']} & ${data['groomName']}',
                          );
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => CoupleHomeScreen(weddingData: data),
                            ),
                          );
                        },
                        onBackPressed: () {
                          setState(() {
                            searchController.clear();
                            showSearch = false;
                          });
                        },
                      )
                    : WelcomeView(
                        onFindWeddingPressed: () {
                          setState(() {
                            showIntro = false;
                            showSearch = true;
                          });
                        },
                      ),
          ),
        ),
      ),
    );
  }
}

class WeddingSelectorScreen extends StatefulWidget {
  final List<String> codes;

  const WeddingSelectorScreen({super.key, required this.codes});

  @override
  State<WeddingSelectorScreen> createState() => _WeddingSelectorScreenState();
}

class _WeddingSelectorScreenState extends State<WeddingSelectorScreen> {
  late Future<List<Map<String, dynamic>>> weddingsFuture;
  final TextEditingController searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    weddingsFuture = _loadWeddingDetails(widget.codes);
  }

  Future<List<Map<String, dynamic>>> _loadWeddingDetails(List<String> codes) async {
    List<Map<String, dynamic>> results = [];
    for (final code in codes) {
      final data = await getCoupleDetails(code);
      if (data != null) {
        data['code'] = code; // Attach code back for selection
        results.add(data);
      }
    }
    return results;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D0208),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D0208),
        title: const Text('Select a Wedding'),
      ),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: weddingsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          final weddings = snapshot.data ?? [];

          if (weddings.isEmpty) {
            return const Center(
              child: Text(
                'No valid weddings found.',
                style: TextStyle(color: Colors.white),
              ),
            );
          }

          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: searchController,
                        style: const TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          hintText: 'Enter wedding code',
                          hintStyle: const TextStyle(color: Colors.white54),
                          filled: true,
                          fillColor: Colors.black26,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none,
                          ),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: () async {
                        final code = searchController.text.trim();
                        if (code.isEmpty) return;

                        final data = await getCoupleDetails(code);
                        if (data != null) {
                          final prefs = await SharedPreferences.getInstance();
                          await prefs.setString('activeWeddingCode', code);
                          final existing = prefs.getStringList('weddingCodes') ?? [];
                          if (!existing.contains(code)) {
                            existing.add(code);
                            await prefs.setStringList('weddingCodes', existing);
                          }
                          Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(
                              builder: (_) => CoupleHomeScreen(weddingData: data),
                            ),
                          );
                        } else {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('No wedding found with that code.'),
                              backgroundColor: Colors.redAccent,
                            ),
                          );
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Icon(Icons.search),
                    ),
                  ],
                ),
              ),
              const Divider(color: Colors.white54),
              Expanded(
                child: ListView.builder(
                  itemCount: weddings.length,
                  itemBuilder: (context, index) {
                    final wedding = weddings[index];
                    final code = wedding['code'];
                    final bride = wedding['brideName'] ?? '';
                    final groom = wedding['groomName'] ?? '';
                    final month = wedding['weddingMonth'] ?? '';
                    final year = wedding['weddingYear'] ?? '';

                    return ListTile(
                      title: Text(
                        "$bride & $groom's Wedding ${month.toString().padLeft(2, '0')}-$year",
                        style: const TextStyle(color: Colors.white),
                      ),
                      trailing: const Icon(Icons.arrow_forward_ios, color: Colors.white),
                      onTap: () async {
                        final prefs = await SharedPreferences.getInstance();
                        await prefs.setString('activeWeddingCode', code);
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                            builder: (_) => CoupleHomeScreen(weddingData: wedding),
                          ),
                        );
                      },
                    );
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }

}
