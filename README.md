# SON 1 SANİYE V9.2 — Spark ligleri

Android WebView oyunu. Çevrim dışı modlar ve V9 ödülleri korunur. Yeni lig istemcisi Cloud Functions kullanmaz: anonim Authentication + Standard Firestore + Hosting ile Spark planına uygundur.

**Canlı durum:** Firebase `son-1-saniye-78761` projesinin mevcut Hosting sürümü eski V9.1'dir. 16 Ekim kontrolünde `(default)` Firestore veritabanı yoktu. V9.2'nin kod ve APK hazırlanması, veritabanının ve kuralların yayımlandığı anlamına gelmez. Mevcut çalışma ortamının Firebase oturumu kaybolduğu için canlı dağıtım ve gerçek sunucu testi bekliyor.

## Ligler
- Kodla oluşturma/katılma; oyuncu başına en fazla 5 lig, lig başına 100 oyuncu.
- Aynı UTC gününde aynı 12 dalgalık parkur; bağımsız maçlar ve canlı sıralama.
- Lig başına günde 20 maç denemesi; yarıda bırakılan maçlar da sayılır.
- Skor ve hamle eşleşmesi, sahiplik, zaman ve kota güvenlik kurallarında denetlenir.
- Yinelenen sonuç gönderimi ikinci puan yazmaz. Başkasının skoru değiştirilemez.
- Bu sistem aynı anda karşılıklı maç değildir; canlı sıralamalı asenkron ligdir.
- Anonim hesap cihazın WebView/tarayıcı verilerine bağlıdır. Otomatik oynayan araçlara karşı tam koruma sunulmaz.

## Kontroller
`npm ci`, ardından Java ile:

```sh
npx -y firebase-tools@latest emulators:exec --only firestore --project demo-son1-free --config firebase/emulator.json "npm test"
```

Arayüz testi (Chromium kuruluysa):

```sh
npx playwright install chromium --only-shell
npx -y firebase-tools@latest emulators:exec --only firestore,auth --project demo-son1-free --config firebase/emulator.json "node tests/browser-online.cjs"
```

`python3 scripts/build_online.py` ortak istemciyi tek HTML'ye gömer. Android ve Hosting aynı dosyayı kullanır. APK CI, güvenlik testleri geçmeden derleme yapmaz.

## Ücretsiz dağıtım
`python3 scripts/deploy_free.py` bağlı hesabı ve `gcloud` gerektirir. Önce faturalandırmanın kapalı olduğunu okur; belirleyemezse değişiklik yapmadan durur. İkinci veritabanı, Enterprise, Functions, faturalandırma bağlantısı veya plan yükseltmesi yapmaz. Sadece tek Standard `(default)` veritabanı, Auth, Firestore kuralları ve Hosting kullanılabilir. Spark kota sınırları dolarsa hizmet durabilir; sınırsız ücretsiz kullanım vaat edilmez.

GitHub `Deploy Spark Free Leagues` iş akışı mevcut WIF kimliğini gerektirir. Kimlik eksikse herhangi bir bulut değişikliği yapmadan durur. Kimlik bilgileri kaynak kodda saklanmaz.
