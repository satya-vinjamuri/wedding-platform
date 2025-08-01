import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
class WelcomeView extends StatelessWidget {
  final VoidCallback onFindWeddingPressed;

  const WelcomeView({super.key, required this.onFindWeddingPressed});

  @override
  Widget build(BuildContext context) {
    return Column(
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
            padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
            backgroundColor: Color(0xFFD8A3A7),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(32),
            ),
            elevation: 4,
          ),
          onPressed: onFindWeddingPressed,
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
    );
  }
}
