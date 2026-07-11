import { useEffect, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '@/theme/tokens';

/**
 * A professional spinning loader: an accent arc rotating over a faint track,
 * with an optional label. Use it wherever a screen needs a moment to load.
 */
export function Loader({ label, size = 44 }: { label?: string; size?: number }) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 850,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const stroke = 3.5;
  const r = size / 2 - stroke;
  const circumference = 2 * Math.PI * r;

  return (
    <View className="items-center justify-center gap-3">
      <Animated.View style={{ width: size, height: size, transform: [{ rotate }] }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={colors['accent-tint-strong']}
            strokeWidth={stroke}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={colors.accent}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${circumference * 0.3} ${circumference}`}
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>
      {label ? <Text className="font-body text-13 text-secondary">{label}</Text> : null}
    </View>
  );
}
