// DEPRECATED — per-couple ZIP generation. No longer mounted in app.js.
//
// The old model compiled a unique Flutter binary per couple by injecting
// {{PLACEHOLDER}} values into a template and zipping it for download. The
// Flutter app now reads WeddingConfig from Firestore at runtime instead, so
// this route is dead. See REFACTOR_ROADMAP.md Phase 7.
//
// Safe to delete this file along with utils/flutterGenerator.js,
// templates/, and generated_apps/ — they could not be removed from this
// session due to filesystem permissions, so they're left in place as inert
// code instead.
module.exports = null;
