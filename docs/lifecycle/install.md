# Install, configure, approve and enable

Use a disposable host installation while developing. Uploads, HTTPS URLs and
catalogues converge on the host's canonical installer.

1. Download a versioned `.utp` linked by generated `list.json`, or build a preview.
2. Open **Settings → Plugins → Install plugin** and select the package/source.
3. Review identity, version, compatibility, dependencies, payload/archive hashes,
   signing/publisher status, packaged README, release notes and requested permissions.
4. Approve only the permissions you understand. Complete any host-required elevated
   reauthentication and confirmation. A signed package can still request risky grants.
5. Configure ordinary settings and explicitly save secrets through the plugin's
   supported form/action. Enable the plugin if the chosen host flow leaves it disabled.
6. Check running/healthy state and invoke a small action. Configuration prerequisites
   may be needed before meaningful work even when the worker is already healthy.

Host flows can approve and activate during installation; do not assume every
acquisition leaves the same intermediate UI state. The host enforces pending
permission transactions and never starts an uncommitted candidate.

The entrypoint reports ready and stays alive. **Start** launches the worker;
**stop** terminates it. **Disable** revokes active execution/contributions and
stops workers; **enable** starts an approved installation again. Neither operation
should erase settings, secrets or plugin-owned data. A host/runtime restart
restores enabled workers while preserving the installation identity and data.

For signature or permission failures, use [troubleshooting](../troubleshooting/index.md).
Live install/permission/settings screenshots are produced by the existing real
host acceptance job; [asset provenance](../assets/screenshots/index.md) includes
successful captures and explains how to refresh them.

![Real host permission review](../assets/screenshots/permission-review.png)
