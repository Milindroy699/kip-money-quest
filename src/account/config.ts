/**
 * Sign-in configuration. Everything comes from EXPO_PUBLIC_ environment variables (in .env locally,
 * or EAS environment variables for builds); a missing value just turns that piece off.
 * Setup steps: docs/accounts.md.
 */
import { Platform } from 'react-native';

export const FIREBASE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

/** The Firebase project is set up, so accounts live in the cloud. */
export const cloudConfigured = Object.values(FIREBASE_CONFIG).every(Boolean);

export const GOOGLE_CLIENT_IDS = {
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
};

/** Google needs its web client ID (for Firebase) and, on iOS, its iOS client ID. */
export const googleConfigured = Boolean(GOOGLE_CLIENT_IDS.webClientId && (Platform.OS !== 'ios' || GOOGLE_CLIENT_IDS.iosClientId));

/**
 * Whether to offer sign-in at all. In production that needs the cloud. In development it also
 * works without it, as a local test account, so the flow can be tried before Firebase exists.
 */
export const signInOffered = (cloudConfigured || __DEV__) && (Platform.OS === 'ios' || googleConfigured);
