import 'package:flutter/material.dart';

class CouplePreviewScreen extends StatelessWidget {
  final String coupleIdOrCode;

  const CouplePreviewScreen({super.key, required this.coupleIdOrCode});

  @override
  Widget build(BuildContext context) {
    // TODO: Fetch actual couple data from Firestore or API
    final coupleData = {
      'bride': 'Jinal',
      'groom': 'Neeraj',
      'date': 'February 20, 2026',
      'location': 'Longwood Gardens, PA',
      'imageUrl': 'https://your-image-url.jpg'
    };

    return Scaffold(
    appBar: AppBar(
        title: Text('${coupleData['bride'] ?? 'Bride'} & ${coupleData['groom'] ?? 'Groom'}'),
    ),
    body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
        children: [
            Image.network(coupleData['imageUrl'] ?? '', height: 200),
            const SizedBox(height: 16),
            Text(
            coupleData['date'] ?? '',
            style: const TextStyle(fontSize: 18),
            ),
            Text(
            coupleData['location'] ?? '',
            style: const TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
            onPressed: () {
                // Navigate to their full app or site
            },
            child: const Text('Enter Wedding App'),
            ),
        ],
        ),
    ),
    );

  }
}
