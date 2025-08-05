// ui/search_view.dart
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:weddesigner/functions/getCoupleDetails.dart';

class SearchView extends StatelessWidget {
  final TextEditingController controller;
  final Function(Map<String, dynamic> data, String code) onSearchCompleted;
  final VoidCallback onBackPressed;

  const SearchView({
    super.key,
    required this.controller,
    required this.onSearchCompleted,
    required this.onBackPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D0208),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 32.0, vertical: 48.0),
          child: Center(
            child: Column(
              key: const ValueKey("search-view"),
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  "Enter the couple’s code",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: controller,
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
                    final code = controller.text.trim();
                    if (code.isEmpty) return;

                    final data = await getCoupleDetails(code);

                    if (data != null) {
                      onSearchCompleted(data, code);
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
                    backgroundColor: const Color(0xFFD8A3A7),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(32),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
                  ),
                  child: const Text(
                    'Search',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: onBackPressed,
                  child: const Text(
                    'Back',
                    style: TextStyle(
                      color: Color(0xFFE4D7DE),
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
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
