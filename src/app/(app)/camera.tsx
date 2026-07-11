import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PhotoCapture } from '@/components/PhotoCapture';
import { TextField } from '@/components/TextField';
import { RECOGNIZED_RECIPE } from '@/data/recipes';
import { useAddPhotoFavorite } from '@/hooks/useFavorites';

/**
 * Capture / Upload a dish photo.
 *
 *  - The `mode` param (from Home) decides whether we open the live camera or the
 *    file picker first; both paths end in a real image (web) via PhotoCapture.
 *  - "recognize dish (optional)": auto-fills the title and attaches a generated
 *    recipe so the saved item opens as a full recipe.
 *  - Save to Favorites persists the image + caption; it then shows in Favorites
 *    and opens in the detail view.
 */
export default function CameraScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: 'camera' | 'upload' }>();
  const captureMode = mode === 'upload' ? 'upload' : 'camera';

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [recognized, setRecognized] = useState(false);
  const [caption, setCaption] = useState('');
  const addPhoto = useAddPhotoFavorite();

  const save = () => {
    const title = recognized ? RECOGNIZED_RECIPE.title : caption || 'Captured photo';
    addPhoto.mutate(
      {
        title,
        caption,
        imageUri: imageUri ?? undefined,
        recipeId: recognized ? RECOGNIZED_RECIPE.id : undefined,
      },
      { onSuccess: () => router.replace('/favorites') },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-1 px-gutter pb-5 pt-4">
        <Pressable onPress={() => router.back()} className="mb-3.5 active:opacity-70">
          <Text className="font-body-semibold text-14 text-primary">← Back</Text>
        </Pressable>

        <View className="mb-3.5 flex-1">
          <PhotoCapture
            mode={captureMode}
            captured={imageUri}
            onCapture={setImageUri}
            onClear={() => {
              setImageUri(null);
              setRecognized(false);
            }}
          />
        </View>

        {recognized ? (
          <View className="mb-2.5 rounded-md bg-accent-tint px-3 py-2.5">
            <Text className="font-body text-13 text-primary">
              <Text className="font-body-bold text-accent">Recognized: </Text>
              {RECOGNIZED_RECIPE.title} — recipe text & reference photo generated.
            </Text>
          </View>
        ) : null}

        <Pressable
          onPress={() => setRecognized(true)}
          disabled={!imageUri}
          className="mb-2.5 items-center justify-center rounded-md border-border bg-surface active:opacity-90"
          style={{ height: 48, borderWidth: 1.5, opacity: imageUri ? 1 : 0.5 }}
        >
          <Text className="font-body-semibold text-14 text-primary">
            🔍 recognize dish (optional)
          </Text>
        </Pressable>

        <TextField
          placeholder="Add a caption"
          value={caption}
          onChangeText={setCaption}
          style={{ height: 48, borderWidth: 1.5, marginBottom: 16 }}
        />

        <Pressable
          onPress={save}
          disabled={!imageUri && !caption}
          className="items-center justify-center rounded-full bg-accent active:opacity-90"
          style={{ height: 52, opacity: !imageUri && !caption ? 0.5 : 1 }}
        >
          <Text className="font-body-bold text-15 text-on-accent">Save to Favorites</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
