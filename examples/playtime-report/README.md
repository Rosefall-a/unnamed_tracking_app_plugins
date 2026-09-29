# Playtime Report

A real, small plugin rather than a protocol stub.

On startup it asks the host for the user's game library, calculates total playtime and the ten most-played games, and persists the resulting report in its own storage namespace.

It demonstrates a normal plugin pattern:

1. request an approved core capability;
2. perform application-specific logic entirely inside the plugin;
3. persist only plugin-owned data;
4. report readiness to the host.

It does not implement game storage, lifecycle management, or the plugin gateway itself.
