import { Pressable, Text } from 'react-native';

/**
 * Multi-select pill for Dietary / Allergens.
 *  - unselected:        surface bg, hairline border, primary text
 *  - selected (normal): soft accent tint bg, accent border + text
 *  - selected "None":   solid accent fill, white text (mutually exclusive chip)
 */
export function Pill({
  label,
  selected,
  isNone = false,
  onPress,
}: {
  label: string;
  selected: boolean;
  isNone?: boolean;
  onPress: () => void;
}) {
  const bg = selected ? (isNone ? 'bg-accent' : 'bg-accent-tint') : 'bg-surface';
  const border = selected ? 'border-accent' : 'border-border';
  const text = selected ? (isNone ? 'text-on-accent' : 'text-accent') : 'text-primary';

  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full px-4 ${bg} ${border} active:opacity-80`}
      style={{ borderWidth: 1.5, paddingVertical: 9 }}
    >
      <Text className={`font-body-semibold text-13 ${text}`}>{label}</Text>
    </Pressable>
  );
}
