plugins { id("com.android.application") }
android {
 namespace = "com.sonbirsaniye.arcade"
 compileSdk = 35
 defaultConfig {
  applicationId = "com.sonbirsaniye.cosmicv17"
  minSdk = 26
  targetSdk = 35
  versionCode = 17
  versionName = "17.0"
 }
 buildTypes { getByName("release") { isMinifyEnabled = false } }
 compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
}
