import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:weddesigner/main.dart';
import 'package:weddesigner/functions/sendNotifications.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:weddesigner/ui/app.dart';

class SettingsScreen extends StatefulWidget {
  final Map<String, dynamic> weddingData;

  const SettingsScreen({Key? key, required this.weddingData}) : super(key: key);

  @override
  _SettingsScreenState createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  static const configuredPassword = '{{APP_PASSWORD}}';
  bool notificationsEnabled = false;
  bool isAdmin = false;
  String get weddingCode => widget.weddingData['weddingCode'] ?? 'default';

  bool get passwordRequired =>
      configuredPassword.isNotEmpty &&
      configuredPassword != '{{APP_PASSWORD}}';

  @override
  void initState() {
    super.initState();
    _loadNotificationPreference();
    _loadAdminMode();
  }

  Future<void> _loadAdminMode() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      isAdmin = prefs.getBool('isAdmin') ?? false;
    });
  }  

  Future<void> _loadNotificationPreference() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      notificationsEnabled = prefs.getBool('notifications_$weddingCode') ?? false;
    });
  }

  Future<void> _toggleNotifications(bool value) async {
    debugPrint("Enable Notifications $weddingCode: $value");
    final prefs = await SharedPreferences.getInstance();
    final topic = 'wedding_$weddingCode';

    if (value) {
      await FirebaseMessaging.instance.subscribeToTopic(topic);
    } else {
      await FirebaseMessaging.instance.unsubscribeFromTopic(topic);
    }

    await prefs.setBool('notifications_$weddingCode', value);

    setState(() {
      notificationsEnabled = value;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          value ? "✅ Notifications enabled for this wedding" : "🔕 Notifications disabled",
        ),
      ),
    );
  }


  Future<void> _lockApp(BuildContext context) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => const StyledLandingPage()),
      (route) => false,
    );
  }


  Future<void> _showCustomBlastDialog() async {
    final titleController = TextEditingController();
    final bodyController = TextEditingController();

    final String? weddingCode = widget.weddingData['websiteSlug'];

    if (weddingCode == null || weddingCode.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("❌ Wedding code not found.")),
      );
      return;
    }

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Send Custom Notification', style: TextStyle(fontWeight: FontWeight.bold,  color: Colors.white)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: titleController,
              decoration: const InputDecoration(labelText: 'Notification Title'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: bodyController,
              decoration: const InputDecoration(labelText: 'Notification Body'),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              final success = await sendNotificationBlast(
                titleController.text.trim(),
                bodyController.text.trim(),
                weddingCode, // ✅ pulled from weddingData
              );
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(success ? "✅ Notification sent!" : "❌ Failed to send")),
              );
            },
            child: const Text('Send'),
          ),
        ],
      ),
    );
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F5F1),
      appBar: AppBar(
        title: Text(
          'Settings',
          style: GoogleFonts.montserrat(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 22,
          ),
        ),
        backgroundColor: Colors.black,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (passwordRequired) ...[
              ElevatedButton.icon(
                onPressed: () => _lockApp(context),
                icon: const Icon(Icons.lock),
                label: Text(
                  'Lock App (Require Re-authentication)',
                  style: GoogleFonts.montserrat(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
              const SizedBox(height: 32),
            ],

            // 🔔 Notifications toggle
            SwitchListTile(
              title: Text(
                'Enable Notifications',
                style: GoogleFonts.montserrat(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: Colors.black,
                ),
              ),
              value: notificationsEnabled,
              onChanged: _toggleNotifications,
              activeColor: Colors.black,
            ),

            const SizedBox(height: 24),

            // Save to device (Optional)
            ElevatedButton.icon(
              onPressed: () async {
                final prefs = await SharedPreferences.getInstance();
                await prefs.remove('activeWeddingCode'); // <-- Remove only the active one

                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (_) => const StyledLandingPage()),
                  (route) => false,
                );
              },
              icon: const Icon(Icons.search),
              label: Text(
                'Search for New Couple',
                style: GoogleFonts.montserrat(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.black,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ),
            if (isAdmin == true) ...[
              const SizedBox(height: 16),              
              Text('Admin Tools',
                  style: GoogleFonts.playfairDisplay(
                      fontSize: 20, fontWeight: FontWeight.bold, color: Colors.black)),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: _showCustomBlastDialog,
                icon: const Icon(Icons.send),
                label: Text('Send Notification Blast',
                    style: GoogleFonts.playfairDisplay(fontSize: 16, fontWeight: FontWeight.w500)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.deepPurple,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
              ),
              const SizedBox(height: 32),
            ],

            const SizedBox(height: 32),

            ExpansionTile(
              title: Text(
                'FAQs',
                style: GoogleFonts.montserrat(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ),
              children: [
                ListTile(
                  title: Text(
                    'Q: How do I RSVP?\nA: Tap on the RSVP button from the home screen and follow the prompts.',
                    style: GoogleFonts.montserrat(fontSize: 16),
                  ),
                ),
                ListTile(
                  title: Text(
                    'Q: Who do I contact for issues?\nA: See the contact section below.',
                    style: GoogleFonts.montserrat(fontSize: 16),
                  ),
                ),
              ],
            ),

            const Divider(thickness: 1.0),

            ExpansionTile(
              title: Text(
                'Contact Information',
                style: GoogleFonts.montserrat(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ),
              children: [
                ListTile(
                  title: Text(
                    'Neeraj: neeraj@example.com\nJinal: jinal@example.com',
                    style: GoogleFonts.montserrat(fontSize: 16),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
