/// Represents a single event on the wedding itinerary.
/// Maps to entries inside weddingEvents[], brideEvents[], groomEvents[] in Firestore.
class WeddingEvent {
  final String title;
  final String date;
  final String time;
  final String location;
  final String dresscode;
  final String description;

  const WeddingEvent({
    required this.title,
    required this.date,
    required this.time,
    required this.location,
    required this.dresscode,
    required this.description,
  });

  factory WeddingEvent.fromMap(Map<String, dynamic> map) {
    return WeddingEvent(
      title: map['title'] as String? ?? '',
      date: map['date'] as String? ?? '',
      time: map['time'] as String? ?? '',
      location: map['location'] as String? ?? '',
      dresscode: map['dresscode'] as String? ?? '',
      description: map['description'] as String? ?? '',
    );
  }

  Map<String, dynamic> toMap() => {
        'title': title,
        'date': date,
        'time': time,
        'location': location,
        'dresscode': dresscode,
        'description': description,
      };
}
