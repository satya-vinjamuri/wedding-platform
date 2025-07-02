import 'package:http/http.dart' as http;
import 'dart:convert';

Future<bool> sendNotificationBlast(String title, String body, String weddingCode) async {
  //const String endpoint = 'http://localhost:4000/send-blast'; 
  const String endpoint = 'https://wedding2026.onrender.com/send-blast';

  try {
    final response = await http.post(
      Uri.parse(endpoint),
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        "title": title,
        "body": body,
        "weddingCode": weddingCode, // ✅ Include the topic slug
      }),
    );

    if (response.statusCode == 200) {
      print('✅ Notification sent successfully: ${response.body}');
      return true;
    } else {
      print('❌ Failed to send notification: ${response.statusCode} - ${response.body}');
      return false;
    }
  } catch (e) {
    print('❌ Error sending notification: $e');
    return false;
  }
}
