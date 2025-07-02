import 'package:flutter/material.dart';
import 'package:weddesigner/couple_preview_screen.dart';
import 'package:google_fonts/google_fonts.dart';

class SearchCoupleScreen extends StatefulWidget {
  const SearchCoupleScreen({super.key});

  @override
  State<SearchCoupleScreen> createState() => _SearchCoupleScreenState();
}

class _SearchCoupleScreenState extends State<SearchCoupleScreen> {

    final searchController = TextEditingController();

    void handleSearch() {
        final code = searchController.text.trim();
        if (code.isNotEmpty) {
        // Navigate to preview (ideally fetch from Firebase first)
        Navigator.push(
            context,
            MaterialPageRoute(
            builder: (_) => CouplePreviewScreen(coupleIdOrCode: code),
            ),
        );
        }
    }

    @override
    Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
        backgroundColor: const Color(0xFFF7F5F1),
        elevation: 0,
        leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => Navigator.pop(context),
        ),
        ),
        body: Center(
        child: Padding(
            padding: const EdgeInsets.all(32.0),
            child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
                Text(
                'Find Your Wedding App',
                style: GoogleFonts.montserrat(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 20),
                TextField(
                controller: searchController,
                decoration: const InputDecoration(
                    labelText: 'Enter Couple Name or Code',
                    border: OutlineInputBorder(),
                ),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                onPressed: handleSearch,
                child: const Text('Search'),
                )
            ],
            ),
        ),
        ),
    );
    }

}
