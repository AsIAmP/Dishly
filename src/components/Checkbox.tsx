import { Pressable, Text } from 'react-native';

/** Pantry checkbox — checking means "I have this ingredient" (not a shopping list). */
export function Checkbox({ checked, onPress }: { checked: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      className={`items-center justify-center rounded-sm ${
        checked ? 'border-accent bg-accent' : 'border-border-strong bg-surface'
      }`}
      style={{ width: 20, height: 20, borderWidth: 1.5 }}
    >
      {checked ? <Text className="font-body-bold text-11 text-on-accent">✓</Text> : null}
    </Pressable>
  );
}
