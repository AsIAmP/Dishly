import { Pressable, Text, View } from 'react-native';

import { CapturedImage } from './CapturedImage';
import { PhotoOverlay } from './PhotoOverlay';
import { recipeSkillLevel, type Recipe } from '@/data/recipes';
import { shadows } from '@/theme/tokens';

/**
 * Full-bleed 4:5 photo card. Title + meta sit on the gradient overlay ON the
 * photo (per the recipe-app design conventions), difficulty as a pill in the
 * top corner. Prep/cook/difficulty are three separate fields. Whole card taps.
 */
export function RecipeCard({ recipe, onPress }: { recipe: Recipe; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="overflow-hidden rounded-card active:opacity-95"
      style={[{ aspectRatio: 4 / 5 }, shadows.card]}
    >
      <CapturedImage uri={recipe.image} caption="Drop a photo of this dish" />

      <View className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-1">
        <Text className="font-body-bold text-11 text-primary">{recipe.difficulty}</Text>
      </View>

      <PhotoOverlay>
        <Text className="mb-1 font-display text-19 text-white">{recipe.title}</Text>
        <View className="flex-row gap-2.5">
          <Text className="font-body text-12 text-white/85">Prep {recipe.prep}m</Text>
          <Text className="font-body text-12 text-white/85">Cook {recipe.cook}m</Text>
          <Text className="font-body text-12 text-white/85">{recipeSkillLevel(recipe.difficulty)}</Text>
        </View>
      </PhotoOverlay>
    </Pressable>
  );
}
