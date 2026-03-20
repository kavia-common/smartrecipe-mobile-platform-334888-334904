"use client";

import { useEffect, useMemo, useState } from "react";

type Difficulty = "Easy" | "Medium" | "Hard";
type MealSlot = "Breakfast" | "Lunch" | "Dinner";
type NavKey =
  | "discover"
  | "planner"
  | "shopping"
  | "favorites"
  | "profile"
  | "admin";

type Recipe = {
  id: string;
  title: string;
  description: string;
  cuisine: string;
  difficulty: Difficulty;
  totalTimeMinutes: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  dietary: string[];
  allergens: string[];
  ingredients: { name: string; amount: string }[];
  steps: { title: string; detail: string; timerMinutes?: number }[];
  tags: string[];
  imageGradient: string;
  featured?: boolean;
};

type Collection = {
  id: string;
  name: string;
  recipeIds: string[];
};

type PlannerMeal = {
  day: string;
  slot: MealSlot;
  recipeId: string;
};

type ShoppingItem = {
  id: string;
  label: string;
  checked: boolean;
  source: "planned" | "custom";
};

type UserProfile = {
  name: string;
  email: string;
  preferredCuisines: string[];
  dietaryPreferences: string[];
  allergenAvoidance: string[];
  voiceEnabled: boolean;
};

type AdminDraft = {
  title: string;
  cuisine: string;
  difficulty: Difficulty;
};

type AuthMode = "signin" | "signup";

type AppState = {
  selectedNav: NavKey;
  search: string;
  selectedCuisine: string;
  selectedDifficulty: string;
  maxTime: number;
  dietaryFilters: string[];
  allergenFilters: string[];
  favorites: string[];
  collections: Collection[];
  plannerMeals: PlannerMeal[];
  shoppingItems: ShoppingItem[];
  selectedRecipeId: string;
  isCookingMode: boolean;
  cookingStepIndex: number;
  checkedIngredients: string[];
  completedTimers: string[];
  user: UserProfile;
  authMode: AuthMode;
  isAuthenticated: boolean;
  adminDraft: AdminDraft;
  adminSearch: string;
};

type RecipeFilterRequest = {
  query: string;
  cuisine: string;
  difficulty: string;
  maxTime: number;
  dietaryFilters: string[];
  allergenFilters: string[];
};

type RecipeFilterResult = {
  recipes: Recipe[];
  total: number;
};

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const MEAL_SLOTS: MealSlot[] = ["Breakfast", "Lunch", "Dinner"];

const STORAGE_KEY = "smartrecipe-mobile-state";

const mockRecipes: Recipe[] = [
  {
    id: "r1",
    title: "Citrus Salmon Grain Bowl",
    description:
      "Bright salmon with quinoa, cucumber ribbons, avocado, and a lemon-dill yogurt drizzle.",
    cuisine: "Mediterranean",
    difficulty: "Easy",
    totalTimeMinutes: 30,
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    servings: 2,
    calories: 540,
    protein: 34,
    carbs: 42,
    fat: 26,
    dietary: ["High Protein", "Gluten Free"],
    allergens: ["Fish", "Dairy"],
    ingredients: [
      { name: "Salmon fillets", amount: "2 x 5 oz" },
      { name: "Cooked quinoa", amount: "2 cups" },
      { name: "Cucumber", amount: "1 large" },
      { name: "Avocado", amount: "1" },
      { name: "Greek yogurt", amount: "1/2 cup" },
      { name: "Fresh dill", amount: "2 tbsp" },
      { name: "Lemon", amount: "1" },
    ],
    steps: [
      {
        title: "Season and prep",
        detail:
          "Pat the salmon dry, season with salt, pepper, and lemon zest. Slice cucumber into ribbons and dice avocado.",
      },
      {
        title: "Roast the salmon",
        detail:
          "Roast salmon at 425°F until flaky and just opaque. Let it rest before flaking into large pieces.",
        timerMinutes: 12,
      },
      {
        title: "Mix the drizzle",
        detail:
          "Whisk yogurt, chopped dill, lemon juice, and a pinch of salt until silky and bright.",
      },
      {
        title: "Assemble bowls",
        detail:
          "Layer quinoa, cucumber, avocado, and salmon. Spoon on yogurt drizzle and finish with dill.",
      },
    ],
    tags: ["Quick dinner", "Meal prep", "Fresh"],
    imageGradient: "from-sky-500 via-cyan-400 to-emerald-300",
    featured: true,
  },
  {
    id: "r2",
    title: "Roasted Veggie Coconut Curry",
    description:
      "A creamy weeknight curry with sweet potato, cauliflower, spinach, and jasmine rice.",
    cuisine: "Indian",
    difficulty: "Medium",
    totalTimeMinutes: 45,
    prepTimeMinutes: 15,
    cookTimeMinutes: 30,
    servings: 4,
    calories: 480,
    protein: 12,
    carbs: 58,
    fat: 20,
    dietary: ["Vegetarian", "Dairy Free"],
    allergens: [],
    ingredients: [
      { name: "Sweet potato", amount: "2 cups diced" },
      { name: "Cauliflower florets", amount: "3 cups" },
      { name: "Yellow onion", amount: "1" },
      { name: "Red curry paste", amount: "2 tbsp" },
      { name: "Coconut milk", amount: "1 can" },
      { name: "Baby spinach", amount: "3 cups" },
      { name: "Cooked jasmine rice", amount: "4 cups" },
    ],
    steps: [
      {
        title: "Roast vegetables",
        detail:
          "Toss sweet potato and cauliflower with oil and roast until caramelized at the edges.",
        timerMinutes: 20,
      },
      {
        title: "Build the curry base",
        detail:
          "Sauté onion, bloom curry paste, then stir in coconut milk and simmer until aromatic.",
      },
      {
        title: "Finish the curry",
        detail:
          "Fold roasted vegetables and spinach into the sauce. Simmer until spinach wilts and flavors combine.",
        timerMinutes: 8,
      },
      {
        title: "Serve",
        detail:
          "Spoon over jasmine rice and finish with herbs and lime if desired.",
      },
    ],
    tags: ["Comfort food", "Vegetarian", "Batch cook"],
    imageGradient: "from-amber-400 via-orange-400 to-rose-400",
  },
  {
    id: "r3",
    title: "Herby Chicken Lettuce Wraps",
    description:
      "Crisp lettuce cups with garlic chicken, crunchy vegetables, and a sesame-lime sauce.",
    cuisine: "Asian Fusion",
    difficulty: "Easy",
    totalTimeMinutes: 25,
    prepTimeMinutes: 15,
    cookTimeMinutes: 10,
    servings: 3,
    calories: 350,
    protein: 28,
    carbs: 16,
    fat: 18,
    dietary: ["Low Carb", "High Protein"],
    allergens: ["Sesame"],
    ingredients: [
      { name: "Ground chicken", amount: "1 lb" },
      { name: "Butter lettuce", amount: "1 head" },
      { name: "Carrots", amount: "2 shredded" },
      { name: "Bell pepper", amount: "1 diced" },
      { name: "Garlic", amount: "3 cloves" },
      { name: "Sesame oil", amount: "1 tbsp" },
      { name: "Lime", amount: "1" },
    ],
    steps: [
      {
        title: "Cook the chicken",
        detail:
          "Sauté garlic in sesame oil, then cook chicken until browned and fully cooked through.",
        timerMinutes: 8,
      },
      {
        title: "Prep the crunch",
        detail:
          "Separate lettuce leaves and fill a bowl with carrots and bell pepper for easy assembly.",
      },
      {
        title: "Build the sauce",
        detail:
          "Whisk lime juice with a splash of soy alternative and a drizzle of honey.",
      },
      {
        title: "Wrap and serve",
        detail:
          "Spoon chicken into lettuce cups, top with vegetables, and drizzle with sauce.",
      },
    ],
    tags: ["Low carb", "Lunch", "Crunchy"],
    imageGradient: "from-lime-400 via-emerald-400 to-teal-400",
    featured: true,
  },
  {
    id: "r4",
    title: "Tomato Basil Protein Pasta",
    description:
      "A pantry-friendly pasta with blended cottage cheese sauce, cherry tomatoes, and basil.",
    cuisine: "Italian",
    difficulty: "Easy",
    totalTimeMinutes: 20,
    prepTimeMinutes: 5,
    cookTimeMinutes: 15,
    servings: 2,
    calories: 510,
    protein: 31,
    carbs: 54,
    fat: 16,
    dietary: ["Vegetarian", "High Protein"],
    allergens: ["Dairy", "Gluten"],
    ingredients: [
      { name: "Protein pasta", amount: "8 oz" },
      { name: "Cherry tomatoes", amount: "2 cups" },
      { name: "Cottage cheese", amount: "1 cup" },
      { name: "Fresh basil", amount: "1/2 cup" },
      { name: "Garlic", amount: "2 cloves" },
      { name: "Olive oil", amount: "1 tbsp" },
    ],
    steps: [
      {
        title: "Cook the pasta",
        detail:
          "Boil pasta in salted water until al dente, reserving a cup of pasta water before draining.",
        timerMinutes: 10,
      },
      {
        title: "Sauté tomatoes",
        detail:
          "Cook tomatoes with garlic and olive oil until softened and blistered.",
      },
      {
        title: "Blend the sauce",
        detail:
          "Blend cottage cheese, basil, and a splash of pasta water until smooth.",
      },
      {
        title: "Combine",
        detail:
          "Toss pasta, tomato mixture, and sauce together until glossy and evenly coated.",
      },
    ],
    tags: ["Pantry", "Protein pasta", "Weeknight"],
    imageGradient: "from-red-400 via-rose-400 to-orange-300",
  },
  {
    id: "r5",
    title: "Smoky Black Bean Breakfast Tacos",
    description:
      "Corn tortillas with scrambled eggs, black beans, pico de gallo, and avocado crema.",
    cuisine: "Mexican",
    difficulty: "Medium",
    totalTimeMinutes: 35,
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    servings: 4,
    calories: 430,
    protein: 20,
    carbs: 38,
    fat: 22,
    dietary: ["Vegetarian"],
    allergens: ["Eggs"],
    ingredients: [
      { name: "Corn tortillas", amount: "8" },
      { name: "Eggs", amount: "6" },
      { name: "Black beans", amount: "1 can" },
      { name: "Pico de gallo", amount: "1 cup" },
      { name: "Avocado", amount: "1" },
      { name: "Greek yogurt", amount: "1/3 cup" },
    ],
    steps: [
      {
        title: "Warm the beans",
        detail:
          "Simmer black beans with smoked paprika and cumin until heated through.",
      },
      {
        title: "Scramble the eggs",
        detail:
          "Cook eggs gently over medium-low heat until softly set and creamy.",
        timerMinutes: 6,
      },
      {
        title: "Blend the crema",
        detail:
          "Blend avocado with yogurt, lime, and salt until smooth and spoonable.",
      },
      {
        title: "Assemble tacos",
        detail:
          "Layer tortillas with beans, eggs, pico, and avocado crema.",
      },
    ],
    tags: ["Breakfast", "Family style", "Weekend"],
    imageGradient: "from-yellow-300 via-amber-400 to-orange-400",
  },
  {
    id: "r6",
    title: "Sheet Pan Lemon Garlic Tofu",
    description:
      "Crisp tofu with broccolini, red onion, and fingerling potatoes finished with lemon.",
    cuisine: "American",
    difficulty: "Medium",
    totalTimeMinutes: 40,
    prepTimeMinutes: 15,
    cookTimeMinutes: 25,
    servings: 4,
    calories: 460,
    protein: 21,
    carbs: 41,
    fat: 24,
    dietary: ["Vegan", "Dairy Free"],
    allergens: ["Soy"],
    ingredients: [
      { name: "Extra-firm tofu", amount: "14 oz" },
      { name: "Broccolini", amount: "2 bunches" },
      { name: "Fingerling potatoes", amount: "1 lb" },
      { name: "Red onion", amount: "1" },
      { name: "Garlic", amount: "4 cloves" },
      { name: "Lemon", amount: "1" },
    ],
    steps: [
      {
        title: "Press and season tofu",
        detail:
          "Press tofu well, cube it, then toss with oil, garlic, and lemon zest.",
      },
      {
        title: "Arrange the sheet pan",
        detail:
          "Spread tofu, potatoes, onion, and broccolini on a sheet pan without overcrowding.",
      },
      {
        title: "Roast",
        detail:
          "Roast until tofu is crisp and potatoes are tender, turning once halfway through.",
        timerMinutes: 25,
      },
      {
        title: "Finish and serve",
        detail:
          "Squeeze fresh lemon over everything and add flaky salt before serving.",
      },
    ],
    tags: ["Vegan", "Sheet pan", "Meal prep"],
    imageGradient: "from-violet-400 via-sky-400 to-cyan-300",
  },
];

const defaultCollections: Collection[] = [
  { id: "c1", name: "Weeknight Wins", recipeIds: ["r1", "r4"] },
  { id: "c2", name: "Meal Prep Staples", recipeIds: ["r2", "r6"] },
];

const defaultPlannerMeals: PlannerMeal[] = [
  { day: "Monday", slot: "Dinner", recipeId: "r1" },
  { day: "Tuesday", slot: "Lunch", recipeId: "r3" },
  { day: "Wednesday", slot: "Dinner", recipeId: "r2" },
  { day: "Friday", slot: "Breakfast", recipeId: "r5" },
];

const defaultShoppingItems: ShoppingItem[] = [
  { id: "s1", label: "Fresh dill", checked: false, source: "planned" },
  { id: "s2", label: "Protein pasta", checked: true, source: "planned" },
  { id: "s3", label: "Sparkling water", checked: false, source: "custom" },
];

const defaultUser: UserProfile = {
  name: "Maya Carter",
  email: "maya@example.com",
  preferredCuisines: ["Mediterranean", "Italian"],
  dietaryPreferences: ["High Protein"],
  allergenAvoidance: ["Peanuts"],
  voiceEnabled: true,
};

const defaultState: AppState = {
  selectedNav: "discover",
  search: "",
  selectedCuisine: "All",
  selectedDifficulty: "All",
  maxTime: 60,
  dietaryFilters: [],
  allergenFilters: [],
  favorites: ["r1", "r3", "r4"],
  collections: defaultCollections,
  plannerMeals: defaultPlannerMeals,
  shoppingItems: defaultShoppingItems,
  selectedRecipeId: "r1",
  isCookingMode: false,
  cookingStepIndex: 0,
  checkedIngredients: [],
  completedTimers: [],
  user: defaultUser,
  authMode: "signin",
  isAuthenticated: true,
  adminDraft: {
    title: "Summer Herb Chickpea Salad",
    cuisine: "Mediterranean",
    difficulty: "Easy",
  },
  adminSearch: "",
};

function readPersistedState(): AppState {
  if (typeof window === "undefined") {
    return defaultState;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultState;
    }

    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      ...defaultState,
      ...parsed,
      user: {
        ...defaultUser,
        ...parsed.user,
      },
      adminDraft: {
        ...defaultState.adminDraft,
        ...parsed.adminDraft,
      },
    };
  } catch (error) {
    console.warn("RecipeAppFlow: failed to read persisted state", error);
    return defaultState;
  }
}

function savePersistedState(state: AppState) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("RecipeAppFlow: failed to persist state", error);
  }
}

function filterRecipes(
  recipes: Recipe[],
  request: RecipeFilterRequest,
): RecipeFilterResult {
  const normalizedQuery = request.query.trim().toLowerCase();

  const filtered = recipes.filter((recipe) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      recipe.title.toLowerCase().includes(normalizedQuery) ||
      recipe.description.toLowerCase().includes(normalizedQuery) ||
      recipe.ingredients.some((ingredient) =>
        ingredient.name.toLowerCase().includes(normalizedQuery),
      );

    const matchesCuisine =
      request.cuisine === "All" || recipe.cuisine === request.cuisine;

    const matchesDifficulty =
      request.difficulty === "All" || recipe.difficulty === request.difficulty;

    const matchesTime = recipe.totalTimeMinutes <= request.maxTime;

    const matchesDietary = request.dietaryFilters.every((dietaryFilter) =>
      recipe.dietary.includes(dietaryFilter),
    );

    const matchesAllergens = request.allergenFilters.every(
      (allergenFilter) => !recipe.allergens.includes(allergenFilter),
    );

    return (
      matchesQuery &&
      matchesCuisine &&
      matchesDifficulty &&
      matchesTime &&
      matchesDietary &&
      matchesAllergens
    );
  });

  return { recipes: filtered, total: filtered.length };
}

function generateShoppingItems(plannerMeals: PlannerMeal[]): ShoppingItem[] {
  const ingredientNames = plannerMeals.flatMap((meal) => {
    const recipe = mockRecipes.find((entry) => entry.id === meal.recipeId);
    return recipe ? recipe.ingredients.map((ingredient) => ingredient.name) : [];
  });

  const uniqueNames = [...new Set(ingredientNames)];
  return uniqueNames.slice(0, 10).map((name, index) => ({
    id: `generated-${index}`,
    label: name,
    checked: false,
    source: "planned",
  }));
}

function getRecipeById(recipeId: string): Recipe {
  return (
    mockRecipes.find((recipe) => recipe.id === recipeId) ??
    mockRecipes[0]
  );
}

function StatPill({
  label,
  value,
  accent = "primary",
}: {
  label: string;
  value: string;
  accent?: "primary" | "accent" | "neutral";
}) {
  return (
    <div className={`stat-pill stat-pill--${accent}`}>
      <span className="stat-pill__value">{value}</span>
      <span className="stat-pill__label">{label}</span>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="section-header">
      <div>
        <p className="section-header__eyebrow">{eyebrow}</p>
        <h2 className="section-header__title">{title}</h2>
        <p className="section-header__description">{description}</p>
      </div>
      {action ? <div className="section-header__action">{action}</div> : null}
    </div>
  );
}

function RecipeCard({
  recipe,
  isFavorite,
  onOpen,
  onToggleFavorite,
}: {
  recipe: Recipe;
  isFavorite: boolean;
  onOpen: (recipeId: string) => void;
  onToggleFavorite: (recipeId: string) => void;
}) {
  return (
    <article className="recipe-card">
      <button
        type="button"
        className={`recipe-card__media bg-gradient-to-br ${recipe.imageGradient}`}
        onClick={() => onOpen(recipe.id)}
        aria-label={`Open ${recipe.title}`}
      >
        <span className="recipe-card__badge">{recipe.cuisine}</span>
        {recipe.featured ? (
          <span className="recipe-card__featured">Featured</span>
        ) : null}
      </button>

      <div className="recipe-card__body">
        <div className="recipe-card__header">
          <div>
            <h3 className="recipe-card__title">{recipe.title}</h3>
            <p className="recipe-card__description">{recipe.description}</p>
          </div>
          <button
            type="button"
            className={`icon-button ${isFavorite ? "icon-button--active" : ""}`}
            onClick={() => onToggleFavorite(recipe.id)}
            aria-label={
              isFavorite ? "Remove recipe from favorites" : "Add recipe to favorites"
            }
          >
            ♥
          </button>
        </div>

        <div className="recipe-card__meta">
          <span>{recipe.totalTimeMinutes} min</span>
          <span>{recipe.difficulty}</span>
          <span>{recipe.calories} cal</span>
        </div>

        <div className="recipe-card__tags">
          {recipe.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function BottomNav({
  selectedNav,
  onSelect,
}: {
  selectedNav: NavKey;
  onSelect: (nextNav: NavKey) => void;
}) {
  const items: { key: NavKey; label: string; icon: string }[] = [
    { key: "discover", label: "Discover", icon: "⌂" },
    { key: "planner", label: "Plan", icon: "☰" },
    { key: "shopping", label: "Shop", icon: "✓" },
    { key: "favorites", label: "Saved", icon: "♥" },
    { key: "profile", label: "Profile", icon: "☺" },
    { key: "admin", label: "Admin", icon: "⚙" },
  ];

  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className={`bottom-nav__item ${
            selectedNav === item.key ? "bottom-nav__item--active" : ""
          }`}
          onClick={() => onSelect(item.key)}
        >
          <span aria-hidden="true" className="bottom-nav__icon">
            {item.icon}
          </span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

function AppShell({
  hero,
  children,
  selectedNav,
  onSelectNav,
}: {
  hero: React.ReactNode;
  children: React.ReactNode;
  selectedNav: NavKey;
  onSelectNav: (nextNav: NavKey) => void;
}) {
  return (
    <main className="app-shell">
      <div className="app-shell__content">
        {hero}
        {children}
      </div>
      <BottomNav selectedNav={selectedNav} onSelect={onSelectNav} />
    </main>
  );
}

export default function Home() {
  const [state, setState] = useState<AppState>(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const [customItem, setCustomItem] = useState("");

  useEffect(() => {
    const persisted = readPersistedState();
    setState(persisted);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      savePersistedState(state);
    }
  }, [hydrated, state]);

  const selectedRecipe = useMemo(
    () => getRecipeById(state.selectedRecipeId),
    [state.selectedRecipeId],
  );

  const filterResult = useMemo(
    () =>
      filterRecipes(mockRecipes, {
        query: state.search,
        cuisine: state.selectedCuisine,
        difficulty: state.selectedDifficulty,
        maxTime: state.maxTime,
        dietaryFilters: state.dietaryFilters,
        allergenFilters: state.allergenFilters,
      }),
    [
      state.search,
      state.selectedCuisine,
      state.selectedDifficulty,
      state.maxTime,
      state.dietaryFilters,
      state.allergenFilters,
    ],
  );

  const favoriteRecipes = useMemo(
    () => mockRecipes.filter((recipe) => state.favorites.includes(recipe.id)),
    [state.favorites],
  );

  const plannerRecipes = useMemo(
    () =>
      state.plannerMeals.map((meal) => ({
        ...meal,
        recipe: getRecipeById(meal.recipeId),
      })),
    [state.plannerMeals],
  );

  const adminRecipes = useMemo(() => {
    const query = state.adminSearch.trim().toLowerCase();
    if (!query) {
      return mockRecipes;
    }

    return mockRecipes.filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(query) ||
        recipe.cuisine.toLowerCase().includes(query),
    );
  }, [state.adminSearch]);

  const cuisines = useMemo(
    () => ["All", ...new Set(mockRecipes.map((recipe) => recipe.cuisine))],
    [],
  );

  const dietaryOptions = useMemo(
    () => [...new Set(mockRecipes.flatMap((recipe) => recipe.dietary))].sort(),
    [],
  );

  const allergenOptions = useMemo(
    () => [...new Set(mockRecipes.flatMap((recipe) => recipe.allergens))].sort(),
    [],
  );

  const updateState = (updater: (current: AppState) => AppState) => {
    setState((current) => updater(current));
  };

  const openRecipe = (recipeId: string) => {
    updateState((current) => ({
      ...current,
      selectedRecipeId: recipeId,
      isCookingMode: false,
      cookingStepIndex: 0,
    }));
  };

  const toggleFavorite = (recipeId: string) => {
    updateState((current) => {
      const exists = current.favorites.includes(recipeId);
      return {
        ...current,
        favorites: exists
          ? current.favorites.filter((id) => id !== recipeId)
          : [...current.favorites, recipeId],
      };
    });
  };

  const toggleDietaryFilter = (dietary: string) => {
    updateState((current) => ({
      ...current,
      dietaryFilters: current.dietaryFilters.includes(dietary)
        ? current.dietaryFilters.filter((entry) => entry !== dietary)
        : [...current.dietaryFilters, dietary],
    }));
  };

  const toggleAllergenFilter = (allergen: string) => {
    updateState((current) => ({
      ...current,
      allergenFilters: current.allergenFilters.includes(allergen)
        ? current.allergenFilters.filter((entry) => entry !== allergen)
        : [...current.allergenFilters, allergen],
    }));
  };

  const startCookingMode = () => {
    updateState((current) => ({
      ...current,
      selectedNav: "discover",
      isCookingMode: true,
      cookingStepIndex: 0,
      checkedIngredients: [],
      completedTimers: [],
    }));
  };

  const toggleIngredientCheck = (ingredientName: string) => {
    updateState((current) => ({
      ...current,
      checkedIngredients: current.checkedIngredients.includes(ingredientName)
        ? current.checkedIngredients.filter((entry) => entry !== ingredientName)
        : [...current.checkedIngredients, ingredientName],
    }));
  };

  const completeTimer = (stepTitle: string) => {
    updateState((current) => ({
      ...current,
      completedTimers: current.completedTimers.includes(stepTitle)
        ? current.completedTimers
        : [...current.completedTimers, stepTitle],
    }));
  };

  const moveCookingStep = (direction: "next" | "previous") => {
    updateState((current) => {
      const stepCount = selectedRecipe.steps.length;
      const nextIndex =
        direction === "next"
          ? Math.min(current.cookingStepIndex + 1, stepCount - 1)
          : Math.max(current.cookingStepIndex - 1, 0);

      return {
        ...current,
        cookingStepIndex: nextIndex,
      };
    });
  };

  const assignMeal = (day: string, slot: MealSlot, recipeId: string) => {
    updateState((current) => {
      const existingIndex = current.plannerMeals.findIndex(
        (meal) => meal.day === day && meal.slot === slot,
      );

      const nextMeals = [...current.plannerMeals];
      if (existingIndex >= 0) {
        nextMeals[existingIndex] = { day, slot, recipeId };
      } else {
        nextMeals.push({ day, slot, recipeId });
      }

      return {
        ...current,
        plannerMeals: nextMeals,
        shoppingItems: [
          ...generateShoppingItems(nextMeals),
          ...current.shoppingItems.filter((item) => item.source === "custom"),
        ],
      };
    });
  };

  const toggleShoppingItem = (itemId: string) => {
    updateState((current) => ({
      ...current,
      shoppingItems: current.shoppingItems.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item,
      ),
    }));
  };

  const addCustomShoppingItem = () => {
    const label = customItem.trim();
    if (!label) {
      return;
    }

    updateState((current) => ({
      ...current,
      shoppingItems: [
        ...current.shoppingItems,
        {
          id: `custom-${Date.now()}`,
          label,
          checked: false,
          source: "custom",
        },
      ],
    }));
    setCustomItem("");
  };

  const updateUserPreference = (
    field: "preferredCuisines" | "dietaryPreferences" | "allergenAvoidance",
    value: string,
  ) => {
    updateState((current) => {
      const values = current.user[field];
      const nextValues = values.includes(value)
        ? values.filter((entry) => entry !== value)
        : [...values, value];

      return {
        ...current,
        user: {
          ...current.user,
          [field]: nextValues,
        },
      };
    });
  };

  const toggleVoice = () => {
    updateState((current) => ({
      ...current,
      user: {
        ...current.user,
        voiceEnabled: !current.user.voiceEnabled,
      },
    }));
  };

  const toggleAuthMode = () => {
    updateState((current) => ({
      ...current,
      authMode: current.authMode === "signin" ? "signup" : "signin",
    }));
  };

  const submitAuth = () => {
    updateState((current) => ({
      ...current,
      isAuthenticated: true,
      selectedNav: "discover",
    }));
  };

  const resetDemo = () => {
    setState(defaultState);
    setCustomItem("");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const hero = (
    <section className="hero">
      <div className="hero__copy">
        <div className="hero__pill">SmartRecipe • mobile-first meal companion</div>
        <h1 className="hero__title">
          Discover, cook, plan, and manage recipes in one polished workflow.
        </h1>
        <p className="hero__description">
          This frontend is structured as a reusable mock-backed integration layer
          while backend recipe endpoints are still being built. All major user and
          admin experiences are connected through a single, consistent app flow.
        </p>
      </div>
      <div className="hero__stats">
        <StatPill label="Recipes" value={String(mockRecipes.length)} />
        <StatPill label="Saved" value={String(state.favorites.length)} accent="accent" />
        <StatPill
          label="Planned meals"
          value={String(state.plannerMeals.length)}
          accent="neutral"
        />
      </div>
    </section>
  );

  const renderDiscover = () => {
    if (state.isCookingMode) {
      const activeStep = selectedRecipe.steps[state.cookingStepIndex];

      return (
        <section className="panel-stack">
          <SectionHeader
            eyebrow="Cooking mode"
            title={selectedRecipe.title}
            description="Step-by-step guidance with large text, ingredient checklist, and timer tracking."
            action={
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  updateState((current) => ({
                    ...current,
                    isCookingMode: false,
                    cookingStepIndex: 0,
                  }))
                }
              >
                Exit cooking mode
              </button>
            }
          />

          <div className="cooking-layout">
            <article className="feature-card feature-card--primary">
              <p className="feature-card__eyebrow">
                Step {state.cookingStepIndex + 1} of {selectedRecipe.steps.length}
              </p>
              <h3 className="feature-card__title feature-card__title--large">
                {activeStep.title}
              </h3>
              <p className="feature-card__description feature-card__description--large">
                {activeStep.detail}
              </p>

              {activeStep.timerMinutes ? (
                <div className="timer-card">
                  <div>
                    <p className="timer-card__label">Suggested timer</p>
                    <p className="timer-card__value">{activeStep.timerMinutes} min</p>
                  </div>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => completeTimer(activeStep.title)}
                  >
                    {state.completedTimers.includes(activeStep.title)
                      ? "Timer completed"
                      : "Mark timer done"}
                  </button>
                </div>
              ) : null}

              <div className="step-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => moveCookingStep("previous")}
                  disabled={state.cookingStepIndex === 0}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => moveCookingStep("next")}
                  disabled={state.cookingStepIndex === selectedRecipe.steps.length - 1}
                >
                  Next step
                </button>
              </div>
            </article>

            <article className="feature-card">
              <SectionHeader
                eyebrow="Ingredient checklist"
                title="Stay organized while cooking"
                description="Check off ingredients as you prep and scale servings mentally for your household."
              />
              <div className="checklist">
                {selectedRecipe.ingredients.map((ingredient) => {
                  const checked = state.checkedIngredients.includes(ingredient.name);
                  return (
                    <label
                      key={ingredient.name}
                      className={`checklist__item ${
                        checked ? "checklist__item--checked" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleIngredientCheck(ingredient.name)}
                      />
                      <span>
                        <strong>{ingredient.amount}</strong> {ingredient.name}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="voice-note">
                <p className="voice-note__title">Voice readout</p>
                <p className="voice-note__description">
                  {state.user.voiceEnabled
                    ? "Enabled in preferences. The future backend voice setting can sync across devices."
                    : "Disabled. Turn it on in profile to show readiness for synced accessibility preferences."}
                </p>
              </div>
            </article>
          </div>
        </section>
      );
    }

    return (
      <section className="panel-stack">
        <article className="feature-card feature-card--soft">
          <SectionHeader
            eyebrow="Recipe discovery"
            title="Search by name, ingredient, cuisine, difficulty, or time"
            description="The discovery flow is built around a single filter contract so it can switch from mock data to backend data without patchy UI changes."
          />

          <div className="filters-grid">
            <label className="field">
              <span className="field__label">Search recipes or ingredients</span>
              <input
                className="field__input"
                value={state.search}
                onChange={(event) =>
                  updateState((current) => ({
                    ...current,
                    search: event.target.value,
                  }))
                }
                placeholder="Try salmon, curry, tofu, basil..."
              />
            </label>

            <label className="field">
              <span className="field__label">Cuisine</span>
              <select
                className="field__input"
                value={state.selectedCuisine}
                onChange={(event) =>
                  updateState((current) => ({
                    ...current,
                    selectedCuisine: event.target.value,
                  }))
                }
              >
                {cuisines.map((cuisine) => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field__label">Difficulty</span>
              <select
                className="field__input"
                value={state.selectedDifficulty}
                onChange={(event) =>
                  updateState((current) => ({
                    ...current,
                    selectedDifficulty: event.target.value,
                  }))
                }
              >
                {["All", "Easy", "Medium", "Hard"].map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field__label">
                Max total time: {state.maxTime} minutes
              </span>
              <input
                className="field__range"
                type="range"
                min={15}
                max={90}
                step={5}
                value={state.maxTime}
                onChange={(event) =>
                  updateState((current) => ({
                    ...current,
                    maxTime: Number(event.target.value),
                  }))
                }
              />
            </label>
          </div>

          <div className="chip-groups">
            <div>
              <p className="chip-groups__label">Dietary preferences</p>
              <div className="chips">
                {dietaryOptions.map((dietary) => (
                  <button
                    key={dietary}
                    type="button"
                    className={`chip ${
                      state.dietaryFilters.includes(dietary) ? "chip--active" : ""
                    }`}
                    onClick={() => toggleDietaryFilter(dietary)}
                  >
                    {dietary}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="chip-groups__label">Avoid allergens</p>
              <div className="chips">
                {allergenOptions.length === 0 ? (
                  <span className="empty-text">No allergens defined in sample content.</span>
                ) : (
                  allergenOptions.map((allergen) => (
                    <button
                      key={allergen}
                      type="button"
                      className={`chip ${
                        state.allergenFilters.includes(allergen)
                          ? "chip--active chip--danger"
                          : ""
                      }`}
                      onClick={() => toggleAllergenFilter(allergen)}
                    >
                      {allergen}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </article>

        <div className="discover-grid">
          <section className="panel-stack">
            <SectionHeader
              eyebrow="Results"
              title={`${filterResult.total} recipes matched`}
              description="Cards stay compact on mobile and expand into a richer grid on larger screens."
            />
            <div className="recipe-grid">
              {filterResult.recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isFavorite={state.favorites.includes(recipe.id)}
                  onOpen={openRecipe}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </section>

          <aside className="panel-stack">
            <article className="feature-card feature-card--sticky">
              <SectionHeader
                eyebrow="Recipe detail"
                title={selectedRecipe.title}
                description={selectedRecipe.description}
                action={
                  <button
                    type="button"
                    className="primary-button"
                    onClick={startCookingMode}
                  >
                    Start cooking
                  </button>
                }
              />

              <div
                className={`detail-banner bg-gradient-to-br ${selectedRecipe.imageGradient}`}
              >
                <div className="detail-banner__overlay">
                  <span>{selectedRecipe.cuisine}</span>
                  <span>{selectedRecipe.difficulty}</span>
                  <span>{selectedRecipe.totalTimeMinutes} min</span>
                </div>
              </div>

              <div className="stat-grid">
                <StatPill label="Servings" value={String(selectedRecipe.servings)} />
                <StatPill
                  label="Calories"
                  value={String(selectedRecipe.calories)}
                  accent="accent"
                />
                <StatPill
                  label="Protein"
                  value={`${selectedRecipe.protein}g`}
                  accent="neutral"
                />
              </div>

              <div className="detail-section">
                <h3>Ingredients</h3>
                <ul className="detail-list">
                  {selectedRecipe.ingredients.map((ingredient) => (
                    <li key={ingredient.name}>
                      <strong>{ingredient.amount}</strong> {ingredient.name}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="detail-section">
                <h3>Steps</h3>
                <ol className="detail-list detail-list--numbered">
                  {selectedRecipe.steps.map((step) => (
                    <li key={step.title}>
                      <strong>{step.title}</strong>
                      <p>{step.detail}</p>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="detail-section">
                <h3>Nutrition estimate</h3>
                <p className="muted-copy">
                  {selectedRecipe.calories} cal • {selectedRecipe.protein}g protein •{" "}
                  {selectedRecipe.carbs}g carbs • {selectedRecipe.fat}g fat
                </p>
              </div>
            </article>
          </aside>
        </div>
      </section>
    );
  };

  const renderPlanner = () => (
    <section className="panel-stack">
      <SectionHeader
        eyebrow="Meal planner"
        title="Build a weekly plan that feeds your shopping flow"
        description="Meal assignments reuse a single planning flow and regenerate the planned shopping items automatically."
      />

      <div className="planner-layout">
        <article className="feature-card">
          <div className="planner-grid">
            {WEEK_DAYS.map((day) => (
              <div key={day} className="planner-day">
                <h3>{day}</h3>
                <div className="planner-day__slots">
                  {MEAL_SLOTS.map((slot) => {
                    const existingMeal = plannerRecipes.find(
                      (meal) => meal.day === day && meal.slot === slot,
                    );
                    return (
                      <label key={`${day}-${slot}`} className="planner-select">
                        <span className="planner-select__label">{slot}</span>
                        <select
                          className="field__input"
                          value={existingMeal?.recipeId ?? ""}
                          onChange={(event) => assignMeal(day, slot, event.target.value)}
                        >
                          <option value="">Unplanned</option>
                          {mockRecipes.map((recipe) => (
                            <option key={recipe.id} value={recipe.id}>
                              {recipe.title}
                            </option>
                          ))}
                        </select>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="feature-card">
          <SectionHeader
            eyebrow="Planner overview"
            title="Upcoming meals"
            description="This list is optimized for quick scanning on mobile and easy calendar expansion later."
          />
          <div className="stack-list">
            {plannerRecipes.map((meal) => (
              <div key={`${meal.day}-${meal.slot}`} className="stack-list__item">
                <div>
                  <p className="stack-list__title">
                    {meal.day} • {meal.slot}
                  </p>
                  <p className="stack-list__meta">{meal.recipe.title}</p>
                </div>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => openRecipe(meal.recipe.id)}
                >
                  View recipe
                </button>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );

  const renderShopping = () => (
    <section className="panel-stack">
      <SectionHeader
        eyebrow="Shopping list"
        title="Aggregated ingredients plus custom items"
        description="Planned recipe ingredients and custom additions live in one checklist with clear sources."
        action={
          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              updateState((current) => ({
                ...current,
                shoppingItems: [
                  ...generateShoppingItems(current.plannerMeals),
                  ...current.shoppingItems.filter((item) => item.source === "custom"),
                ],
              }))
            }
          >
            Regenerate from planner
          </button>
        }
      />

      <div className="shopping-layout">
        <article className="feature-card">
          <div className="add-item-row">
            <label className="field field--grow">
              <span className="field__label">Add custom item</span>
              <input
                className="field__input"
                value={customItem}
                onChange={(event) => setCustomItem(event.target.value)}
                placeholder="Milk, berries, parchment paper..."
              />
            </label>
            <button type="button" className="primary-button" onClick={addCustomShoppingItem}>
              Add
            </button>
          </div>

          <div className="checklist">
            {state.shoppingItems.map((item) => (
              <label
                key={item.id}
                className={`checklist__item ${
                  item.checked ? "checklist__item--checked" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleShoppingItem(item.id)}
                />
                <span>
                  {item.label}{" "}
                  <em className="muted-copy">
                    ({item.source === "planned" ? "planned meal" : "custom"})
                  </em>
                </span>
              </label>
            ))}
          </div>
        </article>

        <article className="feature-card">
          <SectionHeader
            eyebrow="Shopping progress"
            title="Stay on track"
            description="Quick stats help users complete their list without navigating away."
          />
          <div className="stat-grid">
            <StatPill label="Items" value={String(state.shoppingItems.length)} />
            <StatPill
              label="Checked"
              value={String(state.shoppingItems.filter((item) => item.checked).length)}
              accent="accent"
            />
            <StatPill
              label="Remaining"
              value={String(state.shoppingItems.filter((item) => !item.checked).length)}
              accent="neutral"
            />
          </div>
        </article>
      </div>
    </section>
  );

  const renderFavorites = () => (
    <section className="panel-stack">
      <SectionHeader
        eyebrow="Favorites & collections"
        title="Keep your go-to recipes organized"
        description="Favorites and curated collections are available from the same reusable save flow."
      />

      <div className="favorites-layout">
        <article className="feature-card">
          <h3 className="subsection-title">Favorite recipes</h3>
          <div className="recipe-grid">
            {favoriteRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isFavorite
                onOpen={openRecipe}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </article>

        <article className="feature-card">
          <h3 className="subsection-title">Collections</h3>
          <div className="collection-list">
            {state.collections.map((collection) => (
              <div key={collection.id} className="collection-card">
                <p className="collection-card__title">{collection.name}</p>
                <p className="collection-card__meta">
                  {collection.recipeIds.length} recipes
                </p>
                <div className="collection-card__chips">
                  {collection.recipeIds.map((recipeId) => (
                    <button
                      key={recipeId}
                      type="button"
                      className="chip"
                      onClick={() => openRecipe(recipeId)}
                    >
                      {getRecipeById(recipeId).title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );

  const renderProfile = () => (
    <section className="panel-stack">
      <SectionHeader
        eyebrow="Account & preferences"
        title="Authentication and synced profile settings"
        description="The current backend only exposes health, so auth and sync are presented through a ready-to-integrate boundary."
      />

      <div className="profile-layout">
        <article className="feature-card">
          <div className="auth-card">
            <div>
              <p className="section-header__eyebrow">
                {state.isAuthenticated ? "Signed in" : "Authentication"}
              </p>
              <h3 className="subsection-title">
                {state.authMode === "signin" ? "Welcome back" : "Create your account"}
              </h3>
              <p className="muted-copy">
                Email and OAuth can connect here once backend auth endpoints are added.
              </p>
            </div>
            <div className="auth-form">
              <label className="field">
                <span className="field__label">Email</span>
                <input className="field__input" defaultValue={state.user.email} />
              </label>
              <label className="field">
                <span className="field__label">Password</span>
                <input className="field__input" type="password" defaultValue="password" />
              </label>
              <button type="button" className="primary-button" onClick={submitAuth}>
                {state.authMode === "signin" ? "Sign in" : "Create account"}
              </button>
              <button type="button" className="ghost-button" onClick={toggleAuthMode}>
                Switch to {state.authMode === "signin" ? "sign up" : "sign in"}
              </button>
            </div>
          </div>
        </article>

        <article className="feature-card">
          <h3 className="subsection-title">Preferences</h3>

          <div className="preferences-section">
            <p className="preferences-section__label">Preferred cuisines</p>
            <div className="chips">
              {cuisines
                .filter((cuisine) => cuisine !== "All")
                .map((cuisine) => (
                  <button
                    key={cuisine}
                    type="button"
                    className={`chip ${
                      state.user.preferredCuisines.includes(cuisine)
                        ? "chip--active"
                        : ""
                    }`}
                    onClick={() => updateUserPreference("preferredCuisines", cuisine)}
                  >
                    {cuisine}
                  </button>
                ))}
            </div>
          </div>

          <div className="preferences-section">
            <p className="preferences-section__label">Dietary preferences</p>
            <div className="chips">
              {dietaryOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`chip ${
                    state.user.dietaryPreferences.includes(option)
                      ? "chip--active"
                      : ""
                  }`}
                  onClick={() => updateUserPreference("dietaryPreferences", option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="preferences-section">
            <p className="preferences-section__label">Allergen avoidance</p>
            <div className="chips">
              {allergenOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`chip ${
                    state.user.allergenAvoidance.includes(option)
                      ? "chip--active chip--danger"
                      : ""
                  }`}
                  onClick={() => updateUserPreference("allergenAvoidance", option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <label className="toggle-row">
            <input
              type="checkbox"
              checked={state.user.voiceEnabled}
              onChange={toggleVoice}
            />
            <span>Enable voice readout in cooking mode</span>
          </label>

          <button type="button" className="ghost-button" onClick={resetDemo}>
            Reset demo data
          </button>
        </article>
      </div>
    </section>
  );

  const renderAdmin = () => (
    <section className="panel-stack">
      <SectionHeader
        eyebrow="Admin dashboard"
        title="Content management with inline-friendly editing"
        description="This layout is designed for recipe, tag, and image workflows with future backend mutations."
      />

      <div className="admin-layout">
        <article className="feature-card">
          <div className="admin-toolbar">
            <label className="field field--grow">
              <span className="field__label">Search content</span>
              <input
                className="field__input"
                value={state.adminSearch}
                onChange={(event) =>
                  updateState((current) => ({
                    ...current,
                    adminSearch: event.target.value,
                  }))
                }
                placeholder="Search by recipe title or cuisine"
              />
            </label>

            <button type="button" className="primary-button">
              Publish changes
            </button>
          </div>

          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Recipe</th>
                  <th>Cuisine</th>
                  <th>Difficulty</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {adminRecipes.map((recipe) => (
                  <tr key={recipe.id}>
                    <td>{recipe.title}</td>
                    <td>{recipe.cuisine}</td>
                    <td>{recipe.difficulty}</td>
                    <td>{recipe.totalTimeMinutes} min</td>
                    <td>
                      <span className="table-badge">Live</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="feature-card">
          <h3 className="subsection-title">Inline edit draft</h3>
          <div className="form-grid">
            <label className="field">
              <span className="field__label">Recipe title</span>
              <input
                className="field__input"
                value={state.adminDraft.title}
                onChange={(event) =>
                  updateState((current) => ({
                    ...current,
                    adminDraft: {
                      ...current.adminDraft,
                      title: event.target.value,
                    },
                  }))
                }
              />
            </label>

            <label className="field">
              <span className="field__label">Cuisine</span>
              <input
                className="field__input"
                value={state.adminDraft.cuisine}
                onChange={(event) =>
                  updateState((current) => ({
                    ...current,
                    adminDraft: {
                      ...current.adminDraft,
                      cuisine: event.target.value,
                    },
                  }))
                }
              />
            </label>

            <label className="field">
              <span className="field__label">Difficulty</span>
              <select
                className="field__input"
                value={state.adminDraft.difficulty}
                onChange={(event) =>
                  updateState((current) => ({
                    ...current,
                    adminDraft: {
                      ...current.adminDraft,
                      difficulty: event.target.value as Difficulty,
                    },
                  }))
                }
              >
                {["Easy", "Medium", "Hard"].map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="admin-note">
            <p className="admin-note__title">Backend integration status</p>
            <p className="admin-note__description">
              The current backend OpenAPI spec only exposes a health endpoint, so
              create/update/delete actions are intentionally modeled in the UI
              without assuming unavailable mutation routes.
            </p>
          </div>
        </article>
      </div>
    </section>
  );

  const contentByNav: Record<NavKey, React.ReactNode> = {
    discover: renderDiscover(),
    planner: renderPlanner(),
    shopping: renderShopping(),
    favorites: renderFavorites(),
    profile: renderProfile(),
    admin: renderAdmin(),
  };

  if (!hydrated) {
    return (
      <main className="loading-screen">
        <div className="loading-card">
          <p className="section-header__eyebrow">Loading SmartRecipe</p>
          <h1 className="loading-card__title">Preparing your recipe workspace…</h1>
        </div>
      </main>
    );
  }

  return (
    <AppShell
      hero={hero}
      selectedNav={state.selectedNav}
      onSelectNav={(nextNav) =>
        updateState((current) => ({
          ...current,
          selectedNav: nextNav,
          isCookingMode: nextNav === "discover" ? current.isCookingMode : false,
        }))
      }
    >
      {contentByNav[state.selectedNav]}
    </AppShell>
  );
}
