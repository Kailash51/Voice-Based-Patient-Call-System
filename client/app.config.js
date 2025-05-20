export default {
  name: 'PatientCallSystem',
  slug: 'patient-call-system',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.yourcompany.patientcallsystem'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.yourcompany.patientcallsystem'
  },
  web: {
    favicon: './assets/favicon.png'
  },
  extra: {
    apiUrl: 'http://192.168.175.199:5000'  // Your actual IP address
  },
  newArchEnabled: true,
  plugins: [
    "expo-secure-store" // Added the plugin here
  ]
};
