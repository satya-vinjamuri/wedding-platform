import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:onesignal_flutter/onesignal_flutter.dart';

class NotificationService {
  static Future<void> initialize(FlutterLocalNotificationsPlugin plugin) async {
    const AndroidInitializationSettings androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const DarwinInitializationSettings iosSettings = DarwinInitializationSettings();

    const InitializationSettings initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await plugin.initialize(initSettings);

    const AndroidNotificationChannel channel = AndroidNotificationChannel(
      'default_channel',
      'Wedding Notifications',
      description: 'Channel for WedDesigner app notifications',
      importance: Importance.high,
    );

    await plugin
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(channel);
  }

  static void setupOneSignal() {
    OneSignal.Debug.setLogLevel(OSLogLevel.verbose);
    OneSignal.initialize('13a8752e-c3eb-4ece-b2d0-7118e3ebadea');
    OneSignal.Notifications.requestPermission(true);

    OneSignal.Notifications.addForegroundWillDisplayListener((event) {
      event.notification.display();
    });

    OneSignal.Notifications.addPermissionObserver((bool hasPermission) {
      print("🔐 OneSignal permission granted: $hasPermission");
    });

    OneSignal.User.pushSubscription.addObserver((state) {
      final id = state.current?.id;
      final token = state.current?.token;
      print("📲 OneSignal subscription updated: ID=$id, Token=$token");
    });
  }
}
