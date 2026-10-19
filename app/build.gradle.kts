plugins { id("com.android.application") }
android {
 namespace = "com.sonbirsaniye.arcade"
 compileSdk = 35
 defaultConfig {
  applicationId = "com.sonbirsaniye.son1saniye.v22"
  minSdk = 26
  targetSdk = 35
  versionCode = 220
  versionName = "22.0"
 }
 buildTypes { getByName("release") { isMinifyEnabled = false } }
 compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
}
