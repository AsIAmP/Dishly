import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '@/theme/tokens';

type IconProps = { size?: number; color?: string };

/** Apple wordmark glyph (inline SVG — the PUA font glyph doesn't render in Inter). */
export function AppleIcon({ size = 16, color = colors['on-accent'] }: IconProps) {
  return (
    <Svg width={(size * 14) / 17} height={size} viewBox="0 0 14 17" fill={color}>
      <Path d="M11.55 8.98c-.02-1.86 1.52-2.75 1.59-2.8-.87-1.27-2.22-1.45-2.7-1.47-1.15-.12-2.25.68-2.83.68-.58 0-1.48-.66-2.43-.65-1.25.02-2.4.73-3.04 1.85-1.3 2.25-.33 5.58.93 7.4.62.89 1.36 1.89 2.33 1.85.94-.04 1.29-.6 2.42-.6 1.13 0 1.45.6 2.44.58 1.01-.02 1.65-.9 2.27-1.8.71-1.03 1-2.03 1.02-2.08-.02-.01-1.96-.75-1.98-2.96zM9.62 3.4c.52-.63.87-1.5.77-2.37-.75.03-1.66.5-2.2 1.13-.48.55-.9 1.44-.79 2.28.83.06 1.68-.42 2.22-1.04z" />
    </Svg>
  );
}

/** Google "G" mark, multi-color. */
export function GoogleIcon({ size = 17 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z" />
      <Path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z" />
      <Path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z" />
      <Path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
    </Svg>
  );
}

export function MicIcon({ size = 34, color = colors.accent }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 15a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3z" stroke={color} strokeWidth={1.6} />
      <Path d="M19 11a7 7 0 01-14 0M12 18v3" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

export function CameraIcon({ size = 20, color = colors.primary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z" stroke={color} strokeWidth={1.5} />
      <Circle cx={12} cy={14} r={3.4} stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}

export function UploadIcon({ size = 20, color = colors.primary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={4} width={18} height={16} rx={2} stroke={color} strokeWidth={1.5} />
      <Path d="M3 16l5-5 4 4 3-3 5 5" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    </Svg>
  );
}
