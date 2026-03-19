import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.habittracker.app',
  appName: 'HabiTracker',
  webDir: 'client', // EXATAMENTE O NOME DA PASTA NA SUA FOTO
  server: {
    url: 'https://habitvision-six.vercel.app',
    androidScheme: 'https',
    cleartext: true
  }
};

export default config;