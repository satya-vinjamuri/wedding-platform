import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:google_fonts/google_fonts.dart';

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
  int? allowedGuests;
  int selectedGuestCount = 1;
  bool isFound = false;
  bool isConfirmed = false;
  String statusMessage = '';
  bool loading = false;

  List<String> invitedEvents = [];
  Map<String, String> rsvpChoices = {};

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
      setState(() {
        sheetId = match.group(1)!;
      });
    } else {
      debugPrint("No valid sheet ID found");
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
          debugPrint("Guest found: $guest");
          final raw = guest['Events']?.toString() ?? '';
          final rawCodes = raw == 'AllEvents' ? eventCodeMap.keys.toList() : raw.split(',');

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
          });
        } else {
          statusMessage = "Guest not found. Please check your details.";
        }
      } else {
        statusMessage = "Server error: ${res.statusCode}";
      }
    } catch (e) {
      statusMessage = "Unexpected error: $e";
    }

    setState(() => loading = false);
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
        setState(() {
          isConfirmed = true;
        });
      } else {
        statusMessage = "Failed to submit RSVP: ${response.statusCode}";
      }
    } catch (e) {
      statusMessage = "Unexpected error: $e";
    }

    setState(() => loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
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
                    if (isFound && !isConfirmed && allowedGuests != null) ...[
                      const SizedBox(height: 16),
                      Text('${nameController.text.trim()}'
                          '${(allowedGuests ?? 0) > 1 ? ' and family' : ''}', style: GoogleFonts.montserrat(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white), ),
                      const SizedBox(height: 16),
                      ...invitedEvents.map((event) => Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Will you attend $event?', style: GoogleFonts.montserrat(fontWeight: FontWeight.bold, color: Colors.white)),
                              Row(
                                children: [
                                  Radio<String>(
                                    value: 'yes',
                                    groupValue: rsvpChoices[event],
                                    onChanged: (val) {
                                      setState(() => rsvpChoices[event] = val!);
                                    },
                                  ),
                                  const Text('Yes', style: TextStyle(color: Colors.white)),
                                  Radio<String>(
                                    value: 'no',
                                    groupValue: rsvpChoices[event],
                                    onChanged: (val) {
                                      setState(() => rsvpChoices[event] = val!);
                                    },
                                  ),
                                  const Text('No', style: TextStyle(color: Colors.white)),
                                ],
                              ),
                            ],
                          )),
                      const SizedBox(height: 12),
                      Text('Guests Attending', style: GoogleFonts.montserrat(fontWeight: FontWeight.bold, color: Colors.white)),
                      DropdownButton<int>(
                        value: selectedGuestCount,
                        onChanged: (val) => setState(() => selectedGuestCount = val!),
                        items: List.generate(allowedGuests!, (i) => i + 1)
                            .map((e) => DropdownMenuItem(value: e, child: Text('$e', style: GoogleFonts.montserrat(color: Colors.white))))
                            .toList(),
                      ),
                      const SizedBox(height: 20),
                      ElevatedButton(
                        onPressed: rsvpChoices.values.any((v) => v.isNotEmpty)
                            ? submitRSVP
                            : null,
                        child: const Text("Submit RSVP"),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFD8A3A7),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(32),
                          ),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 40, vertical: 16),
                        ),                        
                      ),
                    ],
                    if (isConfirmed) ...[
                      const SizedBox(height: 30),
                      const Text("✅ Thank you for confirming your RSVP!", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
                      const Text("We're excited to have you celebrate our special day with us!", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
                      const SizedBox(height: 10),
                      ElevatedButton(
                        onPressed: () {
                          setState(() {
                            isConfirmed = false;
                            rsvpChoices = {for (var e in invitedEvents) e: ''};
                          });
                        },
                        child: const Text("Click here to update your RSVP", style: TextStyle(color: Colors.white)),
                      ),
                    ]
                  ],
                ),
              ),
            ),
    );
  }
}
