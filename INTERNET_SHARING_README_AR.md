# دمج وظائف NetShare وProxy داخل OODI PROXY SELOOM1

تم دمج وحدة NetShare مستقلة داخل المشروع، مع الحفاظ على إعدادات Hotspot الأصلية الموجودة في القائمة وعدم تعديل مكونها أو خياراتها.

## الوظائف المدمجة

تفتح الشاشة الجديدة من الحقل الموجود تحت **إجمالي البيانات** باسم **مشاركة الإنترنت NetShare**. الشاشة تحتوي على اسم الشبكة، كلمة المرور، بدء وإيقاف المشاركة، عنوان Proxy والمنفذ، تعليمات الأجهزة، وعدادات الاتصال.

على Android تمت إضافة Capacitor plugin باسم `InternetSharing`. عند بدء المشاركة يتأكد التطبيق من وجود نفق WireGuard فعّال، ثم يطلب من Android تشغيل Wi‑Fi tethering، ويشغّل Listener Proxy داخل خدمة WireGuard نفسها على المنفذ `8282`.

طبقة الـProxy الأصلية داخل `SeloomVpnService` أصبحت تدعم:

- HTTPS عبر `CONNECT host:port`.
- HTTP العادي عبر absolute URL مثل `GET http://host/path`.
- تمرير الاتصالات الصادرة عبر نفق WireGuard النشط.
- إيقاف Listener تلقائيًا عند إيقاف الـVPN أو مشاركة الإنترنت.

## ملفات الدمج

- `src/components/NetShareModal.tsx`
- `src/utils/internetSharingBridge.ts`
- `src/components/DeviceInfoBar.tsx`
- `src/App.tsx`
- `android/app/src/main/java/com/seloomwarp/vpn/InternetSharingPlugin.java`
- `android/app/src/main/java/com/seloomwarp/vpn/SeloomVpnService.java`
- `android/app/src/main/java/com/seloomwarp/vpn/MainActivity.java`
- `android/app/src/main/AndroidManifest.xml`

## ما لم يتم تغييره

`src/components/HotspotSettingsModal.tsx` بقي منفصلًا وبحالته الأصلية. إعدادات القائمة القديمة مثل `Bypass LAN route` و`Proxy tethering` لم يتم حذفها أو إعادة ربطها بالشاشة الجديدة.

## البناء والاختبار

فحوصات React/TypeScript وVite نجحت:

```bash
npm run lint
npm run build
```

لبناء APK على جهاز يملك Android SDK:

```bash
npm install
npm run android:sync
cd android
./gradlew assembleDebug
```

يجب اختبار APK على هاتف Android فعلي. Android والشركات المصنعة قد ترفض تشغيل Tethering لتطبيق عادي أو تفرض شاشة موافقة النظام. كما يجب ضبط Proxy على الجهاز المتصل إلى `192.168.49.1:8282` إذا لم يطبّق الجهاز الإعداد تلقائيًا.
