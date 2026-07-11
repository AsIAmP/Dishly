import { Image } from 'expo-image';

import { PhotoPlaceholder } from './PhotoPlaceholder';

/**
 * Renders a captured/uploaded favorite photo when we have its data URL, else
 * falls back to the warm placeholder (recipe favorites and native captures have
 * no stored image). Fills its parent; the parent controls aspect ratio.
 */
export function CapturedImage({ uri, caption }: { uri?: string; caption?: string }) {
  if (!uri) return <PhotoPlaceholder caption={caption} />;
  return (
    <Image
      source={{ uri }}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      contentFit="cover"
      transition={150}
    />
  );
}
