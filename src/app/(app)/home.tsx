import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CameraIcon, MicIcon, UploadIcon } from '@/components/icons';
import { TextField } from '@/components/TextField';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { useAuth } from '@/store/auth';
import { useSearch } from '@/store/search';

/**
 * Home. The mic is the primary action: tapping it runs real speech-to-text
 * (web) and, once a phrase settles, jumps to Results with that query. A text
 * field below is always available — it's the fallback when the browser has no
 * speech API and a first-class way to type a craving. The scope toggle decides
 * whether Results searches saved recipes or generates via AI.
 */
export default function HomeScreen() {
  const router = useRouter();
  const scope = useSearch((s) => s.scope);
  const setScope = useSearch((s) => s.setScope);
  const setQuery = useSearch((s) => s.setQuery);
  const signOut = useAuth((s) => s.signOut);

  const [typed, setTyped] = useState('');

  const runSearch = (q: string) => {
    const query = q.trim();
    if (!query) return;
    setQuery(query);
    router.push('/results');
  };

  const voice = useVoiceSearch((finalText) => {
    // Show the transcript briefly, then navigate.
    setQuery(finalText);
    setTimeout(() => router.push('/results'), 250);
  });

  const onMic = () => {
    if (voice.status === 'listening') {
      voice.stop();
      return;
    }
    voice.start();
  };

  const listening = voice.status === 'listening';
  const askLabel = scope === 'ai' ? 'Ask AI' : 'Ask';
  const micCaption = listening
    ? voice.transcript || 'Listening…'
    : scope === 'ai'
      ? 'Tap & say what you’re craving'
      : 'Tap & name a saved dish';

  const segment = (active: boolean) =>
    `flex-1 items-center rounded-full py-2.5 ${active ? 'bg-accent' : ''}`;
  const segmentText = (active: boolean) =>
    `font-body-bold text-13 ${active ? 'text-on-accent' : 'text-primary'}`;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-1 px-gutter pb-7 pt-4">
        {/* Top bar: wordmark + sign out */}
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="font-display-semibold text-18 text-accent">Dishly</Text>
          <Pressable
            onPress={() => {
              signOut();
              router.replace('/signin');
            }}
            className="rounded-full border-border px-3 py-1.5 active:opacity-70"
            style={{ borderWidth: 1.5 }}
          >
            <Text className="font-body-semibold text-12 text-secondary">Sign out</Text>
          </Pressable>
        </View>

        <Text className="mb-3 text-center font-body text-12 text-secondary">
          Search by voice, type it, snap a photo, or upload
        </Text>

        <View
          className="mb-4 flex-row rounded-full border-border bg-surface"
          style={{ borderWidth: 1.5, padding: 3 }}
        >
          <Pressable className={segment(scope === 'mine')} onPress={() => setScope('mine')}>
            <Text className={segmentText(scope === 'mine')}>my recipes</Text>
          </Pressable>
          <Pressable className={segment(scope === 'ai')} onPress={() => setScope('ai')}>
            <Text className={segmentText(scope === 'ai')}>find via AI</Text>
          </Pressable>
        </View>

        <View className="flex-1 items-center justify-center">
          <Pressable
            onPress={onMic}
            className={`items-center justify-center gap-2 rounded-full active:opacity-90 ${
              listening ? 'bg-accent' : 'bg-accent-tint'
            }`}
            style={{
              width: 210,
              height: 210,
              borderWidth: listening ? 3 : 0,
              borderColor: '#F0C4AE',
            }}
          >
            <MicIcon size={34} color={listening ? '#FFFFFF' : undefined} />
            <Text
              className={`font-body-bold text-17 ${listening ? 'text-on-accent' : 'text-accent'}`}
            >
              {listening ? 'Listening' : askLabel}
            </Text>
          </Pressable>

          <Text className="mt-4 px-6 text-center font-body text-13 text-secondary" numberOfLines={2}>
            {micCaption}
          </Text>
          {voice.error ? (
            <Text className="mt-1.5 px-6 text-center font-body text-12 text-danger">
              {voice.error}
            </Text>
          ) : null}
        </View>

        {/* Always-available text search (fallback + first-class) */}
        <View className="mb-3.5 flex-row items-center gap-2">
          <View className="flex-1">
            <TextField
              placeholder={scope === 'ai' ? 'Type what you’re craving…' : 'Search saved recipes…'}
              value={typed}
              onChangeText={setTyped}
              returnKeyType="search"
              onSubmitEditing={() => runSearch(typed)}
            />
          </View>
          <Pressable
            onPress={() => runSearch(typed)}
            disabled={typed.trim().length === 0}
            className="items-center justify-center rounded-md bg-accent active:opacity-90"
            style={{ height: 50, width: 64, opacity: typed.trim().length === 0 ? 0.5 : 1 }}
          >
            <Text className="font-body-bold text-14 text-on-accent">Go</Text>
          </Pressable>
        </View>

        <View className="mb-3.5 flex-row gap-2.5">
          <Pressable
            onPress={() => router.push({ pathname: '/camera', params: { mode: 'camera' } })}
            className="flex-1 items-center justify-center gap-1.5 rounded-lg border-border bg-surface active:opacity-90"
            style={{ height: 76, borderWidth: 1.5 }}
          >
            <CameraIcon size={20} />
            <Text className="font-body-semibold text-12 text-primary">Camera</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push({ pathname: '/camera', params: { mode: 'upload' } })}
            className="flex-1 items-center justify-center gap-1.5 rounded-lg border-border bg-surface active:opacity-90"
            style={{ height: 76, borderWidth: 1.5 }}
          >
            <UploadIcon size={20} />
            <Text className="font-body-semibold text-12 text-primary">Upload</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => router.push('/favorites')}
          className="items-center justify-center rounded-full border-accent bg-transparent active:opacity-80"
          style={{ height: 48, borderWidth: 1.5 }}
        >
          <Text className="font-body-bold text-14 text-accent">Favorites →</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
