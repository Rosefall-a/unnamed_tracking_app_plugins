# Jellyfin Media Sync

Synchronizes Jellyfin movies into the signed-in user's Unnamed Tracking media library.

The server URL and user ID use plugin settings. The Jellyfin API key/password uses
private plugin storage. Sync performs an external Jellyfin API read, imports
normalized metadata through the host media API, and can poll host activity in
the background.
