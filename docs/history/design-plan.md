# Unnamed Tracking Plugin System — Design Plan Outline

> Status: agreed implementation design for the plugin-manager work in Rosefall-a/unnamed_tracking_app and the official plugin repository.
>
> This is a design contract, not an instruction to blindly rewrite Plugin API v1. Preserve working contracts where they fit; version or migrate incompatible additions deliberately.

## 1. Goals

The plugin system is a first-class extension platform for Unnamed Tracking, not a collection of isolated plugin pages.

Plugins must be able to:
- run safely with only explicitly granted capabilities;
- remain useful in a sandbox without requiring bubblewrap;
- optionally receive privileged native Vue/JavaScript/CSS integration;
- provide backend functionality through safe namespaced APIs;
- optionally register privileged host-level API routes;
- add native Settings sections and navigation;
- add sidebar entries, contextual actions, overlays, dialogs, page extensions and page replacements;
- use sandboxed iframe frontends when native access is unnecessary;
- request fine-grained user-data access;
- request other plugins as dependencies;
- be installed from uploads, URLs, or catalogues through one lifecycle;
- expose accurate publisher/signature/trust state;
- require administrator password re-entry for dangerous grants to unsigned or unverified packages;
- detect updates, display changelogs, and re-review newly requested permissions;
- support multiple catalogues, with the official catalogue enabled by default;
- provide official reference plugins that reproduce meaningful existing application functionality.

The platform must fail closed. A plugin must not receive a capability merely because a UI requested it, an older version had it, or a package came from a trusted catalogue.

## 2. Core security model

Capability enforcement is the fundamental security boundary.

A plugin manifest declares requested capabilities. Installation previews them. The administrator grants only approved capabilities. Runtime APIs are constructed from the granted set, and every backend operation independently checks grants.

Process isolation is defense-in-depth, not the security model.

### Capability lifecycle

Acquire package -> parse -> validate -> verify signature/integrity -> establish trust -> resolve dependencies -> calculate requested capabilities -> compare with existing grants for updates -> permission review -> password reauthentication when required -> explicit confirmation -> install/update -> activate -> monitor.

Upload, URL, and catalogue acquisition must converge into this state machine after acquisition.

### Plugin identity and installation identity

plugin_id identifies software. installation_id identifies the installed lifecycle instance.

Permissions must be associated with the installed instance or explicitly migrated. Updating a package must not accidentally let a different package inherit grants.

Updates must compare package identity, publisher/signing identity, requested permissions, and dependency constraints.

## 3. Trust model

Distinguish:
- signed and trusted;
- signed but publisher/key unknown;
- signed but invalid;
- unsigned;
- invalid/malformed package.

Catalogue provenance is separate from package signature trust. Being listed in the official catalogue does not itself make an arbitrary package cryptographically trusted.

Every install/update preview should separately show plugin identity, publisher identity, signature presence, signature verification result, source/catalogue, requested permissions, dependencies, version, and changelog when available.

Unsigned/unverified packages requesting highly elevated permissions require:
1. explicit display of elevated permissions;
2. administrator password re-entry;
3. explicit confirmation of granting those permissions to an unverified package.

Publisher identity must never be displayed as verified unless verification actually succeeded.

## 4. Hierarchical permissions

Permissions are a tree. Administrators can approve individual leaves or a whole subtree.

Conceptually:

    Plugin permissions
    ├── User data
    │   ├── Games
    │   │   ├── Read
    │   │   └── Write
    │   ├── Media
    │   │   ├── Read
    │   │   └── Write
    │   ├── Documents
    │   │   └── Read
    │   ├── Sessions
    │   │   ├── Read
    │   │   └── Revoke
    │   └── ...
    ├── Frontend
    │   ├── Add sidebar item
    │   ├── Add settings section
    │   ├── Add overlays
    │   ├── Extend pages
    │   ├── Replace pages
    │   └── Native Vue/JS/CSS integration
    ├── Backend
    │   ├── Plugin-namespaced API routes
    │   ├── Host API routes
    │   └── Full backend access
    ├── Notifications
    │   ├── Send notifications
    │   └── Register notification provider
    └── External access
        └── HTTP

Use the existing capability registry as the starting point instead of creating a parallel permission system.

Parent approval means all children are approved. Fine-grained grants remain possible.

api.full may remain as an exceptional capability, but must be visibly treated as highly dangerous.

New permissions introduced by an update must not silently inherit previous grants.

## 5. Sandboxed and native frontend modes

### Sandboxed frontend

The normal mode remains an iframe/bridge-style sandbox. A plugin can ship a complete Vue frontend without being allowed to mutate the host DOM or import host internals. The bridge exposes only operations represented by granted capabilities.

Bubblewrap/process isolation may be used when available, but security and functionality must not depend on bubblewrap.

### Native frontend

A privileged plugin can receive direct participation in the host Vue application, including JavaScript/CSS and appropriate native APIs.

Native integration is never the default. A plugin may use both native and sandboxed surfaces.

Theme plugins are an intended use case: a future light-mode/theme plugin should be able to alter host styling only after receiving the appropriate privileged frontend capabilities.

## 6. Frontend contribution model

Treat these as distinct concepts:
- navigation contribution;
- Settings section;
- page extension/modification;
- overlay;
- modal/dialog;
- contextual action;
- plugin-owned route;
- page replacement.

### Navigation

Plugins may contribute to main sidebar, Settings sidebar, administration, game context, and media context. Contributions declare display metadata, ordering, target route/page/action, and optional visibility conditions.

### Settings

Plugin configuration is separate from plugin-provided Settings UI.

Configuration belongs in the host Plugins configuration area and should use the application's generated-form style for API keys, secrets, URLs, and feature switches.

A plugin can separately contribute a native Settings section, for example /settings?section=sessions. The host remains responsible for routing and access control.

### Page extensions

Extensions add content/actions without replacing the host page.

### Page replacement

Replacement is a distinct, high-impact permission. Scope it to the target page, for example:
- frontend.page.replace.home
- frontend.page.replace.settings

Avoid a generic unrestricted replace-any-page grant where page-specific permissions are possible.

Replacement conflicts must be deterministic and visible; the host must not silently permit competing replacements.

## 7. Backend integration

Every plugin has a namespaced backend area conceptually under /api/plugins/<plugin-id>/....

This is the normal plugin backend surface.

A privileged plugin may request permission to register direct host routes under the normal application API namespace. The host owns routing, authentication, lifecycle, and authorization; plugins must not arbitrarily mutate the application router.

Backend capabilities must be enforced server-side regardless of frontend behavior.

Backend integration should support authentication context, capability checks, lifecycle state, rate/size limits where appropriate, structured errors, and useful audit/logging for privileged operations.

## 8. Storage and secrets

Plugin storage remains private and quota-controlled.

Secrets are separate from ordinary data and are never exposed by APIs lacking explicit secret access.

Plugin configuration should support API keys, access tokens, URLs, feature switches, and provider settings using the application's secure secret facilities.

## 9. Dependencies

A manifest may declare required and optional plugin dependencies with version constraints.

The installer resolves required dependencies before installation and shows missing dependencies, dependencies that will be installed, versions, and conflicts.

Dependencies never automatically inherit the dependent plugin's permissions. Each plugin receives its own trust and permission review.

Cycles and unsatisfiable constraints fail cleanly.

## 10. Installer architecture

All acquisition sources converge on one canonical installer:
- uploaded .utp;
- URL;
- catalogue.

Canonical stages:

    Acquire
      ↓
    Package extraction / content detection
      ↓
    Manifest validation
      ↓
    Signature + trust verification
      ↓
    Dependency resolution
      ↓
    Permission calculation
      ↓
    Permission delta / risk analysis
      ↓
    Administrator review
      ↓
    Elevated reauthentication when required
      ↓
    Explicit confirmation
      ↓
    Install / update
      ↓
    Activation
      ↓
    Health + lifecycle monitoring

Upload handling should be resilient to harmless filename/extension mistakes. Inspect package content and safely detect/extract archives rather than trusting the filename extension alone. Still fail safely for malformed, oversized, traversal-prone, or otherwise dangerous archives.

## 11. Updates

Installed plugins retain enough source metadata to determine whether newer versions exist.

The system should:
- check configured sources periodically or on demand;
- detect newer versions;
- notify administrators;
- show release notes/changelog;
- show permission changes;
- show dependency changes;
- require review when permissions increase;
- require password reauthentication for dangerous unsigned/unverified permission escalation;
- never silently grant new capabilities.

Changelog retrieval is source-agnostic. GitHub Releases can be an implementation, but the platform should not hard-code GitHub as the only source.

## 12. Multiple catalogues

The official catalogue is enabled by default. Administrators can enable additional catalogue endpoints.

Catalogue metadata should include name, URL, enabled state, priority, trust metadata, last successful check, and last error.

Catalogue trust is not package signature trust. Package integrity/signatures must still be checked independently.

## 13. Lifecycle and failure handling

Plugin states should distinguish at least:
- installed;
- enabled;
- disabled;
- starting;
- running;
- stopping;
- failed;
- quarantined.

Repeated failures or violations should permit disabling/quarantine without damaging the host. Privileged plugin failures must never prevent the main application from starting.

## 14. Official reference plugins

The official repository should contain a small, high-quality set.

### Help Button

A broad showcase of common and privileged UI:
- global overlay;
- modal/dialog;
- toast/notification;
- sidebar;
- Settings;
- Home extension/replacement where appropriate;
- plugin route/navigation;
- contextual action;
- external navigation;
- storage/events/API;
- optionally privileged native frontend behavior.

It should be an obvious showcase, not pretend to be a production feature.

### Jellyfin Media Sync

A serious long-term plugin demonstrating:
- configuration;
- secret storage;
- external HTTP;
- background work;
- media import;
- event/polling integration;
- native UI;
- progress/status;
- persistent state.

### Scoped Document Viewer

Faithfully port the functionality of application PR #241 through plugin APIs, preserving:
- appropriate game-file/document storage;
- ownership/user scoping;
- safe PDF/text handling;
- active-content rejection/sanitization;
- size limits;
- traversal protection;
- explicit errors;
- security tests.

It demonstrates a narrowly scoped sandboxed plugin.

### Self-Service Session Manager

Reach functional parity with application PR #248 rather than remaining a minimized metadata example.

It should cover current-user sessions, listing/filtering, useful metadata, single-session revocation, supported revoke-all behavior, destructive-action confirmation, relevant network metadata, supported anomaly/notification behavior, native Settings integration, and appropriate high-risk permissions.

This is the canonical example of a plugin intentionally requesting powerful session capabilities.

### Small UI/API reference

Retain a minimal example.ui-api-style reference if it remains useful as the smallest protocol example. Remove weak/nonsense examples rather than retaining them just to enlarge the catalogue.

## 15. Documentation

### Main application wiki

Document administrator-facing plugin behavior:
- plugin installation;
- package trust and signatures;
- unsigned plugins;
- hierarchical permissions;
- dangerous permissions;
- password reauthentication;
- sandbox/native modes;
- configuration;
- dependencies;
- updates/changelogs;
- catalogues;
- disabling/quarantine;
- health/logging.

### Plugin repository wiki

Document development:
- getting started;
- architecture;
- manifest;
- capabilities/permissions;
- security;
- sandbox;
- native frontend;
- backend/routes;
- storage/secrets;
- Settings;
- navigation;
- overlays;
- notifications;
- events;
- dependencies;
- updates/changelogs;
- publishing/signing;
- testing;
- official examples.

Documentation must describe implemented contracts, not future aspirations.

## 16. API versioning

The current Plugin API is v1. Do not blindly bump it.

First determine whether additions can remain backwards-compatible. If a contract is materially incompatible, introduce an explicit versioned contract and migration path. Native frontend and backend route contracts deserve particular scrutiny.

## 17. Compatibility and migration

Implementation must:
1. inspect PR #305 before changing architecture;
2. preserve working v1 behavior where possible;
3. reuse existing registries;
4. migrate old manifests deliberately;
5. keep existing examples buildable during transition;
6. avoid compatibility behavior that weakens security;
7. add tests before removing old behavior where practical.

## 18. Testing

Cover:
- denied/granted capabilities;
- hierarchical permission behavior;
- permission deltas on updates;
- unsigned high-risk installs requiring reauthentication;
- invalid/unknown signatures;
- dependency conflicts/cycles;
- malformed and traversal-prone archives;
- namespaced routes;
- privileged host routes;
- native frontend permissions;
- page replacement scope/conflicts;
- Settings/navigation contributions;
- disable/quarantine;
- update detection;
- changelogs;
- catalogue failures;
- sandbox operation without bubblewrap.

Official examples need appropriate functional/security tests.

CI must remain meaningful. Never disable, weaken, skip, or make security checks non-blocking merely to get green CI.

## 19. Implementation sequence

1. Architecture/security/API contracts.
2. Installer/trust/dependency/update lifecycle.
3. Native frontend/integration framework.
4. Backend integration.
5. Help Button + Jellyfin.
6. Document Viewer parity.
7. Session Manager parity.
8. Plugin repository cleanup + documentation/catalogue.
9. Cross-repository integration, CI, migration, and final audit.

Stages 5–7 may run concurrently after stages 1–4. Stage 9 is the final gate.

## 20. Commit strategy

Prefer one substantial commit per coherent stage, or a small number only where logically necessary. Do not create a commit per tiny fix or file. Avoid unrelated refactors.

## 21. Definition of done

Complete only when capability enforcement is authoritative and fail-closed; sandboxed plugins work without bubblewrap; native privileges are explicit; Settings/navigation/extensions/replacements/overlays are first-class; backend routes are safely namespaced; privileged host routes are controlled; all installer sources share one lifecycle; trust is correctly separated; dangerous unsigned/unverified grants require reauthentication; dependencies resolve safely; updates review permission changes; changelogs are visible; multiple catalogues work; official examples demonstrate real functionality; document/session examples have intended parity; documentation is current; existing CI passes without weakening any check.
