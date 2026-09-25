# Embedded Shizzi source

This directory contains the embedded Android and Go source from:

- Repository: https://github.com/carlelieser/shizzi
- Upstream commit: `4f8f049`
- Upstream tag: `v0.4.0-rc.3`

The source is integrated as the internal `:shizzi` Android library module. OODI adds a Capacitor bridge and a menu entry that opens the embedded Shizzi UI. The Shizuku service itself remains an external prerequisite and grants this APK permission through the original OODI package `com.oodiproxyseloom1`.

Please review the upstream repository for its current licensing and attribution terms before redistributing modified binaries publicly.
