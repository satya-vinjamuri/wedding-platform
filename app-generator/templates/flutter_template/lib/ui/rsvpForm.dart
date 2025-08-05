import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;

const Map<String, String> eventCodeMap = {
  'W': 'Wedding Ceremony',
  'R': 'Reception',
  'S': 'Sangeet',
  'M': 'Mehndi',
  'BH': 'Bride Haldi',
  'GH': 'Groom Haldi',
  'V': 'Vidhi',
  'SN': 'Snathakam',
};

class RSVPFormScreen extends StatefulWidget {
  final Map<String, dynamic> weddingData;

  const RSVPFormScreen({Key? key, required this.weddingData}) : super(key: key);

  @override
  State<RSVPFormScreen> createState() => _RSVPFormScreenState();
}

class _RSVPFormScreenState extends State<RSVPFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final nameController = TextEditingController();
  final phoneController = TextEditingController();

  String sheetId = '';
  bool loading = false;
  bool isFound = false;
  bool isConfirmed = false;
  String statusMessage = '';
  int selectedGuestCount = 1;
  int? allowedGuests;

  List<String> invitedEvents = [];
  Map<String, String> rsvpChoices = {};
  int currentQuestionIndex = 0;

  String get googleScriptUrl =>
      'https://script.google.com/macros/s/AKfycbyBCO4ZfeL0StEecuR0UnlT8YCos5fT1Nh_swoKqH57sMn9-NmFIFl2hMKrobdw1jv5/exec?sheetId=$sheetId';

  @override
  void initState() {
    super.initState();
    extractSheetId();
  }

  void extractSheetId() {
    final RegExp regExp = RegExp(r'd/([^/]+)/');
    final match = regExp.firstMatch(widget.weddingData['rsvpSheetUrl'] ?? '');
    if (match != null) {
      sheetId = match.group(1)!;
    }
  }

  Future<void> lookupGuest() async {
    setState(() {
      loading = true;
      isFound = false;
      isConfirmed = false;
      invitedEvents = [];
      rsvpChoices = {};
    });

    try {
      final res = await http.get(Uri.parse(googleScriptUrl));
      if (res.statusCode == 200) {
        final List<dynamic> data = jsonDecode(res.body);

        final guest = data.firstWhere(
          (user) =>
              user['Name']?.toString().toLowerCase().trim() ==
                  nameController.text.trim().toLowerCase() &&
              user['Phone']?.toString().replaceAll(RegExp(r'\s+'), '') ==
                  phoneController.text.trim().replaceAll(RegExp(r'\s+'), ''),
          orElse: () => null,
        );

        if (guest != null) {
          final raw = guest['Events']?.toString() ?? '';
          final rawCodes = raw == 'AllEvents'
              ? eventCodeMap.keys.toList()
              : raw.split(',');

          final mappedEvents = rawCodes
              .map((code) => code.trim())
              .where((code) => eventCodeMap.containsKey(code))
              .map((code) => eventCodeMap[code]!)
              .toList();

          setState(() {
            isFound = true;
            allowedGuests = int.tryParse(guest['AllowedGuests'].toString());
            selectedGuestCount = 1;
            isConfirmed = guest['RSVPStatus'] == 'Confirmed';
            invitedEvents = mappedEvents;
            rsvpChoices = {for (var e in mappedEvents) e: ''};
            currentQuestionIndex = 0;
          });
        } else {
          setState(() {
            statusMessage = "Guest not found. Please check your details.";
          });
        }
      } else {
        setState(() {
          statusMessage = "Server error: ${res.statusCode}";
        });
      }
    } catch (e) {
      setState(() {
        statusMessage = "Unexpected error: $e";
      });
    } finally {
      setState(() => loading = false);
    }
  }

  Future<void> submitRSVP() async {
    setState(() => loading = true);

    final confirmedEvents = rsvpChoices.entries
        .where((e) => e.value == 'yes')
        .map((e) => e.key)
        .toList();

    final body = jsonEncode({
      'name': nameController.text.trim(),
      'phone': phoneController.text.trim(),
      'rsvp': confirmedEvents.isNotEmpty,
      'guestsAttending': confirmedEvents.isNotEmpty ? selectedGuestCount : 0,
      'eventsConfirmed': confirmedEvents,
    });

    try {
      final response = await http.post(
        Uri.parse(googleScriptUrl),
        headers: {'Content-Type': 'application/json'},
        body: body,
      );

      if (response.statusCode == 200) {
        setState(() => isConfirmed = true);
      } else {
        setState(() {
          statusMessage = "Failed to submit RSVP: ${response.statusCode}";
        });
      }
    } catch (e) {
      setState(() {
        statusMessage = "Unexpected error: $e";
      });
    } finally {
      setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLastStep = currentQuestionIndex >= invitedEvents.length;

    // ✅ Early return for RSVP confirmed
    if (isConfirmed) {
      return Scaffold(
        backgroundColor: Colors.black,
        appBar: AppBar(
          title: Text('RSVP', style: GoogleFonts.montserrat(color: Colors.white)),
          backgroundColor: Colors.black,
          iconTheme: const IconThemeData(color: Colors.white),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                "✅ RSVP Confirmed!",
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              const SizedBox(height: 10),
              const Text(
                "We can't wait to celebrate with you!",
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  setState(() {
                    isConfirmed = false;
                    rsvpChoices = {for (var e in invitedEvents) e: ''};
                    currentQuestionIndex = 0;
                  });
                },
                child: const Text("Update RSVP"),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: Text('RSVP', style: GoogleFonts.montserrat(color: Colors.white)),
        backgroundColor: Colors.black,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(24),
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    if (!isFound) ...[
                      Form(
                        key: _formKey,
                        child: Column(
                          children: [
                            TextFormField(
                              controller: nameController,
                              decoration: const InputDecoration(labelText: 'Full Name'),
                              validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                            ),
                            const SizedBox(height: 20),
                            TextFormField(
                              controller: phoneController,
                              keyboardType: TextInputType.phone,
                              decoration: const InputDecoration(labelText: 'Phone Number'),
                              validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                            ),
                            const SizedBox(height: 24),
                            ElevatedButton(
                              onPressed: () {
                                if (_formKey.currentState!.validate()) {
                                  lookupGuest();
                                }
                              },
                              child: const Text("Look Up Invitation"),
                            ),
                            if (statusMessage.isNotEmpty)
                              Padding(
                                padding: const EdgeInsets.only(top: 12),
                                child: Text(statusMessage, style: const TextStyle(color: Colors.red)),
                              ),
                          ],
                        ),
                      ),
                    ],
                    if (isFound && allowedGuests != null) ...[
                      Text(
                        '${nameController.text.trim()}${allowedGuests! > 1 ? ' and family' : ''}',
                        style: GoogleFonts.montserrat(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 24),

                      if (!isLastStep)
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Will you attend ${invitedEvents[currentQuestionIndex]}?',
                              style: GoogleFonts.montserrat(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Radio<String>(
                                  value: 'yes',
                                  groupValue: rsvpChoices[invitedEvents[currentQuestionIndex]],
                                  onChanged: (val) {
                                    setState(() => rsvpChoices[invitedEvents[currentQuestionIndex]] = val!);
                                  },
                                ),
                                const Text('Yes', style: TextStyle(color: Colors.white)),
                                Radio<String>(
                                  value: 'no',
                                  groupValue: rsvpChoices[invitedEvents[currentQuestionIndex]],
                                  onChanged: (val) {
                                    setState(() => rsvpChoices[invitedEvents[currentQuestionIndex]] = val!);
                                  },
                                ),
                                const Text('No', style: TextStyle(color: Colors.white)),
                              ],
                            ),
                          ],
                        ),

                      if (isLastStep) ...[
                        Text(
                          'Guests Attending',
                          style: GoogleFonts.montserrat(
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        DropdownButton<int>(
                          dropdownColor: Colors.grey[900],
                          value: selectedGuestCount,
                          onChanged: (val) => setState(() => selectedGuestCount = val!),
                          items: List.generate(allowedGuests!, (i) => i + 1)
                              .map((e) => DropdownMenuItem(
                                    value: e,
                                    child: Text('$e', style: GoogleFonts.montserrat(color: Colors.white)),
                                  ))
                              .toList(),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: rsvpChoices.values.any((v) => v.isNotEmpty)
                              ? submitRSVP
                              : null,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFD8A3A7),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(32),
                            ),
                            padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
                          ),
                          child: const Text("Submit RSVP", style: TextStyle(color: Colors.white)),
                        ),
                      ],

                      const SizedBox(height: 20),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          if (currentQuestionIndex > 0)
                            ElevatedButton(
                              onPressed: () => setState(() => currentQuestionIndex--),
                              child: const Text("Back"),
                            ),
                          if (!isLastStep)
                            ElevatedButton(
                              onPressed: () => setState(() => currentQuestionIndex++),
                              child: const Text("Next"),
                            ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ),
    );
  }
}
