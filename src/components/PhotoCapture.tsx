import { Text, View } from 'react-native';

import { PhotoPlaceholder } from './PhotoPlaceholder';

/**
 * Native fallback for photo capture. Live camera/file access on native needs a
 * dev-build module (expo-camera / expo-image-picker), which isn't wired yet, so
 * this renders the placeholder and a note. The web build uses PhotoCapture.web
 * for real getUserMedia capture. The surrounding flow (recognize, caption,
 * save) still works — the capture just carries no image on native for now.
 */
type Props = {
  mode: 'camera' | 'upload';
  captured: string | null;
  onCapture: (dataUrl: string) => void;
  onClear: () => void;
};

export function PhotoCapture(_: Props) {
  return (
    <View className="flex-1">
      <View className="flex-1 overflow-hidden rounded-xl">
        <PhotoPlaceholder caption="Live capture needs a native dev build — coming next" />
      </View>
    </View>
  );
}
