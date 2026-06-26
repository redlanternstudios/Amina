import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.redlanternstudios.amina',
  appName: 'Amina: Muslima Companion',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // url set to live deployment for TestFlight
    url: 'https://amina-muslima-companion.vercel.app',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#F7F2EB',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#F7F2EB',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
}

export default config
