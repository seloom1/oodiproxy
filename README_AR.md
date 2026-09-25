# OODI Proxy Seloom1

تطبيق Android مبني بـ Capacitor وWireGuard، يوفر اتصال VPN أصلياً، إدارة خوادم WireGuard، استثناء التطبيقات، ومشاركة اتصال الإنترنت عبر Shizuku بدون Root.

## الميزات الحالية

- اتصال WireGuard أصلي مع إدارة عدة خوادم محلياً.
- استيراد إعدادات WireGuard عبر URI أو ملف `.conf` وتصديرها عند الحاجة.
- دعم DNS وMTU وPersistent Keepalive وAllowedIPs.
- مشاركة وبث اتصال الإنترنت عبر Shizuku بدون Root، مع دعم Hotspot حسب إمكانيات الجهاز.
- حذف ميزة NetShare واستبدالها بمكوّن Shizuku مدمج داخل التطبيق.
- قياس قوة إشارة الشريحة وعرض معلومات الشبكة والـSIM.
- استثناء تطبيقات محددة من نفق VPN مع البحث وعرض الأيقونات.
- عرض إحصائيات WireGuard الحقيقية، مدة الاتصال، سرعة النقل، وسجل الاتصالات.
- واجهة عربية RTL تعمل محلياً دون الحاجة إلى الإنترنت لفتح الواجهة.

## إصلاحات واستقرار الاتصال

- إصلاح أخطاء بدء اتصال VPN وفصل النفق وإعادة تشغيله.
- تحسين التعامل مع `AllowedIPs` ومنع إضافة مسار IPv6 تلقائياً للخوادم التي لا تدعمه.
- جعل DNS الافتراضي متوافقاً مع الخوادم IPv4-only باستخدام `1.1.1.1` و`1.0.0.1`.
- إبقاء IPv6 وDNS IPv6 متاحين فقط عندما يصرّح الخادم بهما صراحةً.
- ترحيل إعدادات الخوادم القديمة تلقائياً عند تشغيل التطبيق.
- تحسين استقرار خدمة VPN في الخلفية واستثناء التطبيقات.

## بيانات التطبيق

| العنصر | القيمة |
|---|---|
| Package Name | `com.oodiproxyseloom1` |
| Version Name | `2.1.0` |
| Version Code | `16` |
| أقل إصدار Android | API 30 / Android 11 |
| Target SDK | API 36 |
| Release | [v2.1.0 على GitHub](https://github.com/seloom1/oodiproxy/releases/tag/v2.1.0) |

## متطلبات النظام وShizuku

> **تنبيه مهم:** الإصدار `v2.1.0` يتطلب **Android 11 / API 30 أو أحدث**. أجهزة Android 10 أو الإصدارات الأقدم لن تتمكن من تثبيت هذا التحديث، لأن دمج Shizuku ومكوّن المشاركة الجديد يعتمد على واجهات Android الحديثة.

يجب تثبيت تطبيق **Shizuku** وتشغيله عبر Wireless Debugging أو Root، ثم فتح خيار Shizuku داخل OODI ومنح الصلاحية المطلوبة. ميزة المشاركة تعتمد على إمكانيات الجهاز وإصدار Android، وتستهدف أجهزة ARM64 التي تعمل بنظام Android 11 أو أحدث.

## التحميل

- [تحميل نسخة Release](https://github.com/seloom1/oodiproxy/releases/download/v2.1.0/oodiproxyseloom1-2.1-release.apk)
- [تحميل نسخة Debug](https://github.com/seloom1/oodiproxy/releases/download/v2.1.0/oodiproxyseloom1-2.1-debug.apk)

> نسخة Release المرفوعة حالياً موقعة للتجربة المحلية. للنشر الرسمي على Google Play يجب استخدام keystore ثابت ومفتاح رفع محفوظ بشكل آمن، ويفضل رفع ملف Android App Bundle بصيغة `.aab`.

## البناء محلياً

المتطلبات: Node.js، Android SDK، JDK 21، وAndroid Platform 36.

```bash
npm ci
npm run lint
npm run android:sync
cd android
./gradlew assembleDebug assembleRelease
```

توجد مخرجات APK داخل:

```text
android/app/build/outputs/apk/debug/
android/app/build/outputs/apk/release/
```

## ملاحظات مهمة

- يجب استخدام نفس Package Name ومفتاح التوقيع في الإصدارات اللاحقة حتى تعمل التحديثات فوق النسخة الحالية.
- صلاحية `QUERY_ALL_PACKAGES` مستخدمة لعرض التطبيقات المثبتة وأيقوناتها؛ يجب مراجعة سياسة Google Play قبل النشر.
- نظام GitHub Releases يوفر ملفات التحديث، لكنه لا يثبت APK تلقائياً دون موافقة المستخدم.

## الاعتمادات

- **WireGuard** — تقنية النفق المشفر ومكوّن الاتصال الأساسي.
- **WireGuard Android Tunnel** — مكتبة تشغيل النفق وقراءة الإحصائيات.
- **Shizzi وShizuku** — مشاركة اتصال Wi-Fi وHotspot عبر صلاحيات Shizuku بدون Root.
- **Capacitor وReact وTypeScript وVite** — بناء الواجهة والجسر بين الويب وAndroid.

حقوق وأسماء المشاريع الخارجية محفوظة لأصحابها ومطوريها.
