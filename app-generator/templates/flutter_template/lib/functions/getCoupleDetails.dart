import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

Future<Map<String, dynamic>?> getCoupleDetails(String code) async {
  bool isAdminMode = code.endsWith('-admin');
  if (isAdminMode) {
    code = code.replaceFirst('-admin', '');
  }

  code = code.toLowerCase().replaceAll(RegExp(r'(?<=[a-z])(?=[A-Z])'), '-');
  //const String baseUrl = 'http://localhost:4000/api/wedding';
  const String baseUrl = 'https://wedding2026.onrender.com/api/wedding';  
  //const String baseUrl = 'http://192.168.86.22:4000/api/wedding'; // ✅ Use your Mac's IP here  
  final String endpoint = '$baseUrl/$code';

  try {
    final response = await http.get(
      Uri.parse(endpoint),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      print('✅ Wedding data retrieved: $data');

      final prefs = await SharedPreferences.getInstance();

      // 🔄 Unsubscribe from old topic
      final previousTopic = prefs.getString('subscribedTopic');
      if (previousTopic != null && previousTopic != code) {
        await FirebaseMessaging.instance.unsubscribeFromTopic(previousTopic);
        print("🔕 Unsubscribed from $previousTopic");
      }

      // ✅ Ensure valid FCM token before subscribing
      String? token;
      int retries = 0;
      while (token == null && retries < 5) {
        token = await FirebaseMessaging.instance.getToken();
        if (token == null) {
          await Future.delayed(const Duration(seconds: 1));
          retries++;
        }
      }

      if (token == null) {
        print('❌ FCM token unavailable after 5 retries. Aborting topic subscription.');
        return null;
      }

      print('📲 FCM token: $token');

      // ✅ Subscribe to topic
      await FirebaseMessaging.instance.subscribeToTopic(code);
      print("📲 Subscribed to topic: $code");

      // Save state
      await prefs.setString('subscribedTopic', code);
      await prefs.setBool('isAdmin', isAdminMode);

      return data;
    } else {
      print('❌ Wedding not found: ${response.statusCode} - ${response.body}');
      return null;
    }
  } catch (e) {
    print('❌ Error retrieving wedding data: $e');
    return null;
  }
}
