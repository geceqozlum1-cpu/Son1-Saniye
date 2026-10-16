# V10 Doğrulama Raporu — 16 Ekim 2026

## Gerçek Firebase

Proje `son-1-saniye-78761`, Standard `(default)`, `europe-west1`. V10 kuralları 11:00 Türkiye saatiyle yayımlandı. Spark planı korundu; ücretli plan/Cloud Functions/faturalandırma açılmadı.

İki bağımsız anonim hesap: profil, karşılıklı arkadaşlık kabulü ve davet geçti. Dokuz modun tamamında hedefli eşleşme, aynı parkur, 36 hedeflik sonucun sunucuda doğrulanması, XP ve tek seferlik ödül kaydı geçti. Sistem Bağlantı Testi liginde 18 oyuncu sonucu toplam 190.400 puan yazdı. A hesabı seviye 12'ye ulaştı; açılan Buz Kristali skini kaydedildi. Aynı ödül yeniden istendiğinde ikinci kez XP/lig puanı yazılmadı.

| Arena | Test A puanı | XP |
|---|---:|---:|
| fall | 18250 | 332 |
| classic | 18300 | 333 |
| rise | 18450 | 334 |
| sync | 16750 | 317 |
| daily | 18850 | 338 |
| endless | 17400 | 324 |
| challenge | 18650 | 336 |
| course | 18450 | 334 |
| party | 18650 | 336 |

## Tek HTML ile uçtan uca canlı test

İki ayrı Chromium oturumu aynı HTML dosyasını `file://` üzerinden açtı. Gerçek Firebase anonim oturumu/profil kaydı, arkadaş koduyla istek, karşı tarafın kabulü, davetle eşleşme ve Karanlık Yağmur maçı tamamlandı. Sonuç **17.650 / 2.650**, kazanana **326 XP**. Bot kullanılmadı. Ayrı tek dosya profil kaydetme testi de geçti.

## Otomatik güvenlik ve arayüz testleri

- Emülatörde yeni arena/profil/arkadaşlık/XP/lig testleri: 7 senaryo; dokuz mod için ayrı iki oyunculu skor doğrulamaları dahil.
- Önceki lig ve düello testleri de GitHub Actions'ta çalıştırılır.
- Mobil/masaüstü arayüzde profil, arkadaşlık/davet, canlı Karanlık Yağmur ve Yükselen maçları, lig keşfi/katılma, üye adları/seviyeleri, lig puanları ve bot/çevrimdışı akışları doğrulandı.
- Yetkisiz/oturumsuz okuma, arkadaşlık kabulünü atlama, özel liste okuma, yabancı profil değiştirme, sahte XP/puan, erken sonuç, lig toplamı şişirme, kilitli skin seçme, fazla/bilinmeyen alan ve zaman manipülasyonu engellendi.
- Ücretsiz dağıtım koruması: dört test başarılı.
- Yerel tek dosya HTML'de menü, bot ve özgün solo Karanlık Yağmur başlangıcı çalıştı.

## Sınırlar

Dokuz online sürüm, ortak 12 dalga/36 hedef formatında arena uyarlamalarıdır; özgün 25 aşamalı boss maratonu veya sınırsız/2–4 kişilik yerel modların birebir ağ sürümü değildir. Fiziksel iki Android cihaz testi yapılmadı. Hosting'deki eski sayfa güncellenmedi. Anonim hesap cihaz verisine bağlıdır. Güvenlik kuralları test edilmiş prototiptir; otomasyon ve anonim hesap çoğaltmaya karşı tam anti-cheat garantisi verilmez. Ücretsiz Spark kotaları geçerlidir.

## GitHub Actions ve teslim dosyaları

Çalışma `38870933910`: tüm testler ve APK derlemesi başarılı. Kaynak commit `b1ff6b6755b448155723c48c49930ece6294c280`; APK artifact `12033458149`. Toplam 23 Node/emülatör senaryosu, mobil/masaüstü arayüz akışı ve dört ücretsiz dağıtım koruması testi geçti.

APK SHA-256: `274782cc26a585f81303adbfb6b6db98b1c86219b80766ba05b67c598729ad61`. APK 125484 bayt; tek HTML 334046 bayt. HTML doğrudan APK içinden çıkarıldı ve bayt eşitliği doğrulandı. Küçük paket, WebView tabanlı tek dosyalı oyundur; Firebase SDK internetten yüklenir.

V10 debug test sertifikası V9.3'ten farklıdır. Bu nedenle V9.3 üzerine doğrudan güncelleme kurulamaz. Eski uygulamayı kaldırmak yerel ilerlemeyi ve anonim oturumu kaybettirir. Bu işlemde kullanıcı uygulaması kaldırılmadı, verileri silinmedi. Anonim oturum/yeni bulut profilinin eski yerel XP'si otomatik aktarılmaz; eski koleksiyon özgün yerel bölümlerde korunur.
