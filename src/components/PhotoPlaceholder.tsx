import { View, Text } from 'react-native';

import { CameraIcon } from './icons';
import { colors } from '@/theme/tokens';

/**
 * Stand-in for the design's <image-slot>. No real dish photos shipped with the
 * handoff, so this renders an elegant warm-neutral placeholder that fills its
 * container (the parent controls aspect ratio via className). Swap for a real
 * <Image resizeMode="cover"> once photo URLs exist — same box, same fill.
 */
export function PhotoPlaceholder({ caption }: { caption?: string }) {
  return (
    <View className="absolute inset-0 items-center justify-center bg-surface-sunken">
      <CameraIcon size={26} color={colors.tertiary} />
      {caption ? (
        <Text className="mt-2 px-6 text-center font-body text-12 text-tertiary">{caption}</Text>
      ) : null}
    </View>
  );
}
