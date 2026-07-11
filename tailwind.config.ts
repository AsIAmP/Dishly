import type { Config } from 'tailwindcss';

import {
  borderRadius,
  colors,
  fontFamily,
  fontSize,
  spacing,
} from './src/theme/tokens';

// tokens.ts is the single source of truth. Everything below is spread from it,
// so changing a token value re-themes every semantic class across the app.
const config: Config = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors,
      borderRadius,
      spacing,
      // Casts: tokens are declared `as const` (readonly tuples), while Tailwind's
      // types want mutable arrays/tuples. The values are correct at runtime.
      fontFamily: fontFamily as unknown as Record<string, string[]>,
      fontSize: fontSize as unknown as Record<string, [string, string]>,
    },
  },
  plugins: [],
};

export default config;
