const config = {
  apiBaseUrl: process.env.REACT_APP_API_URL || '',
  assetsUrl: process.env.REACT_APP_ASSETS_URL || '',
  heapId: process.env.REACT_APP_HEAP_ID || '',
  version: process.env.REACT_APP_VERSION || '',
  hotjarId: process.env.REACT_APP_HOTJAR_ID || '',
  hotjarSnippetVersion: process.env.REACT_APP_HOTJAR_SNIPPET_VERSION || '',
  googleAnalyticsTrackingId: process.env.REACT_APP_GOOGLE_ANALYTICS_TRACKING_ID || '',
  smartlookAnalyticsKey: process.env.REACT_APP_SMARTLOOK_ANALYTICS_KEY || '',
  aes_secret_key: process.env.REACT_APP_AES_SECRET_KEY || '',
  firebaseConfig: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID
  }
}

export default config
