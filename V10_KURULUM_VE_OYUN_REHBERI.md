# SON 1 SANİYE V10 — Arena

## Oyna

Ana menü: Oyna / Arkadaşlar / Ligler / Profil. Karanlık Yağmur varsayılan ve öne çıkan arenadır. Dokuz modun tamamı ana menüde görünür. **Rakip Bul**, seçilen modda başka cihazdaki bir oyuncuyla eşleşir. İki oyuncu da aynı modda arama yapmalıdır. **Arkadaşınla Oyna**, kabul edilmiş arkadaşlardan birine davet gönderir. Aynı telefonda iki kişilik oyun varsayılan değildir.

Çevrimiçi sürümler, eski modların ortak **12 dalga / 36 hedef** formatındaki karşılıklı arena uyarlamalarıdır. Eski 25 aşamalı boss maratonu, kesintisiz sonsuz mod, yerel takım ve 2–4 kişilik parti aynı kurallarla online'a taşındı diye sunulmaz; özgün sürümler Tek Başına/Yerel seçeneklerinde korunur.

- Karanlık Yağmur: inen hedefler, dört dalgada bir yana savrulan fırtına.
- Klasik: yerinde beliren üç ayrı hedef.
- Yükselen: alttan yükselen hedefler.
- Senkron: aynı anda beliren, üç ayrı hedefle rekabet.
- Günlük Efsane: aynı gün herkes için aynı sabit tohum.
- Sonsuz Arena: 12 dalga boyunca giderek daralan hedef süresi; özgün sınırsız sürüm yerelde kalır.
- Meydan Okuma: 650 ms pencereli hızlı hedefler.
- Özel Parkur: 1–1000000 arasında seçilebilir tohumla ortak parkur.
- Parti: zıplayan hedeflerle iki kişilik renk yarışı; yerel 2–4 kişilik parti ayrıca korunur.

Yeşil tek dokunuş, mavi 75–480 ms arayla çift dokunuş, kırmızı/siyah dokunmadan geçme. Siyah tüm maç skorunu sıfırlar. Canlı puanlar geçicidir; nihai skorlar dokuz küçük hamle parçasıyla Firestore kurallarında doğrulanır. Toplam yüksek puan kazanır; eşitlik beraberliktir. Rakip ayrılınca maç kapatılır ve sıralama puanı yazılmaz.

## Botlar ve ilerleme

24 Türkçe bot adı, kolay/normal/zor seviyeleri; bot etiketi görünür. Bot hamleleri maç başında oyuncudan bağımsız belirlenir. Rakip aramada 20 saniye sonra bot seçeneği kapatılabilir. Botlar internetsiz de çalışır.

Profil seviyesinde önceden tanımlanmış son seviye yoktur: her 250 XP yeni seviye. Altı yeni skin 1/3/5/10/20/40. seviyelerde açılır; eski V9 koleksiyonu da korunur. Online insan düellolarında XP, 50 + skor/100 tam kısmı + kazanırsa 100 olarak doğrulanır. Bot/solo antrenmanda en az 17,4 saniye geçmiş bir sunucu bileti 50 XP verir; günde 20 ödül sınırı vardır. İnternetsiz antrenman XP'si bu cihazda ayrı tutulur, bulut zaferi veya lig puanı sayılmaz.

## Arkadaşlar ve ligler

Oyuncu kodu 8 karakterdir; isteği karşı taraf kabul etmeden arkadaş olunmaz. Kabul edilmiş arkadaşlara seçilen modda maç daveti gönderilebilir. Çevrimiçi bilgisi yakın zamandaki etkinliktir; sürekli bağlı olma garantisi değildir.

Ligler 20'şer sayfayla keşfedilir; kodla katılma ve yeni lig kurma tek açılır alandadır. Aynı ligde üyelerin takma adları ve bulut seviyeleri gösterilir. Eski üyelerin yeni profil oluşturana kadar seviyeleri 1/"Yeni profil bekleniyor" şeklinde görünür. Bir düellodan önce temsil edilen lig seçilir. Doğrulanmış insan maçının puanı seçilen lige yalnızca bir kez yazılır; ligler arası genel sıralama bu toplamları gösterir. Eski günlük 12 dalgalık lig parkuru ayrı seçenek olarak korunur.

## Ücretsiz altyapı ve sınırlar

Gerçek Firebase projesi `son-1-saniye-78761`, Standard `(default)`, `europe-west1`, Spark. Cloud Functions, ücretli plan, faturalandırma veya yeni veritabanı yok. Her modda 8 eşleştirme yuvası; yuvalar 120 saniye sonra yeniden kullanılabilir. Spark kotaları geçerlidir; kota dolarsa online hizmet durabilir. Anonim hesap, cihaz/tarayıcı uygulama verisine bağlıdır. Veri silinince oturum erişimi kaybolabilir. Tam anti-cheat/anonim hesap çoğaltma koruması yoktur.

APK'daki HTML ve teslim HTML'si aynı oyundur. Tek HTML dosyası yerel dosya olarak açılıp bot/solo oynanabilir; online kullanım için APK veya HTTPS/localhost üzerinden açılması tercih edilmelidir. Eski Firebase Hosting sayfası bu sürüm değildir.

## Güvenlik değerlendirmesi

Yalnızca oyun takma adı, oyun kodu, oyun istatistikleri ve kozmetik kimliği açık profil verisidir. E-posta/telefon gibi özel iletişim alanları eklenemez. Arkadaş listeleri, davetler ve XP makbuzları özel tutulur. Puan, XP, lig toplamları ve arkadaşlık kabulü tam işlem şartlarıyla denetlenir. Güvenlik kuralları test edilmiş bir prototiptir; geniş dağıtımdan önce bağımsız inceleme gerekir.

I've set up prototype Security Rules to keep the data in Firestore safe. They are designed to be secure for ownership, strict schemas, private friend lists, recipient-only acceptance, validated match transcripts and one-time reward receipts. However, you should review and verify them before broadly sharing your app. If you'd like, I can help you harden these rules.
