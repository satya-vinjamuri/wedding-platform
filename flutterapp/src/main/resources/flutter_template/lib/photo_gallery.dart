// Updated photo_gallery.dart with dynamic Drive folder ID

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_template/common/layout/layout.dart';
import 'package:cached_network_image/cached_network_image.dart';

List<String>? cachedImageUrls;

class DriveGalleryScreen extends StatefulWidget {
  const DriveGalleryScreen({super.key});

  @override
  State<DriveGalleryScreen> createState() => _DriveGalleryScreenState();
}

class _DriveGalleryScreenState extends State<DriveGalleryScreen> {
  final String apiKey = 'AIzaSyCQ_bDNPRmrL5ScIJi7ypUQ-vpA5E9UveU';
  final String folderId = '{{DRIVE_FOLDER_ID}}';

  List<String>? imageUrls;
  bool isFetching = false;

  @override
  void initState() {
    super.initState();
    if (cachedImageUrls == null) {
      fetchImagesFromDrive();
    } else {
      imageUrls = cachedImageUrls;
    }
  }

  Future<void> fetchImagesFromDrive() async {
    if (isFetching) return;
    setState(() => isFetching = true);

    final url = 'https://www.googleapis.com/drive/v3/files?q='
        "'$folderId'+in+parents+and+mimeType+contains+'image/'"
        '&key=$apiKey&fields=files(id,name)';

    try {
      final response = await http.get(Uri.parse(url));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final files = data['files'] as List;

        cachedImageUrls = files
            .map<String>((file) =>
                'https://drive.google.com/uc?export=view&id=${file['id']}')
            .toList();

        if (mounted) {
          setState(() => imageUrls = cachedImageUrls);
        }
      } else {
        print('Failed to load images: ${response.body}');
      }
    } catch (e) {
      print('Error fetching images: $e');
    }

    if (mounted) {
      setState(() => isFetching = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Photo Gallery',
          style: GoogleFonts.playfairDisplay(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 22,
          ),
        ),
        backgroundColor: Colors.black,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Layout(
        title: "Photo Gallery",
        body: imageUrls == null
            ? const Center(child: CircularProgressIndicator())
            : RefreshIndicator(
                onRefresh: () async {
                  cachedImageUrls = null;
                  await fetchImagesFromDrive();
                },
                child: GridView.builder(
                  padding: const EdgeInsets.all(12),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 3,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                  ),
                  itemCount: imageUrls!.length,
                  itemBuilder: (context, index) {
                    final url = imageUrls![index];
                    final isCircle = index % 2 == 0;

                    return GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => FullImageView(imageUrl: url),
                          ),
                        );
                      },
                      child: ClipRRect(
                        borderRadius:
                            BorderRadius.circular(isCircle ? 999 : 12),
                        child: CachedNetworkImage(
                          imageUrl: url,
                          fit: BoxFit.cover,
                          placeholder: (context, url) =>
                              const Center(child: CircularProgressIndicator()),
                          errorWidget: (context, url, error) =>
                              const Icon(Icons.error),
                        ),
                      ),
                    );
                  },
                ),
              ),
      ),
    );
  }
}

class FullImageView extends StatelessWidget {
  final String imageUrl;

  const FullImageView({super.key, required this.imageUrl});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Center(
        child: InteractiveViewer(
          child: CachedNetworkImage(
            imageUrl: imageUrl,
            placeholder: (context, url) =>
                const Center(child: CircularProgressIndicator()),
            errorWidget: (context, url, error) =>
                const Icon(Icons.broken_image, color: Colors.white),
          ),
        ),
      ),
    );
  }
}
