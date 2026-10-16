plugins { id("com.android.application") }
android {
 namespace = "com.sonbirsaniye.arcade"
 compileSdk = 35
 defaultConfig {
  applicationId = "com.sonbirsaniye.arcade"
  minSdk = 26
  targetSdk = 35
  versionCode = 13
  versionName = "10.0"
 }
 buildTypes { getByName("release") { isMinifyEnabled = false } }
 compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
}
