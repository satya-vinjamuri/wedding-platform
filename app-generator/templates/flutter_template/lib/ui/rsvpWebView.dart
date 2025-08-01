import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class RsvpWebView extends StatefulWidget {
  final String rsvpUrl;

  const RsvpWebView({super.key, required this.rsvpUrl});

  @override
  State<RsvpWebView> createState() => _RsvpWebViewState();
}

class _RsvpWebViewState extends State<RsvpWebView> {
  late final WebViewController _controller;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..loadRequest(Uri.parse(widget.rsvpUrl));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'RSVP',
          style: TextStyle(
            fontSize: 24,
            color: Colors.black,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: WebViewWidget(controller: _controller),
    );
  }
}
