import { Image, View } from 'react-native';

/**
 * Full-screen splash shown for a couple of seconds on cold start, before the
 * app routes to sign-in / home. The Dishly logo is centered both vertically and
 * horizontally on the warm background.
 */
export function AppSplash() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Image
        source={require('../../assets/images/logo.png')}
        style={{ width: 300, height: 300 }}
        resizeMode="contain"
      />
    </View>
  );
}
