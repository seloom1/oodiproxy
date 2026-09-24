# OODI Proxy Seloom1

تطبيق Android مبني بـ Capacitor وWireGuard، يدعم استثناء التطبيقات من VPN مع البحث وإظهار أيقونات التطبيقات، ونظام إشعارات تحديث مجاني عبر GitHub.

## بيانات التطبيق

- Package Name: `com.oodiproxyseloom1`
- الإصدار الحالي: `2.0`
- أقل إصدار Android: API 24
- Target SDK: 36

## التحديثات عبر GitHub

ملف `updates.json` هو manifest التحديث. عند إصدار نسخة جديدة، غيّر رقم `version` ورابط APK في الملف، ثم انشر APK كـ GitHub Release. التطبيق يفحص الملف عند التشغيل وكل ست ساعات.

## بناء التطبيق

```bash
npm ci
npm run lint
npm run android:sync
cd android
./gradlew assembleDebug assembleRelease
```

نسخة Release الموقعة للتوزيع تحتاج مفتاح توقيع ثابتاً محفوظاً خارج GitHub. النسخة المرفقة في Release `v2.0` موقعة للتجربة.
