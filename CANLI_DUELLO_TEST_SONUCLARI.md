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

## APK derlemesi ve kurulum sınırı

GitHub Actions çalışması `38865971605`: testler ve APK üretimi başarılı. Commit `f28b77fe354016b92d830d8faa0ce6abf60b59d0`, artifact `12031158119`. APK SHA-256: `77a104150ffca67f1cba7673595fb3d8f9c3f820d7ba829202eaee3a33262bee`. APK içinde V9.3, düello modülleri ve gerçek Firebase proje kimliği doğrulandı.

Bu bir test APK'sıdır. Önceki V9.2 test APK'sı ile V9.3 farklı debug sertifikaları taşır; V9.2 üzerine doğrudan güncelleme kurulamaz. Eski uygulamayı kaldırmak yerel ilerlemeyi ve anonim oturumu kaybettirir. Uygulama otomatik kaldırılmadı ve kullanıcı verisi silinmedi. Fiziksel cihaz kurulumu doğrulanmadı.
