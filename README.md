# OODI Proxy Seloom1

<p align="center">
  <img src="docs/images/upcoming-features.png" alt="ميزات تطبيق OODI Proxy Seloom1" width="520" />
</p>

<p align="center"><strong>تجربة أسرع، تحكم أفضل، واتصال WireGuard أكثر مرونة.</strong></p>

## نبذة عن المشروع

**OODI Proxy Seloom1** هو تطبيق Android مبني على Capacitor وWireGuard لتوفير واجهة عربية عملية لإدارة اتصالات VPN، مع دعم مشاركة اتصال VPN مع الأجهزة الأخرى، مراقبة الاستخدام، وإدارة خوادم WireGuard من مكان واحد.

التطبيق مصمم ليكون خفيفاً وقابلاً للتوسع، ويستخدم Package Name مستقل:

```text
com.oodiproxyseloom1
```

## الميزات الحالية

## المشاريع والمكونات المستخدمة والمساعدون

يعتمد OODI Proxy Seloom1 على مجموعة من المشاريع والمكونات المفتوحة المصدر والتقنيات المساعدة التالية:

| المشروع أو المكون | الاستخدام داخل التطبيق |
|---|---|
| **NetShare No Root** | الاستفادة من فكرة مشاركة اتصال الإنترنت عبر Hotspot وProxy بدون الحاجة إلى صلاحيات Root، مع تطوير واجهة الإعدادات ومراقبة الأجهزة والبيانات داخل التطبيق. |
| **WireGuard** | محرك نفق VPN الأساسي للاتصال بالخوادم وتشفير حركة المرور وإدارة إعدادات Interface وPeer. |
| **WireGuard Android Tunnel** | مكتبة Android المدمجة لتشغيل وإيقاف نفق WireGuard وقراءة إحصائيات النقل. |
| **Capacitor** | الجسر بين واجهة React/TypeScript وكود Android الأصلي، مع Plugins خاصة للـVPN والتطبيقات المثبتة. |
| **React وTypeScript** | بناء واجهة التطبيق ومكونات النوافذ والقوائم وإدارة الحالة والإعدادات. |
| **Vite** | بناء نسخة الويب وتجهيز ملفات التطبيق قبل مزامنتها مع Android. |
| **Android PackageManager** | قراءة التطبيقات القابلة للتشغيل وإظهار أسمائها وأيقوناتها وتمرير الحزم المحددة إلى قائمة استثناءات WireGuard. |
| **GitHub Releases** | استضافة ملفات APK ونسخ الإصدارات وتوفير رابط تحميل مجاني. |
| **GitHub Raw Manifest** | استضافة ملف `updates.json` الذي يستخدمه التطبيق لفحص التحديثات وإظهار إشعار داخل التطبيق. |

### المساعدون وأدوات التطوير

تم استخدام أدوات التطوير والبناء والمراجعة للمساعدة في تجهيز المشروع، وتشمل Android SDK وJDK وGradle وCapacitor CLI وGitHub CLI، إضافة إلى مساعد برمجي لتصميم الواجهة، ربط JavaScript مع Android، اختبار TypeScript، إصلاح أخطاء البناء، وتجهيز التوثيق والإصدارات.

> حقوق وأسماء المشاريع الخارجية تبقى لأصحابها ومطوريها. هذا المشروع يوضح المكونات المستخدمة لأغراض التوثيق والشفافية.

### اتصال WireGuard وإدارة الخوادم

- اتصال WireGuard أصلي عبر خدمة VPN على Android.
- إضافة عدة خوادم WireGuard وإدارتها محلياً.
- استيراد إعدادات WireGuard عبر رابط URI أو ملف إعدادات.
- اختيار الخادم النشط والتبديل بين الخوادم بسهولة.
- اختبار زمن الاستجابة Ping للخوادم واختيار الخادم الأفضل.
- تصدير إعدادات الخادم بصيغة `.conf` أو QR Code.
- حفظ الخوادم والإعدادات محلياً دون الحاجة إلى حساب.
- دعم DNS وMTU وPersistent Keepalive وAllowed IPs.
- خيار تجاوز مسارات الشبكة المحلية عند الحاجة.

### استثناء التطبيقات من VPN

- حقل مخصص في الواجهة الرئيسية لفتح إعدادات الاستثناءات.
- خيار مستقل داخل القائمة المنسدلة.
- عرض التطبيقات القابلة للتشغيل المثبتة على الجهاز.
- إظهار أيقونة التطبيق واسمه وPackage Name.
- البحث باسم التطبيق أو Package Name.
- التطبيقات المحددة تظهر في بداية القائمة.
- عرض عدد التطبيقات المستثناة.
- تمرير القائمة فعلياً إلى WireGuard عبر `ExcludedApplications`، وليس مجرد إعداد شكلي.
- حفظ التطبيقات المختارة محلياً وإعادة استخدامها عند الاتصال التالي.

### مشاركة الإنترنت وHotspot

- مشاركة اتصال VPN مع الأجهزة المتصلة عبر Hotspot.
- دعم Wi-Fi وUSB Tethering حسب إمكانيات الجهاز.
- عرض عدد الأجهزة المتصلة.
- عرض إجمالي البيانات المستخدمة في المشاركة.
- عرض سرعة التنزيل والرفع للأجهزة المشتركة.
- تغيير ثيم بطاقة المشاركة بين Cyan وViolet وGreen.
- إعداد اسم الشبكة وكلمة المرور وخيارات الشبكة من داخل التطبيق.

### الإحصائيات والمراقبة

- عرض عنوان IP الخارجي والدولة عند الاتصال.
- عرض إجمالي التنزيل والرفع من نفق WireGuard.
- عرض مدة الاتصال وسرعة نقل البيانات.
- قراءة إحصائيات WireGuard الحقيقية بدلاً من أرقام تجريبية.
- سجل للاتصالات السابقة مع إمكانية مسحه.
- تحديث معلومات الشبكة يدوياً عند الحاجة.

### التحديثات والإشعارات

- فحص ملف تحديث عام مستضاف مجاناً على GitHub.
- فحص عند تشغيل التطبيق ثم بشكل دوري أثناء تشغيله.
- إشعار داخل التطبيق عند توفر إصدار أحدث.
- عرض عنوان التحديث ورقمه وتفاصيله ورابط تحميل APK.
- دعم التحديث الإجباري عبر `mandatory` في ملف manifest.
- ملف التحديث الحالي:
  [updates.json](updates.json)

### الواجهة وتجربة الاستخدام

- واجهة عربية RTL مناسبة للشاشات الصغيرة.
- تصميم داكن مع بطاقات واضحة وحالات اتصال ملونة.
- حقل استثناء التطبيقات موضوع في أسفل عناصر الواجهة مباشرة فوق قناة التليگرام.
- ألوان الحقول قابلة للتمييز دون سطوع مزعج.
- قائمة منسدلة تجمع إدارة الخوادم والإعدادات والتصدير والاستثناءات.
- دعم صور وأيقونات التطبيقات داخل قائمة الاستثناءات.

## بيانات الإصدار الحالي

| العنصر | القيمة |
|---|---|
| Package Name | `com.oodiproxyseloom1` |
| Version Name | `2.0` |
| Version Code | `6` |
| Minimum Android | API 24 / Android 7.0 |
| Target SDK | API 36 |
| Release | [v2.0 على GitHub](https://github.com/seloom1/oodiproxy/releases/tag/v2.0) |

## التحميل

- [تحميل Release APK](https://github.com/seloom1/oodiproxy/releases/download/v2.0/oodiproxyseloom1-2.0-release.apk)
- [تحميل Debug APK](https://github.com/seloom1/oodiproxy/releases/download/v2.0/oodiproxyseloom1-2.0-debug.apk)

> نسخة Release الحالية موقعة بمفتاح اختبار للتجربة. للنشر الرسمي يجب استخدام مفتاح توقيع ثابت والاحتفاظ به لجميع الإصدارات اللاحقة.

## البناء محلياً

المتطلبات: Node.js، Android SDK، JDK 21، وAndroid Platform 36.

```bash
npm ci
npm run lint
npm run android:sync
cd android
./gradlew assembleDebug assembleRelease
```

مخرجات APK تكون داخل:

```text
android/app/build/outputs/apk/debug/
android/app/build/outputs/apk/release/
```

## نشر تحديث جديد

1. ارفع APK جديداً إلى GitHub Release برقم أعلى، مثل `v2.1`.
2. عدّل `updates.json` إلى `version: "2.1"`.
3. حدّث رابط APK داخل `updates.json`.
4. ادفع التعديل إلى فرع `main`.
5. سيقرأ التطبيق الملف ويعرض إشعار التحديث للمستخدمين.

مثال:

```json
{
  "version": "2.1",
  "title": "تحديث جديد متوفر",
  "message": "تحسينات وإصلاحات جديدة.",
  "url": "https://github.com/seloom1/oodiproxy/releases/download/v2.1/oodiproxyseloom1-2.1-release.apk",
  "publishedAt": "2026-09-24T00:00:00Z",
  "mandatory": false
}
```

## ملاحظات مهمة

- تغيير Package Name أو مفتاح التوقيع يجعل Android يتعامل مع النسخة كتطبيق مختلف.
- يجب استخدام نفس مفتاح التوقيع في كل الإصدارات المستقبلية حتى تعمل التحديثات فوق النسخة الحالية.
- صلاحية `QUERY_ALL_PACKAGES` مستخدمة لعرض التطبيقات المثبتة مع أيقوناتها. عند النشر على Google Play يجب مراجعة سياسة Google الخاصة بهذه الصلاحية.
- نظام GitHub يعرض إشعار التحديث داخل التطبيق عند فتحه أو عند تنفيذ الفحص الدوري؛ لا يثبت APK تلقائياً دون تدخل المستخدم.

## English summary

OODI Proxy Seloom1 is an Arabic RTL Android WireGuard client built with Capacitor. It provides multi-server management, native WireGuard connectivity, hotspot sharing, traffic statistics, app exclusions with searchable app icons, local settings, and a GitHub-hosted in-app update manifest.

The current standalone application ID is `com.oodiproxyseloom1`, version `2.0`, with Android API 24 as the minimum supported version and API 36 as the target SDK.
