import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:weddesigner/common/layout/layout.dart'; // adjust the path if needed
import 'package:weddesigner/rsvpForm.dart'; // adjust the path if needed
import 'package:intl/intl.dart';
import 'dart:async';

class CoupleHomeScreen extends StatefulWidget {
  final Map<String, dynamic> weddingData;

  const CoupleHomeScreen({Key? key, required this.weddingData}) : super(key: key);

  @override
  State<CoupleHomeScreen> createState() => _CoupleHomeScreenState();
}

class _CoupleHomeScreenState extends State<CoupleHomeScreen> {
  late Timer _timer;
  late Duration _timeLeft;
  DateTime now = DateTime.now();
  late DateTime weddingDate;
  late DateTime cutoffDate;

  @override
  void initState() {
    super.initState();
    weddingDate = DateTime.parse(widget.weddingData['weddingDate'] ?? '2026-02-20');
    cutoffDate = weddingDate.subtract(const Duration(days: 1));
    _timeLeft = weddingDate.difference(now);

    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() {
        now = DateTime.now();
        _timeLeft = weddingDate.difference(now);
      });
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  void fetchAllUsers() {
    // Optional: fetch RSVP guests or anything else
  }

  @override
  Widget build(BuildContext context) {
    final bride = widget.weddingData['brideName'] ?? 'Bride';
    final groom = widget.weddingData['groomName'] ?? 'Groom';
    final location = widget.weddingData['weddingLocation'] ?? 'Location TBD';
    final dateStr = DateFormat('EEEE, MMMM d, y').format(DateTime.parse(widget.weddingData['weddingDate'] ?? ''));
    //final dateStr = widget.weddingData['weddingDate'] ?? 'Date TBD'; // or format `weddingDate`

    return Scaffold(
      body: Layout(
        title: 'Save the Date',
        body: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const SizedBox(height: 24),
                Text('SAVE THE DATE',
                    style: GoogleFonts.montserrat(fontSize: 42, fontWeight: FontWeight.bold, color: Colors.white)),
                const SizedBox(height: 24),
                ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: ColorFiltered(
                        colorFilter: const ColorFilter.mode(Colors.grey, BlendMode.saturation),
                        child: Image.network(
                        widget.weddingData['saveTheDateImageUrl'] ?? '',
                        width: double.infinity,
                        height: 400,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                            return const SizedBox(
                            height: 400,
                            child: Center(child: Text('Image unavailable')),
                            );
                        },
                        loadingBuilder: (context, child, loadingProgress) {
                            if (loadingProgress == null) return child;
                            return const SizedBox(
                            height: 400,
                            child: Center(child: CircularProgressIndicator()),
                            );
                        },
                        ),
                    ),
                ),

                const SizedBox(height: 10),
                Text('$groom & $bride',
                    style: GoogleFonts.montserrat(fontSize: 36, fontWeight: FontWeight.bold, color: Colors.white)),
                const SizedBox(height: 12),
                Text('$dateStr\n$location',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.merriweather(fontSize: 16, color: Colors.white)),
                const SizedBox(height: 16),
                Text(
                  _timeLeft.inSeconds > 0
                      ? '${_timeLeft.inDays}d ${_timeLeft.inHours % 24}h ${_timeLeft.inMinutes % 60}m ${_timeLeft.inSeconds % 60}s to go!'
                      : 'The big day has arrived!',
                  style: GoogleFonts.merriweather(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                const SizedBox(height: 10),
                if (now.isBefore(cutoffDate)) ...[
                  ElevatedButton(
                    onPressed: () {
                      fetchAllUsers();
                        Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => RSVPFormScreen(weddingData:widget.weddingData)),
                        );
                    },
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                      backgroundColor: Colors.white,
                    ),
                    child: const Text(
                      'RSVP',
                      style: TextStyle(fontSize: 20, color: Colors.black, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
        weddingData: widget.weddingData, // ✅ Pass the weddingData here
      ),
    );
  }
}
