#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
# Vite 8 requires the newer esbuild peer range.
node -e "const fs=require('fs'); const p=JSON.parse(fs.readFileSync('package.json')); p.devDependencies.esbuild='^0.28.2'; fs.writeFileSync('package.json', JSON.stringify(p,null,2)+'\\n')"
# Official WireGuard userspace tunnel backend.
grep -q "com.wireguard.android:tunnel" android/app/build.gradle || sed -i '/implementation project('\''\:capacitor-android'\'')/a\    implementation "com.wireguard.android:tunnel:1.0.20260102"' android/app/build.gradle
# The VPN service itself is the foreground service; no connected-device type is needed.
sed -i 's/ android:foregroundServiceType="connectedDevice"//' android/app/src/main/AndroidManifest.xml
sed -i '/FOREGROUND_SERVICE_CONNECTED_DEVICE/d' android/app/src/main/AndroidManifest.xml
