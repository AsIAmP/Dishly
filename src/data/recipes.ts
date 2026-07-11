/**
 * Recipe domain data + types.
 *
 * Ported from the design prototype (project/Dishly Prototype.dc.html). In Phase 3
 * this is the mock source behind the React Query fetchers in ./api.ts. In Phase 4
 * the fetchers get repointed at Supabase; these types stay the contract.
 */

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Ingredient = {
  name: string;
  /** Weight in grams — drives the g/oz unit toggle. */
  g?: number;
  /** Free-text amount when the ingredient isn't weight-based (e.g. "3 cloves"). */
  text?: string;
};

export type Step = {
  n: number;
  min: number;
  /** May contain {AMOUNT}, replaced with a unit-converted value of `amtG`. */
  template: string;
  amtG?: number;
};

export type Recipe = {
  id: string;
  title: string;
  author: string;
  rating: number | null;
  prep: number;
  cook: number;
  difficulty: Difficulty;
  dietary: string[];
  allergens: string[];
  calories: string;
  ingredients: Ingredient[];
  steps: Step[];
};

export const RECIPES: Recipe[] = [
  {
    id: 'mushroom-tagliatelle',
    title: 'Mushroom Tagliatelle',
    author: 'Elena Marchetti',
    rating: 4.8,
    prep: 10,
    cook: 20,
    difficulty: 'Easy',
    dietary: ['vegetarian'],
    allergens: ['gluten', 'dairy'],
    calories: '620 kcal per serving · Serves 2',
    ingredients: [
      { name: 'Tagliatelle', g: 200 },
      { name: 'Mixed mushrooms', g: 300 },
      { name: 'Garlic', text: '3 cloves' },
      { name: 'Parmesan, grated', g: 40 },
      { name: 'Butter', g: 30 },
      { name: 'Heavy cream', g: 100 },
      { name: 'Fresh thyme', text: 'a few sprigs' },
    ],
    steps: [
      { n: 1, min: 10, template: 'Bring a large pot of salted water to a boil and cook the tagliatelle until al dente.' },
      { n: 2, min: 8, template: 'Melt the butter in a pan and sauté garlic with {AMOUNT} of mushrooms until golden.', amtG: 300 },
      { n: 3, min: 5, template: 'Stir in the cream and Parmesan, simmer until thickened.' },
      { n: 4, min: 2, template: 'Toss with the pasta, season, and serve immediately.' },
    ],
  },
  {
    id: 'buddha-bowl',
    title: 'Vegan Buddha Bowl',
    author: 'Priya Nandan',
    rating: 4.6,
    prep: 15,
    cook: 15,
    difficulty: 'Easy',
    dietary: ['vegan', 'vegetarian', 'gluten-free'],
    allergens: ['soy', 'tree nuts'],
    calories: '480 kcal per serving · Serves 1',
    ingredients: [
      { name: 'Quinoa', g: 150 },
      { name: 'Roasted chickpeas', g: 120 },
      { name: 'Baby kale', g: 80 },
      { name: 'Marinated tofu', g: 150 },
      { name: 'Tahini dressing', g: 60 },
      { name: 'Toasted almonds', g: 20 },
    ],
    steps: [
      { n: 1, min: 15, template: 'Rinse and cook the quinoa according to package instructions.' },
      { n: 2, min: 12, template: 'Roast the chickpeas with olive oil and spices until crisp.' },
      { n: 3, min: 8, template: 'Pan-sear the {AMOUNT} of marinated tofu until golden on all sides.', amtG: 150 },
      { n: 4, min: 3, template: 'Assemble the bowl with kale, quinoa, chickpeas and tofu; drizzle tahini, top with almonds.' },
    ],
  },
  {
    id: 'shrimp-scampi',
    title: 'Shrimp Scampi',
    author: 'Marco Belline',
    rating: 4.7,
    prep: 10,
    cook: 15,
    difficulty: 'Medium',
    dietary: ['pescatarian'],
    allergens: ['shellfish', 'gluten', 'dairy'],
    calories: '540 kcal per serving · Serves 2',
    ingredients: [
      { name: 'Linguine', g: 200 },
      { name: 'Large shrimp, peeled', g: 350 },
      { name: 'Garlic, minced', text: '4 cloves' },
      { name: 'White wine', g: 80 },
      { name: 'Butter', g: 40 },
      { name: 'Lemon juice', g: 20 },
      { name: 'Parsley, chopped', text: 'a handful' },
    ],
    steps: [
      { n: 1, min: 9, template: 'Cook the linguine in salted boiling water until al dente.' },
      { n: 2, min: 5, template: 'Sauté garlic in butter, add {AMOUNT} of shrimp and cook until pink.', amtG: 350 },
      { n: 3, min: 4, template: 'Deglaze with wine and lemon juice, reduce slightly.' },
      { n: 4, min: 2, template: 'Toss with pasta and parsley, serve hot.' },
    ],
  },
];

/** The recipe surfaced by the Camera "recognize dish" flow. */
export const RECOGNIZED_RECIPE: Recipe = {
  id: 'recognized-salmon-bowl',
  title: 'Grilled Salmon Bowl',
  author: 'Recognized by Dishly AI',
  rating: null,
  prep: 12,
  cook: 14,
  difficulty: 'Easy',
  dietary: ['pescatarian', 'gluten-free'],
  allergens: ['fish'],
  calories: '510 kcal per serving · Serves 1',
  ingredients: [
    { name: 'Salmon fillet', g: 180 },
    { name: 'Steamed rice', g: 160 },
    { name: 'Avocado', text: '1/2' },
    { name: 'Sesame seeds', text: 'a pinch' },
  ],
  steps: [
    { n: 1, min: 8, template: 'Grill the salmon fillet skin-side down until crisp.' },
    { n: 2, min: 4, template: 'Steam the rice and slice the avocado.' },
    { n: 3, min: 2, template: 'Assemble the bowl and finish with sesame seeds.' },
  ],
};

/** Every recipe addressable by id (search list + recognized), for detail lookups. */
export const ALL_RECIPES_BY_ID: Record<string, Recipe> = Object.fromEntries(
  [...RECIPES, RECOGNIZED_RECIPE].map((r) => [r.id, r]),
);

// --- Onboarding option sets (the "None" chip is appended by the UI) -----------
export const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Keto',
  'Gluten-free',
  'Dairy-free',
] as const;

export const ALLERGEN_OPTIONS = [
  'Peanuts',
  'Tree nuts',
  'Shellfish',
  'Egg',
  'Dairy',
  'Soy',
  'Gluten',
] as const;

export const SKILL_LEVELS = [
  { key: 'beginner', title: 'Beginner', sub: 'Still learning the basics' },
  { key: 'intermediate', title: 'Intermediate', sub: 'Comfortable following recipes' },
  { key: 'advanced', title: 'Advanced', sub: 'I improvise most nights' },
] as const;

// --- Unit conversion (g/oz toggle affects ingredients AND steps) --------------
export type Unit = 'g' | 'oz';

export function formatAmount(g: number, unit: Unit): string {
  return unit === 'g' ? `${g} g` : `${(g / 28.3495).toFixed(1)} oz`;
}

/** Resolve a step's display text, converting {AMOUNT} into the active unit. */
export function stepText(step: Step, unit: Unit): string {
  return step.amtG != null
    ? step.template.replace('{AMOUNT}', formatAmount(step.amtG, unit))
    : step.template;
}
