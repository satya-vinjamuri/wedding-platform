import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:weddesigner/functions/getCoupleDetails.dart';
import 'package:weddesigner/couple_home_screen.dart';
import 'package:onesignal_flutter/onesignal_flutter.dart'; // ✅ OneSignal added

// Firebase background handler
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  debugPrint('🔔 Background message received: ${message.messageId}');
}

final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
    FlutterLocalNotificationsPlugin();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();

  // Firebase background handler
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  // Firebase permissions
  await FirebaseMessaging.instance.requestPermission();

  // Local notifications setup
  const AndroidInitializationSettings androidSettings =
      AndroidInitializationSettings('@mipmap/ic_launcher');

  const DarwinInitializationSettings iosSettings = DarwinInitializationSettings();

  const InitializationSettings initSettings = InitializationSettings(
    android: androidSettings,
    iOS: iosSettings,
  );

  await flutterLocalNotificationsPlugin.initialize(initSettings);

  const AndroidNotificationChannel channel = AndroidNotificationChannel(
    'default_channel',
    'Wedding Notifications',
    description: 'Channel for WedDesigner app notifications',
    importance: Importance.high,
  );

  await flutterLocalNotificationsPlugin
      .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
      ?.createNotificationChannel(channel);

  // ✅ OneSignal Initialization
  OneSignal.Debug.setLogLevel(OSLogLevel.verbose);
  OneSignal.initialize('13a8752e-c3eb-4ece-b2d0-7118e3ebadea'); // Replace with actual App ID
  OneSignal.Notifications.requestPermission(true);

  runApp(const MyApp());
}

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

    // Firebase foreground handler
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

    // ✅ OneSignal foreground handler
    OneSignal.Notifications.addForegroundWillDisplayListener((event) {
      // ✅ show the notification as native OS-level push
      event.notification.display();
    });

    // Check for stored wedding code
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
                : _buildMainContent(),
          ),
        ),
      ),
    );
  }

  Widget _buildMainContent() {
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 500),
      transitionBuilder: (child, animation) =>
          FadeTransition(opacity: animation, child: child),
      child: showSearch
          ? Column(
              key: const ValueKey("search-view"),
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  "Enter the couple’s code",
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: searchController,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    labelText: 'e.g. arti-vihaan-2025-07',
                    labelStyle: const TextStyle(color: Color(0xFFE4D7DE)),
                    filled: true,
                    fillColor: Colors.black26,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () async {
                    final prefs = await SharedPreferences.getInstance();
                    debugPrint(prefs.getString('activeWeddingCode') ??
                        'No active wedding code found');
                    final code = searchController.text.trim();
                    if (code.isNotEmpty) {
                      debugPrint('Searching for couple: $code');
                      final data = await getCoupleDetails(code);
                      if (data != null) {
                        await prefs.setString('activeWeddingCode', code);
                        debugPrint(
                            '✅ Couple found: ${data['brideName']} & ${data['groomName']}');
                        _showTopBanner(
                          context,
                          'Welcome to the Wedding of ${data['brideName']} & ${data['groomName']}',
                        );
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) =>
                                CoupleHomeScreen(weddingData: data),
                          ),
                        );
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content:
                                Text('No wedding found with that code.'),
                            backgroundColor: Colors.redAccent,
                          ),
                        );
                      }
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFD8A3A7),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(32),
                    ),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 40, vertical: 16),
                  ),
                  child: const Text(
                    'Search',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () {
                    searchController.clear();
                    setState(() {
                      searchController.clear();
                      showSearch = false;
                    });
                  },
                  child: const Text(
                    'Back',
                    style: TextStyle(
                        color: Color(0xFFE4D7DE),
                        fontSize: 12,
                        fontWeight: FontWeight.bold),
                  ),
                )
              ],
            )
          : Column(
              key: const ValueKey("welcome-view"),
              mainAxisSize: MainAxisSize.min,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.asset(
                    'lib/assets/logo.png',
                    width: double.infinity,
                    height: 400,
                    fit: BoxFit.cover,
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Find your friend’s wedding app below',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 40, vertical: 16),
                    backgroundColor: const Color(0xFFD8A3A7),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(32),
                    ),
                    elevation: 4,
                  ),
                  onPressed: () {
                    setState(() {
                      showSearch = true;
                    });
                  },
                  child: const Text(
                    "Find their Wedding",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}
