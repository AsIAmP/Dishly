import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/store/auth';
import { shadows } from '@/theme/tokens';

/**
 * The ☰ hamburger that sits in the top-right of every app screen. Tapping it
 * opens a dropdown (over a dimmed backdrop) with Personal Settings and Logout —
 * the "1b. Menu" from the wireframe. Tap outside to close.
 */
export function AppMenu() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const signOut = useAuth((s) => s.signOut);
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const goSettings = () => {
    close();
    router.push('/settings');
  };

  const logout = () => {
    close();
    signOut();
    router.replace('/signin');
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={8}
        accessibilityLabel="Menu"
        className="items-center justify-center rounded-full border-border bg-surface active:opacity-70"
        style={{ width: 36, height: 36, borderWidth: 1.5 }}
      >
        <Text className="text-16 text-primary">☰</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable
          onPress={close}
          style={{ flex: 1, backgroundColor: 'rgba(31,27,22,0.28)' }}
        >
          <View
            style={[{ position: 'absolute', top: insets.top + 52, right: 20, minWidth: 200 }, shadows.card]}
            className="overflow-hidden rounded-md bg-surface"
          >
            <Pressable
              onPress={goSettings}
              className="flex-row items-center gap-2.5 px-4 py-3.5 active:opacity-70"
            >
              <Text className="text-15">👤</Text>
              <Text className="font-body-semibold text-14 text-primary">Personal Settings</Text>
            </Pressable>
            <View className="h-px bg-divider" />
            <Pressable
              onPress={logout}
              className="flex-row items-center gap-2.5 px-4 py-3.5 active:opacity-70"
            >
              <Text className="text-15">⟲</Text>
              <Text className="font-body-semibold text-14 text-danger">Logout</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
