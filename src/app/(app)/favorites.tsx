import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppMenu } from '@/components/AppMenu';
import { CapturedImage } from '@/components/CapturedImage';
import { Loader } from '@/components/Loader';
import { PhotoOverlay } from '@/components/PhotoOverlay';
import type { Favorite } from '@/data/api';
import { useFavorites, useRemoveFavorite } from '@/hooks/useFavorites';
import { shadows } from '@/theme/tokens';

/** The category a favorite belongs to (recipes by difficulty; captures = Photos). */
function categoryOf(fav: Favorite): string {
  if (fav.kind === 'recipe') return fav.difficulty ?? 'Saved recipes';
  return 'Photos';
}

const CATEGORY_ORDER = ['Easy', 'Medium', 'Hard', 'Saved recipes', 'Photos'];

export default function FavoritesScreen() {
  const router = useRouter();
  const { data: favorites, isLoading } = useFavorites();
  const removeFavorite = useRemoveFavorite();
  const [pendingDelete, setPendingDelete] = useState<Favorite | null>(null);
  const [filter, setFilter] = useState('All');

  // The filter menu shows "All" plus whichever categories are actually present.
  const categories = useMemo(() => {
    const present = new Set((favorites ?? []).map(categoryOf));
    return ['All', ...CATEGORY_ORDER.filter((c) => present.has(c))];
  }, [favorites]);

  const activeFilter = categories.includes(filter) ? filter : 'All';

  const visible = useMemo(() => {
    const list = favorites ?? [];
    return activeFilter === 'All' ? list : list.filter((f) => categoryOf(f) === activeFilter);
  }, [favorites, activeFilter]);

  const openFavorite = (fav: Favorite) => {
    if (fav.kind === 'recipe') {
      router.push({ pathname: '/recipe/[id]', params: { id: fav.recipeId } });
    } else if (fav.recipeId) {
      router.push({ pathname: '/recipe/[id]', params: { id: fav.recipeId } });
    } else {
      router.push({ pathname: '/recipe/[id]', params: { id: fav.id, kind: 'photo' } });
    }
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    removeFavorite.mutate(pendingDelete.id, { onSettled: () => setPendingDelete(null) });
  };

  const hasFavorites = (favorites?.length ?? 0) > 0;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      {/* Top nav */}
      <View className="flex-row items-center justify-between px-gutter pt-4">
        <Pressable
          onPress={() => router.replace('/home')}
          className="items-center justify-center rounded-full border-accent bg-transparent px-4 active:opacity-80"
          style={{ height: 40, borderWidth: 1.5 }}
        >
          <Text className="font-body-bold text-13 text-accent">← Home</Text>
        </Pressable>
        <AppMenu />
      </View>

      {/* Header title */}
      <Text className="mb-3 mt-4 px-gutter font-display text-26 text-primary">Favorites</Text>

      {/* Category menu — filters the tiles below */}
      {!isLoading && hasFavorites ? (
        <View className="mb-1">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          >
            {categories.map((c) => {
              const active = c === activeFilter;
              return (
                <Pressable
                  key={c}
                  onPress={() => setFilter(c)}
                  className={`rounded-full px-4 ${active ? 'bg-accent' : 'border-border bg-surface'}`}
                  style={{ height: 38, justifyContent: 'center', borderWidth: active ? 0 : 1.5 }}
                >
                  <Text
                    className={`font-body-bold text-13 ${active ? 'text-on-accent' : 'text-primary'}`}
                  >
                    {c}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Loader label="Loading favorites…" />
        </View>
      ) : hasFavorites ? (
        <ScrollView
          className="flex-1 px-gutter"
          contentContainerStyle={{ paddingTop: 10, paddingBottom: 24, gap: 14 }}
          showsVerticalScrollIndicator={false}
        >
          {visible.map((fav) => (
            <View
              key={fav.id}
              className="overflow-hidden rounded-xl"
              style={[{ aspectRatio: 4 / 3 }, shadows.card]}
            >
              {/* Tap to open — the whole tile except the trash button */}
              <Pressable onPress={() => openFavorite(fav)} className="flex-1 active:opacity-95">
                <CapturedImage
                  uri={fav.kind === 'photo' ? fav.imageUri : fav.image}
                  caption="Photo"
                />
                {fav.kind === 'recipe' && fav.difficulty ? (
                  <View className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-1">
                    <Text className="font-body-bold text-11 text-primary">{fav.difficulty}</Text>
                  </View>
                ) : null}
                <PhotoOverlay>
                  <Text className="font-display text-16 text-white">{fav.title}</Text>
                </PhotoOverlay>
              </Pressable>

              {/* Delete (trash) — sibling overlay so it never opens the tile */}
              <Pressable
                onPress={() => setPendingDelete(fav)}
                hitSlop={8}
                className="absolute right-2.5 top-2.5 items-center justify-center rounded-full bg-white/90 active:opacity-80"
                style={{ width: 32, height: 32 }}
              >
                <Text className="text-15">🗑️</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View className="flex-1 items-center px-gutter pt-16">
          <Text className="text-center font-body text-13 text-tertiary">
            No favorites yet — save a recipe or capture a dish to see it here.
          </Text>
        </View>
      )}

      {/* Confirm-delete dialog */}
      <Modal
        visible={pendingDelete !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPendingDelete(null)}
      >
        <Pressable
          onPress={() => setPendingDelete(null)}
          className="flex-1 items-center justify-center px-8"
          style={{ backgroundColor: 'rgba(31,27,22,0.4)' }}
        >
          <Pressable
            className="w-full rounded-xl bg-surface px-5 py-5"
            style={[{ maxWidth: 340 }, shadows.card]}
          >
            <Text className="mb-1.5 font-body-bold text-16 text-primary">
              Remove from favorites?
            </Text>
            <Text className="mb-5 font-body text-13 text-secondary" numberOfLines={2}>
              “{pendingDelete?.title}” will be removed from your list.
            </Text>
            <View className="flex-row gap-2.5">
              <Pressable
                onPress={() => setPendingDelete(null)}
                className="flex-1 items-center justify-center rounded-full border-border bg-surface active:opacity-80"
                style={{ height: 46, borderWidth: 1.5 }}
              >
                <Text className="font-body-bold text-14 text-primary">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={confirmDelete}
                disabled={removeFavorite.isPending}
                className="flex-1 items-center justify-center rounded-full bg-danger active:opacity-90"
                style={{ height: 46, opacity: removeFavorite.isPending ? 0.7 : 1 }}
              >
                {removeFavorite.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="font-body-bold text-14 text-on-accent">Remove</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
