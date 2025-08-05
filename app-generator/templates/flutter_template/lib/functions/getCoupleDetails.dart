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
  const String baseUrl = 'https://wedding-platform.onrender.com/api/wedding';
  final String endpoint = '$baseUrl/$code';
  print("Retrieving wedding data from $endpoint");
  print("isAdminMode: $isAdminMode");
  print("code: $code");

  try {
    final response = await http.get(
      Uri.parse(endpoint),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      print('✅ Wedding data retrieved: $data');

      final prefs = await SharedPreferences.getInstance();

      // ✅ Subscribe to topic (no unsubscribe here to allow multiple)
      await FirebaseMessaging.instance.subscribeToTopic(code);
      print("📲 Subscribed to topic: $code");

      // ✅ Save to list of wedding codes
      List<String> savedCodes = prefs.getStringList('weddingCodes') ?? [];
      if (!savedCodes.contains(code)) {
        savedCodes.add(code);
        await prefs.setStringList('weddingCodes', savedCodes);
        print("📌 Saved wedding codes: $savedCodes");
      }

      // ✅ Save the active code
      await prefs.setString('activeWeddingCode', code);
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

