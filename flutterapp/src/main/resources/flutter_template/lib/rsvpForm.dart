import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:google_fonts/google_fonts.dart';

class RSVPFormScreen extends StatefulWidget {
  const RSVPFormScreen({super.key});

  @override
  State<RSVPFormScreen> createState() => _RSVPFormScreenState();
}

class _RSVPFormScreenState extends State<RSVPFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final nameController = TextEditingController();
  final phoneController = TextEditingController();

  int? allowedGuests;
  int selectedGuestCount = 1;
  bool isFound = false;
  bool isConfirmed = false;
  String statusMessage = '';
  bool loading = false;
  String? attendanceChoice;

  // This URL will be injected by the backend with the correct sheet ID
  final String googleScriptUrl =
      'https://script.google.com/macros/s/{{SHEET_ID}}/exec';

  Future<void> lookupGuest() async {
    setState(() {
      loading = true;
      isFound = false;
      isConfirmed = false;
      attendanceChoice = null;
      allowedGuests = null;
    });

    try {
      final response = await http.get(Uri.parse(googleScriptUrl));
      if (response.statusCode == 200) {
        final List<dynamic> users = jsonDecode(response.body);

        final guest = users.firstWhere(
          (user) =>
              user['Name']?.toString().toLowerCase().trim() ==
                  nameController.text.trim().toLowerCase() &&
              user['Phone']?.toString().replaceAll(RegExp(r'\s+'), '') ==
                  phoneController.text.trim().replaceAll(RegExp(r'\s+'), ''),
          orElse: () => null,
        );

        if (guest != null) {
          setState(() {
            isFound = true;
            allowedGuests = int.tryParse(guest['AllowedGuests'].toString());
            selectedGuestCount = 1;
            statusMessage = guest['RSVPStatus'] ?? 'Pending';
            isConfirmed = statusMessage == 'Confirmed';
          });
        } else {
          statusMessage = "Guest not found. Please check your details.";
        }
      } else {
        statusMessage = "Server error: ${response.statusCode}";
      }
    } catch (e) {
      statusMessage = "Unexpected error: $e";
    }

    setState(() => loading = false);
  }

  Future<void> confirmRSVP() async {
    setState(() => loading = true);

    final name = nameController.text.trim();
    final phone = phoneController.text.trim();

    final body = jsonEncode({
      'name': name,
      'phone': phone,
      'rsvp': attendanceChoice == "yes",
      'guestsAttending': attendanceChoice == "yes" ? selectedGuestCount : 0
    });

    try {
      final response = await http.post(
        Uri.parse(googleScriptUrl),
        headers: {'Content-Type': 'application/json'},
        body: body,
      );

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Thank you for confirming your RSVP!"),
            backgroundColor: Colors.black,
          ),
        );
        Navigator.pop(context);
      } else {
        setState(() {
          statusMessage = "Error submitting RSVP: ${response.statusCode}";
        });
      }
    } catch (e) {
      setState(() {
        statusMessage = "Unexpected error: $e";
      });
    }

    setState(() => loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('RSVP',
            style: GoogleFonts.playfairDisplay(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 22,
            )),
        backgroundColor: Colors.black,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: loading
            ? const Center(
                child: CircularProgressIndicator(color: Colors.black))
            : SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (!isFound) ...[
                      Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            TextFormField(
                              controller: nameController,
                              style: const TextStyle(fontSize: 22),
                              decoration: const InputDecoration(
                                labelText: 'Full Name',
                                labelStyle: TextStyle(fontSize: 16),
                                contentPadding: EdgeInsets.symmetric(
                                    vertical: 20, horizontal: 12),
                              ),
                              validator: (value) => value == null || value.isEmpty
                                  ? 'Required'
                                  : null,
                            ),
                            const SizedBox(height: 20),
                            TextFormField(
                              controller: phoneController,
                              keyboardType: TextInputType.phone,
                              style: const TextStyle(fontSize: 22),
                              decoration: const InputDecoration(
                                labelText: 'Phone Number',
                                labelStyle: TextStyle(fontSize: 16),
                                contentPadding: EdgeInsets.symmetric(
                                    vertical: 20, horizontal: 12),
                              ),
                              validator: (value) => value == null || value.isEmpty
                                  ? 'Required'
                                  : null,
                            ),
                            const SizedBox(height: 28),
                            ElevatedButton(
                              onPressed: () {
                                if (_formKey.currentState!.validate()) {
                                  lookupGuest();
                                }
                              },
                              child: Text(
                                'Look Up Invitation',
                                style: GoogleFonts.playfairDisplay(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            if (statusMessage.isNotEmpty) ...[
                              const SizedBox(height: 16),
                              Text(
                                statusMessage,
                                style: const TextStyle(
                                  color: Colors.redAccent,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w500,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: 24),
                    if (isFound && allowedGuests != null && !isConfirmed) ...[
                      Text(
                        nameController.text.trim() +
                            ((allowedGuests ?? 0) > 1 ? ' and family' : ''),
                        style: GoogleFonts.playfairDisplay(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 20),
                      const Text('Will you be attending?',
                          style: TextStyle(
                              fontSize: 18, fontWeight: FontWeight.w500)),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Radio<String>(
                            value: 'yes',
                            groupValue: attendanceChoice,
                            onChanged: (value) =>
                                setState(() => attendanceChoice = value),
                          ),
                          const Text('Can Make It'),
                          Radio<String>(
                            value: 'no',
                            groupValue: attendanceChoice,
                            onChanged: (value) =>
                                setState(() => attendanceChoice = value),
                          ),
                          const Text("Can't Make It"),
                        ],
                      ),
                      if (attendanceChoice == 'yes') ...[
                        const SizedBox(height: 12),
                        const Text('How many guests are attending?'),
                        DropdownButton<int>(
                          value: selectedGuestCount,
                          onChanged: (int? newValue) {
                            setState(() {
                              selectedGuestCount = newValue!;
                            });
                          },
                          items: List.generate(
                            allowedGuests!,
                            (index) => DropdownMenuItem(
                              value: index + 1,
                              child: Text('${index + 1}'),
                            ),
                          ),
                        ),
                      ],
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: attendanceChoice != null ? confirmRSVP : null,
                        child: const Text('Submit RSVP'),
                      ),
                    ],
                    if (isConfirmed) ...[
                      const SizedBox(height: 20),
                      const Text(
                        'Thank you for confirming your RSVP. We’re excited to celebrate with you!',
                        style: TextStyle(
                            fontSize: 18, fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 20),
                      ElevatedButton(
                        onPressed: () {
                          setState(() {
                            isConfirmed = false;
                            attendanceChoice = null;
                          });
                        },
                        child: const Text('Change RSVP'),
                      ),
                    ]
                  ],
                ),
              ),
      ),
    );
  }
}
