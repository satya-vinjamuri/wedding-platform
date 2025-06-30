import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

void main() {
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

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(seconds: 2), () {
      setState(() {
        showIntro = false;
      });
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
                    labelText: 'e.g. neelaj2026',
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
                  onPressed: () {
                    final code = searchController.text.trim();
                    if (code.isNotEmpty) {
                      debugPrint('Searching for couple: $code');
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
                    setState(() {
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
                    "Enter the couple's code",
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

