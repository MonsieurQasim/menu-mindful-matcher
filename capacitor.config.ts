import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.7df89841753b4fcd8b96a2c790e4a4c7',
  appName: 'Diety',
  webDir: 'dist',
  server: {
    url: 'https://7df89841-753b-4fcd-8b96-a2c790e4a4c7.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;
