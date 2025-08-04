import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dyad.recipeai', // A unique identifier for your app (e.g., com.yourcompany.yourapp)
  appName: 'RecipeAI', // The name of your app
  webDir: 'dist', // This points to your React app's build output directory
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'
  }
};

export default config;