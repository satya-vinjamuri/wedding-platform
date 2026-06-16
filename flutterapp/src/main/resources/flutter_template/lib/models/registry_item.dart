/// Represents a gift registry link.
/// Maps to registries[] in Firestore.
class RegistryItem {
  final String label;
  final String url;

  const RegistryItem({
    required this.label,
    required this.url,
  });

  factory RegistryItem.fromMap(Map<String, dynamic> map) {
    return RegistryItem(
      label: map['label'] as String? ?? '',
      url: map['url'] as String? ?? '',
    );
  }

  Map<String, dynamic> toMap() => {
        'label': label,
        'url': url,
      };
}

/// Represents a single FAQ entry.
/// Maps to faqs[] in Firestore.
class FaqItem {
  final String question;
  final String answer;

  const FaqItem({
    required this.question,
    required this.answer,
  });

  factory FaqItem.fromMap(Map<String, dynamic> map) {
    return FaqItem(
      question: map['question'] as String? ?? '',
      answer: map['answer'] as String? ?? '',
    );
  }

  Map<String, dynamic> toMap() => {
        'question': question,
        'answer': answer,
      };
}

/// Represents a contact person for the wedding.
/// Maps to contactInfo[] in Firestore.
class ContactInfo {
  final String name;
  final String email;
  final String phone;

  const ContactInfo({
    required this.name,
    required this.email,
    required this.phone,
  });

  factory ContactInfo.fromMap(Map<String, dynamic> map) {
    return ContactInfo(
      name: map['name'] as String? ?? '',
      email: map['email'] as String? ?? '',
      phone: map['phone'] as String? ?? '',
    );
  }

  Map<String, dynamic> toMap() => {
        'name': name,
        'email': email,
        'phone': phone,
      };
}
