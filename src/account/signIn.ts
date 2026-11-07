/**
 * Sign in with Apple or Google, then (when the cloud is configured) with Firebase.
 * Each function resolves to the signed-in identity, or null if the person cancelled.
 * Without Firebase (development only) the identity is kept as a local test account.
 */
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { deleteUser, GoogleAuthProvider, OAuthProvider, signInWithCredential, signOut, updateProfile, type AuthCredential, type UserCredential } from 'firebase/auth';

import { cloudConfigured, GOOGLE_CLIENT_IDS, googleConfigured } from './config';
import { firebaseAuth } from './firebase';

export type Provider = 'apple' | 'google';

export interface Identity {
  provider: Provider;
  /** Firebase user ID, or the provider's own ID for a local test account. */
  uid: string;
  /** Display name, if the person shared it. Apple only sends it on the very first sign-in. */
  name: string | null;
  /** True when the account lives in Firebase (progress can be backed up). */
  cloud: boolean;
}

export class SignInError extends Error {}

export function appleSignInAvailable(): Promise<boolean> {
  return AppleAuthentication.isAvailableAsync().catch(() => false);
}

export { googleConfigured };

async function finishWithFirebase(provider: Provider, credential: AuthCredential, name: string | null): Promise<Identity> {
  const auth = firebaseAuth();
  if (!auth) throw new SignInError('The cloud isn’t set up.');
  let result: UserCredential;
  try {
    result = await signInWithCredential(auth, credential);
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === 'auth/operation-not-allowed') throw new SignInError(`${provider === 'apple' ? 'Apple' : 'Google'} sign-in isn’t switched on for this app yet.`);
    if (code === 'auth/network-request-failed') throw new SignInError('No internet connection. Check it and try again.');
    if (code === 'auth/account-exists-with-different-credential') throw new SignInError('This email already uses the other sign-in option. Try that one.');
    throw new SignInError('Sign-in didn’t work. Please try again.');
  }
  if (name && !result.user.displayName) await updateProfile(result.user, { displayName: name }).catch(() => {});
  return { provider, uid: result.user.uid, name: result.user.displayName ?? name, cloud: true };
}

export async function signInWithApple(): Promise<Identity | null> {
  // Firebase checks a nonce: Apple gets its SHA-256 hash, Firebase gets the original.
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
  let credential: AppleAuthentication.AppleAuthenticationCredential;
  try {
    credential = await AppleAuthentication.signInAsync({
      requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
      nonce: hashedNonce,
    });
  } catch (e) {
    if ((e as { code?: string }).code === 'ERR_REQUEST_CANCELED') return null;
    throw new SignInError('Apple sign-in didn’t work. Check this phone is signed in to an Apple Account, then try again.');
  }
  const name = [credential.fullName?.givenName, credential.fullName?.familyName].filter(Boolean).join(' ') || null;
  if (cloudConfigured) {
    if (!credential.identityToken) throw new SignInError('Apple didn’t return a sign-in token. Please try again.');
    return finishWithFirebase('apple', new OAuthProvider('apple.com').credential({ idToken: credential.identityToken, rawNonce }), name);
  }
  return { provider: 'apple', uid: `apple:${credential.user}`, name, cloud: false };
}

export async function signInWithGoogle(): Promise<Identity | null> {
  if (!googleConfigured) throw new SignInError('Google sign-in isn’t set up yet.');
  // Loaded on demand: the native module only exists in builds made after it was added.
  const { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } = await import('@react-native-google-signin/google-signin');
  GoogleSignin.configure({ webClientId: GOOGLE_CLIENT_IDS.webClientId, iosClientId: GOOGLE_CLIENT_IDS.iosClientId });
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) return null; // cancelled
    const { idToken, user } = response.data;
    if (cloudConfigured) {
      if (!idToken) throw new SignInError('Google didn’t return a sign-in token. Please try again.');
      return finishWithFirebase('google', GoogleAuthProvider.credential(idToken), user.name);
    }
    return { provider: 'google', uid: `google:${user.id}`, name: user.name, cloud: false };
  } catch (e) {
    if (e instanceof SignInError) throw e;
    if (isErrorWithCode(e) && e.code === statusCodes.SIGN_IN_CANCELLED) return null;
    if (isErrorWithCode(e) && e.code === statusCodes.IN_PROGRESS) throw new SignInError('Sign-in is already open.');
    throw new SignInError('Google sign-in didn’t work. Please try again.');
  }
}

/** Signs out of Firebase and Google. Progress on this phone stays. */
export async function signOutEverywhere(provider: Provider | undefined): Promise<void> {
  const auth = firebaseAuth();
  if (auth) await signOut(auth).catch(() => {});
  if (provider === 'google' && googleConfigured) {
    const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
    await GoogleSignin.signOut().catch(() => {});
  }
}

/**
 * Deletes the cloud account (Apple's review rules require this to be possible in the app).
 * 'signInAgain' means Firebase wants a fresh sign-in first, for safety.
 */
export async function deleteCloudAccount(): Promise<'deleted' | 'signInAgain'> {
  const user = firebaseAuth()?.currentUser;
  if (!user) return 'deleted'; // local test account, or already gone
  try {
    await deleteUser(user);
    return 'deleted';
  } catch (e) {
    if ((e as { code?: string }).code === 'auth/requires-recent-login') return 'signInAgain';
    throw new SignInError('Couldn’t delete the account. Check the connection and try again.');
  }
}
