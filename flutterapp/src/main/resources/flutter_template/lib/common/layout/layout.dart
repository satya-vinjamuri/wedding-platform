import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_template/settings.dart';
import 'package:flutter_template/itinerary.dart';
import 'package:flutter_template/our_family.dart';
import 'package:flutter_template/photo_gallery.dart';
import 'package:flutter_template/wedding_party.dart';
import 'package:flutter_template/registry.dart';
import 'package:flutter_template/providers/wedding_config_provider.dart';

/// A single entry in the bottom navigation bar.
class _NavItem {
  final IconData icon;
  final Widget Function() screenBuilder;

  const _NavItem({required this.icon, required this.screenBuilder});
}

class Layout extends StatelessWidget {
  final String title;
  final Widget body;

  const Layout({super.key, required this.title, required this.body});

  @override
  Widget build(BuildContext context) {
    final config = context.watch<WeddingConfigProvider>().config;

    // Only show tabs for screens the couple has actually enabled.
    // Home is always available; everything else is opt-in via config flags.
    final navItems = <_NavItem>[
      const _NavItem(icon: Icons.home, screenBuilder: _popToHome),
      if (config?.enableOurStory ?? true)
        _NavItem(icon: Icons.book, screenBuilder: () => const OurFamilyScreen()),
      if (config?.enableGallery ?? false)
        _NavItem(icon: Icons.photo_album, screenBuilder: () => const DriveGalleryScreen()),
      if (config?.enableItinerary ?? true)
        _NavItem(icon: Icons.calendar_today, screenBuilder: () => const ItineraryScreen()),
      if (config?.enableWeddingParty ?? false)
        _NavItem(icon: Icons.groups, screenBuilder: () => const WeddingPartyScreen()),
      if (config?.enableRegistry ?? false)
        _NavItem(icon: Icons.card_giftcard, screenBuilder: () => const RegistryScreen()),
      if (config?.enableSettings ?? true)
        _NavItem(icon: Icons.settings, screenBuilder: () => const SettingsScreen()),
    ];

    return Scaffold(
      resizeToAvoidBottomInset: false,
      body: Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
        ),
        child: body,
      ),
      bottomNavigationBar: Container(
        color: Colors.black,
        padding: const EdgeInsets.symmetric(vertical: 10),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: navItems
              .map(
                (item) => IconButton(
                  icon: Icon(item.icon, color: Colors.white),
                  onPressed: () {
                    if (item.icon == Icons.home) {
                      Navigator.popUntil(context, (route) => route.isFirst);
                    } else {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(builder: (_) => item.screenBuilder()),
                      );
                    }
                  },
                ),
              )
              .toList(),
        ),
      ),
    );
  }

  // Placeholder builder for Home — never actually invoked since the
  // onPressed handler intercepts the home icon and pops instead.
  static Widget _popToHome() => const SizedBox.shrink();
}
