# SON 1 SANİYE V9 — Firebase Çevrim İçi Ligler

Bu repo artık Firebase config eklenmesini destekleyen APK derleme iş akışı ve manuel Firebase deploy iş akışı içerir. **Firebase projesi henüz bu repoya bağlanmadıysa çevrim içi ligler canlı değildir.**

## Gerekli GitHub Actions değişkenleri
Depo: Settings → Secrets and variables → Actions → Variables:
- FIREBASE_PROJECT_ID: Firebase proje ID
- FIREBASE_WEB_CONFIG_JSON: Firebase Web App yapılandırma JSON'u. Yalnızca istemci anahtarı; hizmet hesabı özel anahtarı koymayın.
- GCP_WORKLOAD_IDENTITY_PROVIDER: Google Cloud Workload Identity Provider kaynak adı
- GCP_DEPLOY_SERVICE_ACCOUNT: WIF'a bağlı, gerekli en az IAM izinlerine sahip dağıtım servis hesabı

## Firebase Console hazırlığı
Proje sahibi Firebase Console'da Anonymous Authentication ve Firestore (default) veritabanını etkinleştirmelidir. Cloud Functions için **Blaze planı** gerekir ve ücret doğabilir; maliyet uyarısı tanımlayın. WIF kimliğini yalnızca \`geceqozlum1-cpu/Son1-Saniye\` deposuna sınırlandırın.

## Çalıştırma sırası
1. Actions → **Deploy Firebase Leagues** → Run workflow (sadece proje ve yetkiler kurulunca).
2. Actions → **Build Android APK** → Run workflow; Artifacts altında \`SON_1_SANIYE_V9_FIREBASE_READY_APK\` paketindeki app-debug.apk dosyasını indirin.
3. İki farklı cihazla kodla lige katılma, maçı sunucuya gönderme ve canlı skoru kontrol edin.

APK'deki Firebase yapılandırması otomatik eklenir, ama sunucu yayımlanana kadar bağlanamaz. Sunucu skor yeniden hesaplar; tam hile koruması değildir. Yerel kozmetik/ödüller cihazlar arasında henüz senkronize değildir.
