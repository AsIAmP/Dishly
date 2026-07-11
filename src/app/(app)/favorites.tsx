import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CapturedImage } from '@/components/CapturedImage';
import { PhotoOverlay } from '@/components/PhotoOverlay';
import type { Favorite } from '@/data/api';
import { useFavorites } from '@/hooks/useFavorites';
import { colors } from '@/theme/tokens';

/**
 * Favorites — a single collection holding BOTH saved recipes and captured
 * photos, shown as photo-with-caption tiles. Tapping any tile opens Recipe
 * detail (a photo-only capture opens the caption view via ?kind=photo).
 */
export default function FavoritesScreen() {
  const router = useRouter();
  const { data: favorites, isLoading } = useFavorites();

  const openFavorite = (fav: Favorite) => {
    if (fav.kind === 'recipe') {
      router.push({ pathname: '/recipe/[id]', params: { id: fav.recipeId } });
    } else if (fav.recipeId) {
      // recognized capture -> open the generated recipe
      router.push({ pathname: '/recipe/[id]', params: { id: fav.recipeId } });
    } else {
      // plain capture -> photo-only caption view
      router.push({ pathname: '/recipe/[id]', params: { id: fav.id, kind: 'photo' } });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="px-gutter pt-4">
        <Pressable
          onPress={() => router.replace('/home')}
          className="mb-4 items-center justify-center self-start rounded-full border-accent bg-transparent px-4 active:opacity-80"
          style={{ height: 40, borderWidth: 1.5 }}
        >
          <Text className="font-body-bold text-13 text-accent">← Home</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : favorites && favorites.length > 0 ? (
        <ScrollView
          className="flex-1 px-gutter"
          contentContainerStyle={{ paddingBottom: 24, gap: 14 }}
          showsVerticalScrollIndicator={false}
        >
          {favorites.map((fav) => (
            <Pressable
              key={fav.id}
              onPress={() => openFavorite(fav)}
              className="overflow-hidden rounded-xl active:opacity-95"
              style={{
                aspectRatio: 4 / 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowRadius: 24,
                shadowOpacity: 0.08,
                elevation: 6,
              }}
            >
              <CapturedImage
                uri={fav.kind === 'photo' ? fav.imageUri : undefined}
                caption="Photo"
              />
              <PhotoOverlay>
                <Text className="font-display text-16 text-white">{fav.title}</Text>
              </PhotoOverlay>
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <View className="flex-1 items-center px-gutter pt-16">
          <Text className="text-center font-body text-13 text-tertiary">
            No favorites yet — save a recipe or capture a dish to see it here.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
