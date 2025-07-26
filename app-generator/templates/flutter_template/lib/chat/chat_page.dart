import 'package:flutter/material.dart';
import 'package:stream_chat_flutter/stream_chat_flutter.dart';

class ChatPage extends StatelessWidget {
  const ChatPage({super.key});
X
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const StreamChannelHeader(),
      body: Column(
        children: const [
          Expanded(child: MessageListView()),
          MessageInput(),
        ],
      ),
    );
  }
}
