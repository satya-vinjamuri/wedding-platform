/// Represents a member of the wedding party (bridesmaid, groomsman, etc.)
/// Maps to weddingParty.bride[] and weddingParty.groom[] in Firestore.
class PartyMember {
  final String name;
  final String role;
  final String relation;
  final String imageUrl;

  const PartyMember({
    required this.name,
    required this.role,
    required this.relation,
    required this.imageUrl,
  });

  factory PartyMember.fromMap(Map<String, dynamic> map) {
    return PartyMember(
      name: map['name'] as String? ?? '',
      role: map['role'] as String? ?? '',
      relation: map['relation'] as String? ?? '',
      imageUrl: map['imageUrl'] as String? ?? '',
    );
  }

  Map<String, dynamic> toMap() => {
        'name': name,
        'role': role,
        'relation': relation,
        'imageUrl': imageUrl,
      };
}

/// Represents a family member (bride's side, groom's side, or pets).
/// Maps to family member arrays in Firestore.
class FamilyMember {
  final String name;
  final String description;
  final String imageUrl;
  final String side; // 'bride', 'groom', or 'pet'

  const FamilyMember({
    required this.name,
    required this.description,
    required this.imageUrl,
    required this.side,
  });

  factory FamilyMember.fromMap(Map<String, dynamic> map, {String side = ''}) {
    return FamilyMember(
      name: map['name'] as String? ?? '',
      description: map['description'] as String? ?? '',
      imageUrl: map['imageUrl'] as String? ?? '',
      side: map['side'] as String? ?? side,
    );
  }

  Map<String, dynamic> toMap() => {
        'name': name,
        'description': description,
        'imageUrl': imageUrl,
        'side': side,
      };
}
