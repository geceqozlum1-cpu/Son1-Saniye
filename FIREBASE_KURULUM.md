# Firebase V9.2 — ücretsiz kurulum

Hedef proje: `son-1-saniye-78761`. Android uygulama kimliği: `com.sonbirsaniye.arcade`. WebView içindeki JavaScript Firebase SDK'sı kullanılır; Analytics Gradle eklentisi ligleri çalıştırmak için gerekli değildir. Firebase'deki `Son.Saniye` adlı ayrı Android kaydı bu APK'nin paket adıyla eşleşmez, fakat web SDK bağlantısı o kaydı kullanmaz.

Eski Cloud Functions dağıtımı ücretsiz çözümden çıkarıldı. Yeni veri alanları: `freeLeagues`, `freeProfiles`, `profiles/{uid}/freeLeagues`. Eski `leagues` istemcileri yeni kurallarla yazma izni alamaz; V9.2 gereklidir.

Yetkilendirilmiş hesapla `scripts/deploy_free.py` kullanılır. Betik:
1. Faturalandırmanın kapalı olduğunu `gcloud billing projects describe` ile doğrular.
2. Veritabanlarını listeler; var olan tek Standard `(default)` veritabanını kullanır. Hiç veritabanı yoksa ücretsiz ilk Standard veritabanını `europe-west1` bölgesinde oluşturur. Başka veritabanı varsa ikinciyi oluşturmaz.
3. Auth, kurallar ve Hosting'i yayımlar. Functions veya diğer ücretli ürünleri dağıtmaz.

Dış kimlik gereksinimi: GitHub iş akışı için `GCP_WORKLOAD_IDENTITY_PROVIDER` ve `GCP_DEPLOY_SERVICE_ACCOUNT` değişkenleri yetkili Google hesabıyla kurulmuş olmalı. Bunlar uygulama yapılandırması veya kullanıcıdan istenen kod değildir. Mevcut oturum bu kimliklere erişemiyorsa yayımlama gerçekleşmez.

16 Ekim 2026 durumu: Kaynaklar ve emülatör testleri hazır; mevcut Firebase CLI oturumu yok. Canlı veritabanı oluşturma, kuralların yayını ve iki gerçek kullanıcıyla sunucu testi yapılmadı. Yeni APK, bu işlemler tamamlanmadan çalışan çevrim içi yayın olarak tanıtılmamalı.
