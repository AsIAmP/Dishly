import { useState } from 'react';
import { Image, StyleSheet } from 'react-native';

import { PhotoPlaceholder } from './PhotoPlaceholder';

/**
 * Renders a photo (recipe hero, catalog image, or a captured/uploaded favorite)
 * over the warm placeholder. The placeholder is always the base layer, so if
 * there's no `uri` — or the image fails to load — it shows through. The parent
 * controls aspect ratio.
 *
 * Uses React Native's Image (not expo-image): on web it displays via a
 * background-image and does NOT force CORS, so remote hosts without CORS headers
 * (e.g. the catalog's stock photos) still render. Data-URI captures work too.
 */
export function CapturedImage({ uri, caption }: { uri?: string; caption?: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <>
      <PhotoPlaceholder caption={caption} />
      {uri && !failed ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : null}
    </>
  );
}
