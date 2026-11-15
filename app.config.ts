import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Extends app.json. Google Sign-In's config plugin needs the iOS client's reversed client ID
 * (com.googleusercontent.apps.…), and fails the native build without it. So it's only added once
 * GOOGLE_IOS_URL_SCHEME is set, in .env locally or as an EAS environment variable.
 * Setup steps: docs/accounts.md.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const iosUrlScheme = process.env.GOOGLE_IOS_URL_SCHEME;
  const google: [string, { iosUrlScheme: string }][] = iosUrlScheme ? [['@react-native-google-signin/google-signin', { iosUrlScheme }]] : [];
  return {
    ...config,
    name: config.name ?? 'Kip: Money Quest',
    slug: config.slug ?? 'kip-money-quest',
    plugins: [...(config.plugins ?? []), ...google],
  };
};
