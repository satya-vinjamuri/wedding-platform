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
  bool showIntro = true;
  final TextEditingController searchController = TextEditingController();
  bool isLoading = true;

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

    Future.delayed(const Duration(seconds: 2), () async {
      try {
        final prefs = await SharedPreferences.getInstance();
        final savedCode = prefs.getString('activeWeddingCode');
        debugPrint('🔎 Found saved code: $savedCode');

        if (savedCode != null && savedCode.isNotEmpty) {
          final data = await getCoupleDetails(savedCode);
          debugPrint('📦 getCoupleDetails returned: $data');

          if (data != null) {
            if (!mounted) return;
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

      if (mounted) {
        setState(() {
          isLoading = false;
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
                          await OneSignal.User.addTagWithKey("wedding_code", code);
                          debugPrint("✅ Added tag: wedding_code = $code");
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
