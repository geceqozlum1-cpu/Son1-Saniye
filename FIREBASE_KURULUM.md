# Firebase V9.2 — ücretsiz kurulum

Hedef proje: `son-1-saniye-78761`. Android uygulama kimliği: `com.sonbirsaniye.arcade`. WebView içindeki JavaScript Firebase SDK'sı kullanılır; Analytics Gradle eklentisi ligleri çalıştırmak için gerekli değildir. Firebase'deki `Son.Saniye` adlı ayrı Android kaydı bu APK'nin paket adıyla eşleşmez, fakat web SDK bağlantısı o kaydı kullanmaz.

Eski Cloud Functions dağıtımı ücretsiz çözümden çıkarıldı. Yeni veri alanları: `freeLeagues`, `freeProfiles`, `profiles/{uid}/freeLeagues`. Eski `leagues` istemcileri yeni kurallarla yazma izni alamaz; V9.2 gereklidir.

Yetkilendirilmiş hesapla `scripts/deploy_free.py` kullanılır. Betik:
1. Faturalandırmanın kapalı olduğunu `gcloud billing projects describe` ile doğrular.
2. Veritabanlarını listeler; var olan tek Standard `(default)` veritabanını kullanır. Hiç veritabanı yoksa ücretsiz ilk Standard veritabanını `europe-west1` bölgesinde oluşturur. Başka veritabanı varsa ikinciyi oluşturmaz.
3. Auth, kurallar ve Hosting'i yayımlar. Functions veya diğer ücretli ürünleri dağıtmaz.

Dış kimlik gereksinimi: GitHub iş akışı için `GCP_WORKLOAD_IDENTITY_PROVIDER` ve `GCP_DEPLOY_SERVICE_ACCOUNT` değişkenleri yetkili Google hesabıyla kurulmuş olmalı. Bunlar uygulama yapılandırması veya kullanıcıdan istenen kod değildir. Mevcut oturum bu kimliklere erişemiyorsa yayımlama gerçekleşmez.

16 Ekim 2026 canlı doğrulaması: Firebase Console oturumu yeniden açıldı. Spark planında `(default)` Standard veritabanı `europe-west1` bölgesinde, üretim modu ve ücretli yedeklemeler kapalı olarak oluşturuldu. Kaynak depodaki V9.2 kuralları yayımlandı. İki gerçek anonim kullanıcıyla lig oluşturma/katılma, ortak parkur, 5900/500 puan kaydı ve anlık sıralama başarıyla doğrulandı. Aynı maç tekrar gönderildiğinde played=1 ve puan değişmedi. Faturalandırma bağlanmadı, Blaze planına geçilmedi. V9.2 APK artık mevcut sunucuyu kullanabilir.

Kalan sınır: Firebase Hosting eski V9.1 sürümündedir. Cloud Shell bu tarayıcıda Site Unavailable yanıtı verdiğinden ve GitHub WIF/CLI yetkilendirmesi kurulmadığından web arayüzünün güncellenmesi tamamlanmadı. Fiziksel iki telefon testi yapılmadı.
