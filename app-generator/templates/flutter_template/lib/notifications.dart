import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:onesignal_flutter/onesignal_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

class NotificationService extends ChangeNotifier {
  List<Map<String, dynamic>> _notifications = [];

  List<Map<String, dynamic>> get notifications => _notifications;

  Future<void> initNotifications() async {
    final prefs = await SharedPreferences.getInstance();
    final stored = prefs.getStringList('savedNotifications') ?? [];

    _notifications = stored
        .map((json) => jsonDecode(json) as Map<String, dynamic>)
        .toList();

    // Listener for foreground notifications
    OneSignal.Notifications.addForegroundWillDisplayListener((event) async {
      // Show the notification as usual
      event.notification.display();

      final newNotif = {
        'title': event.notification.title,
        'body': event.notification.body,
        'timestamp': DateTime.now().toIso8601String(),
      };

      // Save new notification locally
      _notifications.insert(0, newNotif);
      await prefs.setStringList(
        'savedNotifications',
        _notifications.map((e) => jsonEncode(e)).toList(),
      );

      notifyListeners();
    });

    // Optional: handle background or tapped notifications here if needed
  }

  Future<void> clearNotifications() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('savedNotifications');
    _notifications.clear();
    notifyListeners();
  }
}
