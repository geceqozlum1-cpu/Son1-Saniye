plugins { id("com.android.application") }
android {
 namespace = "com.sonbirsaniye.arcade"
 compileSdk = 35
 defaultConfig {
  applicationId = "com.sonbirsaniye.son1saniye.v211"
  minSdk = 26
  targetSdk = 35
  versionCode = 211
  versionName = "21.1"
 }
 buildTypes { getByName("release") { isMinifyEnabled = false } }
 compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
}
