import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { gradients } from '@/theme/tokens';

/**
 * The text-on-photo gradient scrim used on recipe cards, favorites tiles, and
 * the recipe hero. RN has no CSS gradients, so this uses expo-linear-gradient
 * (transparent -> 65% black, top to bottom), confined to the bottom of the
 * photo. `pointerEvents="none"` keeps taps flowing through to the card.
 */
export function PhotoOverlay({ children }: { children: ReactNode }) {
  return (
    <View className="absolute inset-x-0 bottom-0" pointerEvents="box-none">
      <LinearGradient
        colors={gradients.photoOverlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ paddingTop: 40 }}
      >
        <View className="px-4 pb-4 pt-2">{children}</View>
      </LinearGradient>
    </View>
  );
}
