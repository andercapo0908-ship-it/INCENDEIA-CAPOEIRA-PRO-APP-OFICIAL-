
export interface Web2AppConfig {
  ios_scheme: string;
  android_scheme: string;
  store_id: string;
  package_name: string;
}

export interface Web2AppResult {
  name: string;
  uri: string;
  platform: 'Web' | 'Android' | 'iOS';
}

export const generateAppLinks = (url: string, config: Web2AppConfig): Web2AppResult[] => {
  try {
    const urlObj = new URL(url);
    const pathAndQuery = urlObj.pathname + urlObj.search + urlObj.hash;
    const cleanPath = pathAndQuery.startsWith('/') ? pathAndQuery.substring(1) : pathAndQuery;

    const results: Web2AppResult[] = [
      {
        name: 'Web URL',
        uri: url,
        platform: 'Web'
      }
    ];

    // Android Custom Scheme
    if (config.android_scheme) {
      results.push({
        name: 'Custom URL Scheme for Android',
        uri: `${config.android_scheme}${cleanPath}`,
        platform: 'Android'
      });
    }

    // Android App Indexing (http)
    if (config.package_name) {
      results.push({
        name: 'App Indexing for Android (http)',
        uri: `android-app://${config.package_name}/http/${urlObj.host}/${cleanPath}`,
        platform: 'Android'
      });

      if (config.android_scheme) {
        const scheme = config.android_scheme.replace('://', '');
        results.push({
          name: 'App Indexing for Android (custom scheme)',
          uri: `android-app://${config.package_name}/${scheme}/${urlObj.host}/${cleanPath}`,
          platform: 'Android'
        });
      }
    }

    // iOS Custom Scheme
    if (config.ios_scheme) {
      results.push({
        name: 'Custom URL Scheme for iOS',
        uri: `${config.ios_scheme}${cleanPath}`,
        platform: 'iOS'
      });
    }

    // iOS App Indexing
    if (config.store_id && config.ios_scheme) {
      const scheme = config.ios_scheme.replace('://', '');
      results.push({
        name: 'App Indexing for iOS',
        uri: `ios-app://${config.store_id}/${scheme}/${urlObj.host}/${cleanPath}`,
        platform: 'iOS'
      });
    }

    return results;
  } catch (e) {
    console.error('Invalid URL provided to web2app', e);
    return [];
  }
};
