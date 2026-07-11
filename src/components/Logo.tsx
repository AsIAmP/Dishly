import { Image } from 'react-native';

/**
 * The Dishly logo image, sized square. Used on the splash and the sign-in
 * welcome. `size` is both width and height (the artwork is square).
 */
export function Logo({ size = 300 }: { size?: number }) {
  return (
    <Image
      source={require('../../assets/images/logo.png')}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}
