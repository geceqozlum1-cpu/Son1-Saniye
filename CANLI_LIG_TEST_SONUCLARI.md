# V9.2 canlı lig doğrulaması

Tarih: 2026-10-16T06:55:20.073Z
Proje: son-1-saniye-78761
Plan: Spark / No-cost ($0/month), Firebase Console ekranında doğrulandı.
Veritabanı: (default), Standard, europe-west1.

- İki ayrı gerçek anonim Authentication hesabı: geçti.
- Birinci kullanıcının lig oluşturması: geçti.
- İkinci kullanıcının davet koduyla katılması: geçti; memberCount=2.
- Aynı günlük parkur: iki kullanıcıda birebir aynı.
- Birinci sonuç: 5900 puan, 12 doğru.
- İkinci sonuç: 500 puan.
- Canlı Firestore onSnapshot sıralaması: iki oyuncu ve güncel skorlar alındı.
- Yinelenen gönderim: aynı skor döndü, maç sayısı 1 kaldı.
- Ücretli işlem: yapılmadı.

Bu kontrol Node Firebase istemcisiyle gerçek sunucu üzerinde yapıldı. Önceki mobil/masaüstü tarayıcı testleri emülatörde geçti. Fiziksel Android cihaz testi bu kontrolde yapılmadı. Test liginin küçük veri kayıtları erişim doğrulaması için projede bırakıldı; herhangi bir gerçek oyuncunun kaydı değiştirilmedi.

APK kaynak commit: ef5066ee11bc9a46bbc19f45a0e2e6eeaca5ef30. APK: SON_1_SANIYE_V9_2_SPARK_TEST.apk; yeni bir kod değişikliği olmadan sunucu etkinleştirildi.

Hosting web sayfası V9.1 olarak kaldı; bu sayfanın yeni lig istemcisi olduğu veya güncellendiği iddia edilmemelidir.
