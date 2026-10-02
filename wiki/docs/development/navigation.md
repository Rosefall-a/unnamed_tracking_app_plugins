# Navigation: expose a declared page

## Goal

Make a plugin page discoverable in the host sidebar.

## Prerequisites

Create a complete declarative page as in Library Summary. Add
`frontend.navigation.main` v1 and a matching rationale to the manifest.

## Minimal configuration

For the existing `summary` page in `ui.json`, add:

```json
{"id": "summary", "title": "Library Summary", "actions": ["summarize"], "navigation": {"sidebar": true}}
```

Keep `summary` in `manifest.ui.pages`. UI/API demonstrates this form. For a
named contributed route use Help Button's `navigation[]` and `routes[]` declarations:

```json
{
  "navigation": [{"id": "summary-link", "location": "main.sidebar", "label": "Library Summary", "route_id": "summary-route"}],
  "routes": [{"id": "summary-route", "path": "summary", "page_id": "summary"}]
}
```

The latter also needs `frontend.routes` v1. The relative route is scoped below
the plugin's own URL. Settings navigation uses `frontend.navigation.settings`
and a `settings_section_id`; it is a separate contribution.

## Test command

```sh
python tools/check_source_layout.py
python -m pytest tests/test_help_button.py -k contributions
```

Build and validate your changed package, approve the navigation grant, then open
its sidebar item. Disable the plugin and check the item disappears.

## Expected result

The source validator accepts real linked page/route IDs. The host renders the
approved item and hides it after disable or denied access. Local tests validate
declarations; effective filtering is a host check.

## Common mistakes

Linking a nonexistent page or route; assuming an ordinary settings form creates
a host Settings section; using absolute host paths to take over navigation;
requesting native authority solely for a declarative sidebar item.
