# V9.3 Canlı Düello — 16 Ekim 2026

Gerçek proje: `son-1-saniye-78761`, mevcut Standard `(default)` veritabanı, `europe-west1`. Spark planı korundu; faturalandırma, Cloud Functions veya ücretli sunucu etkinleştirilmedi.

## Gerçek sunucu doğrulaması

07:13:38 UTC: İki bağımsız anonim Authentication hesabı slot 3 üzerinde eşleşti. Sunucu damgalı ortak başlangıç ve aynı parkur alındı. İlk dalga sonucu canlı dinleyiciye iletildi. Nihai sonuçlar **5900 / 500**, iki hesapta `saved`. Aynı sonuç tekrar gönderilince değişmedi. Test yalnızca yeni test hesapları ve maç kayıtları kullandı.

## Otomatik kontroller

- Firestore emülatöründe lig ve düello için 16 senaryo: eşleştirme işlemleri, üçüncü oyuncu yarışı, eşzamanlı gelişlerin yakınsaması, özel sonuçlara erişim, sahte puan/erken sonuç engeli, ayrılma kimliği, bot zorlukları ve mevcut lig korumaları.
- İki bağımsız Chromium oturumu: mobil ve masaüstü ekranında ortak başlangıç, aynı parkur, canlı rakip skoru, sunucuda doğrulanmış kazanan/kaybeden.
- Açıkça etiketli yerel bot, 20 saniyelik otomatik bot geçişi; eski lig oluşturma/katılma, canlı sıralama, yeniden açma, sayfa yenileme ve çevrimdışı hata akışı.
- Ücretsiz dağıtım korumasının dört testi.

## Sınırlar

İki fiziksel Android cihazla test yapılmadı. APK WebView içinde aynı istemciyi kullanır. Canlı düello için iki cihazda da V9.3 gerekir ve iki oyuncu da rakip arama ekranına girmelidir. Eski Hosting sayfası V9.1 olarak kaldı; yeni özellik APK'dadır. Ücretsiz Firestore kotası dolarsa online hizmet durabilir; otomatik ücretlendirme açılmadı. Hamle tutarlılığı doğrulanır ancak istemci otomasyonu ve anonim hesap çoğaltmaya karşı tam koruma yoktur.
