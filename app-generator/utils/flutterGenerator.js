const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');

const TEMPLATE_PATH = path.join(__dirname, '../templates/flutter_template');
const OUTPUT_DIR = path.join(__dirname, '../generated_apps');

async function generateFlutterApp(formData) {
  const appId = uuidv4();
  const appPath = path.join(OUTPUT_DIR, appId);
  //await fs.copy(TEMPLATE_PATH, appPath);

  await fs.copy(TEMPLATE_PATH, appPath, {
    filter: (src) => !src.includes("widget_test.dart")
  });

  // === MAIN.DART ===
  const mainDartPath = path.join(appPath, 'lib', 'main.dart');
  let mainDartContent = await fs.readFile(mainDartPath, 'utf8');

  mainDartContent = mainDartContent
    .replace(/{{BRIDE_NAME}}/g, formData.brideName)
    .replace(/{{GROOM_NAME}}/g, formData.groomName)
    .replace(/{{WEDDING_DATE}}/g, formData.weddingDate)
    .replace(/{{WEDDING_LOCATION}}/g, formData.weddingLocation || '')
    .replace(/{{APP_PASSWORD}}/g, formData.appPassword || '')
    .replace(/{{SELECTED_COLOR}}/g, formData.selectedColor || '#B0848B')
    .replace(/{{SELECTED_FONT}}/g, formData.selectedFont || 'Sans')
    .replace(/{{ENABLE_RSVP_NOTIFICATION}}/g, `${formData.enableRSVPNotification}`)
    .replace(/{{ENABLE_EVENT_NOTIFICATION}}/g, `${formData.enableEventNotification}`)
    .replace(/{{ENABLE_PLANNER_UPDATES}}/g, `${formData.enablePlannerUpdates}`);

  await fs.writeFile(mainDartPath, mainDartContent);

  // === ITINERARY.DART ===
  const itineraryDartPath = path.join(appPath, 'lib', 'itinerary.dart');
  let itineraryDartContent = await fs.readFile(itineraryDartPath, 'utf8');

  const formatEvent = (event) => {
    const name = event.name || '';
    const location = event.location || '';
    const time = event.time || '';
    const date = event.date || '';
    const dressCode = event.dressCode || '';

    return `Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    Text(
      '• ${name}',
      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
    ),
    Text(
      'Location: ${location}',
      style: TextStyle(fontSize: 15),
    ),
    Text(
      'Date: ${date} • Time: ${time}',
      style: TextStyle(fontSize: 15),
    ),
    Text(
      'Dress Code: ${dressCode}',
      style: TextStyle(fontSize: 15, fontStyle: FontStyle.italic),
    ),
    SizedBox(height: 12),
  ],
),`;
  };

  const injectEventSection = (dartContent, sectionLabel, marker, events = []) => {
    if (!events?.length) {
      return dartContent.replace(
        new RegExp(`\\s*Text\\([^)]*${sectionLabel}[^)]*\\)[\\s\\S]*?// ${marker}_END\\s*`),
        ''
      );
    }

    const eventWidgets = events.map(formatEvent).join('\n\n');
    return dartContent.replace(
      new RegExp(`// ${marker}_START[\\s\\S]*?// ${marker}_END`),
      `// ${marker}_START\n${eventWidgets}\n// ${marker}_END`
    );
  };

  itineraryDartContent = injectEventSection(itineraryDartContent, 'Bride Events', 'BRIDE_EVENTS', formData.brideEvents);
  itineraryDartContent = injectEventSection(itineraryDartContent, 'Groom Events', 'GROOM_EVENTS', formData.groomEvents);
  itineraryDartContent = injectEventSection(itineraryDartContent, 'Wedding Events', 'WEDDING_EVENTS', formData.weddingEvents);

  itineraryDartContent = itineraryDartContent
    .replace(/{{WEDDING_DATE}}/g, formData.weddingDate)
    .replace(/{{WEDDING_LOCATION}}/g, formData.weddingLocation || '');

  await fs.writeFile(itineraryDartPath, itineraryDartContent);

  // === OUR_FAMILY.DART ===
  const familyDartPath = path.join(appPath, 'lib', 'our_family.dart');
  let familyDartContent = await fs.readFile(familyDartPath, 'utf8');

  const formatFamilyCard = (name, description, image) => `
  Padding(
    padding: const EdgeInsets.symmetric(vertical: 12),
    child: _buildMemberCard(
      '${name?.replace(/'/g, "\\'") ?? ''}',
      '${description?.replace(/'/g, "\\'") ?? ''}',
      '${image || 'assets/placeholder.jpg'}',
    ),
  ),`;

  const injectFamilyBlock = (dartContent, marker, members = []) => {
    const content = members.map(m =>
      formatFamilyCard(m.name, m.relation || m.description || '', m.image)
    ).join('\n');
    return dartContent.replace(
      new RegExp(`// ${marker}_START[\\s\\S]*?// ${marker}_END`),
      `// ${marker}_START\n${content}\n// ${marker}_END`
    );
  };

  familyDartContent = injectFamilyBlock(familyDartContent, 'BRIDE_SIDE', formData.familyDetails?.bride || []);
  familyDartContent = injectFamilyBlock(familyDartContent, 'GROOM_SIDE', formData.familyDetails?.groom || []);
  familyDartContent = injectFamilyBlock(familyDartContent, 'PET_SIDE', formData.familyDetails?.pets || []);

  await fs.writeFile(familyDartPath, familyDartContent);

  // === WEDDING_PARTY.DART ===
  const partyDartPath = path.join(appPath, 'lib', 'wedding_party.dart');
  let partyDartContent = await fs.readFile(partyDartPath, 'utf8');

  const formatPartyCard = (name, role, relation, image) => `
  Padding(
    padding: const EdgeInsets.symmetric(vertical: 12),
    child: _buildMemberCard(
      '${name?.replace(/'/g, "\\'") ?? ''}',
      '${role?.replace(/'/g, "\\'") ?? ''}',
      '${relation?.replace(/'/g, "\\'") ?? ''}',
      '${image || 'assets/placeholder.jpg'}',
    ),
  ),`;

  const injectPartyBlock = (dartContent, marker, members = []) => {
    const content = members.map(m =>
      formatPartyCard(m.name, m.role || '', m.relation || '', m.image)
    ).join('\n');
    return dartContent.replace(
      new RegExp(`// ${marker}_START[\\s\\S]*?// ${marker}_END`),
      `// ${marker}_START\n${content}\n// ${marker}_END`
    );
  };

  partyDartContent = injectPartyBlock(partyDartContent, 'BRIDAL_PARTY', formData.weddingParty?.bride || []);
  partyDartContent = injectPartyBlock(partyDartContent, 'GROOM_PARTY', formData.weddingParty?.groom || []);

  await fs.writeFile(partyDartPath, partyDartContent);

  // === LAYOUT.DART ===
  const layoutPath = path.join(appPath, 'lib', 'common', 'layout', 'layout.dart');
  let layoutContent = await fs.readFile(layoutPath, 'utf8');

  const screenToggles = {
    enableFamily: {
      importLine: `import 'package:flutter_template/our_family.dart';`,
      widgetPattern: `IconButton\\([^\\)]*OurFamilyScreen\\(\\)[^\\)]*\\)`,
    },
    enableGallery: {
      importLine: `import 'package:flutter_template/photo_gallery.dart';`,
      widgetPattern: `IconButton\\([^\\)]*DriveGalleryScreen\\(\\)[^\\)]*\\)`,
    },
    enableItinerary: {
      importLine: `import 'package:flutter_template/itinerary.dart';`,
      widgetPattern: `IconButton\\([^\\)]*ItineraryScreen\\(\\)[^\\)]*\\)`,
    },
    enableSettings: {
      importLine: `import 'package:flutter_template/settings.dart';`,
      widgetPattern: `IconButton\\([^\\)]*SettingsScreen\\(\\)[^\\)]*\\)`,
    },
  };

  for (const [key, { importLine, widgetPattern }] of Object.entries(screenToggles)) {
    if (!formData[key]) {
      layoutContent = layoutContent.replace(new RegExp(`^${importLine}`, 'm'), `// ${importLine}`);
      layoutContent = layoutContent.replace(
        new RegExp(widgetPattern, 'g'),
        (match) => match.split('\n').map(line => `// ${line}`).join('\n')
      );
    }
  }

  await fs.writeFile(layoutPath, layoutContent);

  // Add this block inside generateFlutterApp
  // === REGISTRY.DART ===
  const registryDartPath = path.join(appPath, 'lib', 'registry.dart');
  let registryDartContent = await fs.readFile(registryDartPath, 'utf8');

  const formatRegistryCard = (label, url) => `
  Padding(
    padding: const EdgeInsets.symmetric(vertical: 12),
    child: _buildRegistryCard(
      '${label?.replace(/'/g, "\\'") ?? ''}',
      '${url?.replace(/'/g, "\\'") ?? ''}',
    ),
  ),`;

  const injectRegistries = (dartContent, marker, registries = []) => {
    const content = registries.map(r => formatRegistryCard(r.label, r.url)).join('\n');
    return dartContent.replace(
      new RegExp(`// ${marker}_START[\\s\\S]*?// ${marker}_END`),
      `// ${marker}_START\n${content}\n// ${marker}_END`
    );
  };

  registryDartContent = injectRegistries(
    registryDartContent,
    'REGISTRY_LIST',
    formData.registries || []
  );

  await fs.writeFile(registryDartPath, registryDartContent);


  // === SHEET ID INJECTION ===
  const sheetIdMatch = (formData.rsvpSheetUrl || '').match(/\/d\/([a-zA-Z0-9-_]+)/);
  const sheetId = sheetIdMatch ? sheetIdMatch[1] : '';

  const rsvpFormPath = path.join(appPath, 'lib', 'rsvpForm.dart');
  let rsvpFormContent = await fs.readFile(rsvpFormPath, 'utf8');
  rsvpFormContent = rsvpFormContent.replace(/{{SHEET_ID}}/g, sheetId);
  await fs.writeFile(rsvpFormPath, rsvpFormContent);

  // === DRIVE FOLDER ID INJECTION ===
  const driveMatch = (formData.galleryDriveUrl || '').match(/\/folders\/([a-zA-Z0-9-_]+)/);
  const driveFolderId = driveMatch ? driveMatch[1] : '';

  const galleryPath = path.join(appPath, 'lib', 'photo_gallery.dart');
  let galleryContent = await fs.readFile(galleryPath, 'utf8');
  galleryContent = galleryContent.replace(/{{DRIVE_FOLDER_ID}}/g, driveFolderId);
  await fs.writeFile(galleryPath, galleryContent);

  // === ZIP ARCHIVE ===
  const zipPath = path.join(OUTPUT_DIR, `${appId}.zip`);
  await zipDirectory(appPath, zipPath);
  await fs.remove(appPath);

  return zipPath;
}

function zipDirectory(sourceDir, outPath) {
  const archive = archiver('zip', { zlib: { level: 9 } });
  const stream = fs.createWriteStream(outPath);

  return new Promise((resolve, reject) => {
    archive
      .directory(sourceDir, false)
      .on('error', err => reject(err))
      .pipe(stream);

    stream.on('close', () => resolve(outPath));
    archive.finalize();
  });
}

module.exports = { generateFlutterApp };
