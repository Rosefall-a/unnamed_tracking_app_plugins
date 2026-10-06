# Home Widgets demo

This v1.1 demo registers two optional, account-selected Home widgets:

- **Library glance** reads up to eight games from the authenticated user's public
  library API. The personal item limit follows the user's account. Desktop uses
  two columns; phones use a separate page with rounded touch controls. Refresh,
  opening a game and opening the full library use the public native SDK.
- **Embedded media** demonstrates a responsive video player with ordinary player
  controls. It mounts directly when selected, without a host interstitial.

The plugin requests `games.read`, `frontend.home.widgets` and `frontend.native`.
Native code is privileged and requires explicit administrator approval and
reauthentication. Widget registration does not grant native execution or access
to other users' data. Personal widget options are separate from server-wide
plugin settings and cannot hold secrets.

Build with `python tools/build_packages.py`; development output is
`.validation/dist/`. Until a release is legitimately signed and published, this
source preview is untrusted. Published historical archives remain unchanged.
Install on a v1.1 host, approve its declared scopes, then choose the widgets in
**Home → Customize Home**. Disabling/uninstalling or revoking the widget grant
withdraws live content; the account retains its selection and options.

Do not capture the embedded media widget, video, thumbnail or preview in PR
evidence. Public documentation uses the neutral name **Embedded media demo
widget**. The useful widget may be captured while the media widget is unselected.
