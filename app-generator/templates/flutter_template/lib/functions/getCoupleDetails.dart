import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
Future<Map<String, dynamic>?> getCoupleDetails(String code) async {
  bool isAdminMode = code.endsWith('-admin');
  if (isAdminMode) {
    code = code.replaceFirst('-admin', ''); // remove the admin suffix
  }

  code = code.toLowerCase().replaceAll(RegExp(r'(?<=[a-z])(?=[A-Z])'), '-');
  const String baseUrl = 'http://localhost:4000/api/wedding';
  final String endpoint = '$baseUrl/$code';

  try {
    final response = await http.get(
      Uri.parse(endpoint),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      print('✅ Wedding data retrieved: $data');

      // Persist admin mode to SharedPreferences or a global provider
      final prefs = await SharedPreferences.getInstance();
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

