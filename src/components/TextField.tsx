import { useState } from 'react';
import { TextInput, type TextInputProps } from 'react-native';

import { colors } from '@/theme/tokens';

/** Text input matching the design: 50px tall, hairline border that turns accent
 *  on focus. Border width (1.5px) and height are inline styles (non-token px). */
export function TextField(props: TextInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      placeholderTextColor={colors.tertiary}
      {...props}
      onFocus={(e) => {
        setFocused(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        props.onBlur?.(e);
      }}
      className={`rounded-md bg-surface px-4 font-body text-15 text-primary ${
        focused ? 'border-accent' : 'border-border'
      }`}
      style={[{ height: 50, borderWidth: 1.5 }, props.style]}
    />
  );
}
