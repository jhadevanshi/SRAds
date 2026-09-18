module.exports = {
  expo: {
    name: "business-app",
    slug: "business-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/android-icon-foreground.png",
        backgroundImage: "./assets/android-icon-background.png",
        monochromeImage: "./assets/android-icon-monochrome.png"
      },
      usesCleartextTraffic: true,
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE"
        }
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "@react-native-community/datetimepicker",
      "expo-video"
    ]
  }
};
