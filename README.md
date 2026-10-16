# SON 1 SANİYE V10 — Canlı Arena

Karanlık Yağmur odaklı sade ana menü; Oyna / Arkadaşlar / Ligler / Profil.

- Dokuz görünür arena; aynı modda iki cihazla gerçek eşleşme, ortak başlangıç ve 36 hedeflik yarış.
- Arkadaş kodu, iki taraflı arkadaşlık kabulü ve seçilen arenaya davet.
- Türkçe isimli, açıkça etiketli kolay/normal/zor botlar; rakip yoksa isteğe bağlı 20 saniyelik geçiş.
- Bulut profili, 250 XP başına yeni seviye, altı yeni skin; eski koleksiyon korunur.
- Sayfalı tüm ligler, üye adları/seviyeleri ve doğrulanmış insan düellolarından ligler arası puan yarışı.
- Tek başına/yerel seçeneklerinde özgün uzun modlar korunur; online sürümler 12 dalgalık rekabet uyarlamalarıdır.

Gerçek Firebase: `son-1-saniye-78761`, Standard `(default)` / `europe-west1`, ücretsiz Spark. Cloud Functions veya ücretli plan açılmaz. Eski V9.2/V9.3 lig/düello verisi silinmez. Hosting'deki eski sayfa V10 olarak sunulmaz.

Ayrıntılar ve sınırlar: [V10 oyun rehberi](V10_KURULUM_VE_OYUN_REHBERI.md). Fiziksel iki Android cihaz testi yapılmadı. APK bir debug test derlemesidir; önceki test APK'larının imzalarıyla güncelleme uyumu garanti edilmez. Eski uygulamayı kaldırmak anonim oturumu ve yerel ilerlemeyi kaybettirebilir.

## Doğrulama

```sh
npm ci
npx -y firebase-tools@latest emulators:exec --only firestore,auth --project demo-son1-free --config firebase/emulator.json "npm test && node tests/browser-v10.cjs"
python3 tests/test_deploy_free.py
python3 scripts/build_online.py
```

Java 21, Node 22 ve Playwright Chromium gerekir. Android APK ve tek dosyalı HTML aynı gömülü istemciyi kullanır. Doğrulama raporu sürümle birlikte kaydedilir. Hamle tutarlılığı doğrulanır; tam otomasyon/anonim hesap çoğaltma önlemi değildir. Güvenlik kuralları test edilmiş prototiptir.
