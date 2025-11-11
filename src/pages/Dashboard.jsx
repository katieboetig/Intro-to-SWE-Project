import { useEffect, useRef, useState } from "react"
import { Home, BookOpen, FileText, LogOut } from "lucide-react"
import { useAuth } from "../auth/AuthContext"
import Fridge3D from "../components/Fridge3D"
import SidePanel from "../components/SidePanel"
import PhotoUploadButton from "../components/PhotoUploadButton"
import RecipeFiltersSidebar from "../components/RecipeFiltersSidebar"
import RecipeModal from "../components/RecipeModal"
import { searchRecipes } from "../spoonacular"


const mockIngredients = [
  {
    id: 1,
    name: "Tomato",
    icon: "🍅",
    nutrition: {
      calories: "18 kcal",
      protein: "0.9g",
      carbs: "3.9g",
      fat: "0.2g",
      fiber: "1.2g",
    },
    description: "Fresh, ripe tomatoes packed with vitamins and antioxidants.",
  },
  {
    id: 2,
    name: "Broccoli",
    icon: "🥦",
    nutrition: {
      calories: "34 kcal",
      protein: "2.8g",
      carbs: "7g",
      fat: "0.4g",
      fiber: "2.6g",
    },
    description: "Nutrient-rich green vegetable high in vitamins C and K.",
  },
  {
    id: 3,
    name: "Carrot",
    icon: "🥕",
    nutrition: {
      calories: "41 kcal",
      protein: "0.9g",
      carbs: "10g",
      fat: "0.2g",
      fiber: "2.8g",
    },
    description: "Crunchy root vegetable rich in beta-carotene.",
  },
  {
    id: 4,
    name: "Cheese",
    icon: "🧀",
    nutrition: {
      calories: "402 kcal",
      protein: "25g",
      carbs: "1.3g",
      fat: "33g",
      fiber: "0g",
    },
    description: "Delicious dairy product high in calcium and protein.",
  },
]

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [ingredients, setIngredients] = useState([])
  const [selectedIngredient, setSelectedIngredient] = useState(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("home")

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [openId, setOpenId] = useState(null);

  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LOAD_SIZE = 24;
  const sentinelRef = useRef(null);

  const [filters, setFilters] = useState({
    query: "",
    cuisines: [],
    diets: [],
    intolerances: [],
    priceBuckets: [],
    price: { min: "", max: "" },
    calories: { min: "", max: "" },
    protein:  { min: "", max: "" },
    carbs:    { min: "", max: "" },
    fat:      { min: "", max: "" },
  });

  const handleIngredientClick = (ingredient) => {
    setSelectedIngredient(ingredient)
    setIsPanelOpen(true)
  }

  const handleIngredientsUpdate = (newIngredients) => {
    // Transform webhook data to match our component format
    const transformedIngredients = newIngredients.map((item, index) => ({
      id: index + 1,
      name: item.name,
      icon: item.emoji,
      quantity: item.quantity,
      category: item.category,
      confidence: item.confidence,
      container: item.container,
      expiry: item.expiry,
      nutrition: {
        // Placeholder nutrition data - can be enhanced later
        calories: "--",
        protein: "--",
        carbs: "--",
        fat: "--",
        fiber: "--",
      },
      description: `${item.quantity} of ${item.name} (${item.category})`
    }))
    
    setIngredients(transformedIngredients)
    console.log('Updated ingredients:', transformedIngredients)
  }


  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const mapFiltersToAPI = (f) => ({
    query: f.query || undefined,
    cuisines: f.cuisines,
    diets: f.diets,
    intolerances: f.intolerances,
    minCalories: f.calories.min !== "" ? f.calories.min : undefined,
    maxCalories: f.calories.max !== "" ? f.calories.max : undefined,
    minProtein:  f.protein.min  !== "" ? f.protein.min  : undefined,
    maxProtein:  f.protein.max  !== "" ? f.protein.max  : undefined,
    minCarbs:    f.carbs.min    !== "" ? f.carbs.min    : undefined,
    maxCarbs:    f.carbs.max    !== "" ? f.carbs.max    : undefined,
    minFat:      f.fat.min      !== "" ? f.fat.min      : undefined,
    maxFat:      f.fat.max      !== "" ? f.fat.max      : undefined,
  });

  const priceFilter = (recipe, filterState) => {
    const cents = recipe.pricePerServing ?? 0;
    const usd = cents / 100;

    const BUCKETS = [
      { min: 0,  max: 2 },
      { min: 2,  max: 5 },
      { min: 5,  max: 10 },
      { min: 10,  max: Infinity },
    ];

    const anyBucket = filterState.priceBuckets.length > 0;
    const passesBucket = !anyBucket || filterState.priceBuckets.some((idx) => {
      const b = BUCKETS[idx];
      return usd >= b.min && usd < b.max;
    });

    const customMin = filterState.price.min !== "" ? Number(filterState.price.min) : -Infinity;
    const customMax = filterState.price.max !== "" ? Number(filterState.price.max) :  Infinity;
    const passesCustom = usd >= customMin && usd <= customMax;

    return (anyBucket ? passesBucket && passesCustom : passesCustom);
  };

  async function loadPage(nextOffset, replace = false, filtersToUse = null) {
    setLoading(true);
    setErr("");

    try {
      // Use provided filters or fall back to current filters state
      const currentFilters = filtersToUse !== null ? filtersToUse : filters;
      
      const apiParams = {
        ...mapFiltersToAPI(currentFilters),
        sort: "popularity",
        number: LOAD_SIZE,
        offset: nextOffset,
      };

      const res = await searchRecipes(apiParams);
      // Support both shapes: {results,totalResults} OR array
      const results = Array.isArray(res) ? res : (res.results || []);
      const totalResults = Array.isArray(res) ? results.length : (res.totalResults ?? results.length);

      // Apply price filter client-side with the correct filter state
      const filtered = results.filter((recipe) => priceFilter(recipe, currentFilters));

      setRecipes((prev) => (replace ? filtered : [...prev, ...filtered]));
      setOffset(nextOffset + LOAD_SIZE);
      setHasMore(nextOffset + LOAD_SIZE < totalResults);
    } catch (e) {
      setErr(e.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }

  // Apply sidebar filters -> refresh list from page 0
  function applyFilters(newFilters) {
    setFilters(newFilters);
    setOffset(0);
    setHasMore(true);
    // Pass newFilters directly to avoid closure issue with stale filters
    loadPage(0, true, newFilters);
  }

  // Auto-load popular when entering the Recipes tab the first time
  useEffect(() => {
    if (activeTab === "recipes" && recipes.length === 0 && !loading) {
      loadPage(0, true);
    }
  }, [activeTab]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (activeTab !== "recipes") return;
    const el = sentinelRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          // Pass current filters to avoid stale closure
          loadPage(offset, false, filters);
        }
      },
      { rootMargin: "800px 0px" } // prefetch before hitting bottom
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [activeTab, hasMore, loading, offset, filters]); // Added filters to dependency


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">
              Welcome, {user?.displayName || "User"}!
            </h1>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                activeTab === "home"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("recipes")
                if (recipes.length === 0 && !loading) {
                  loadPage(0, true); // no args => popular
                }
              }}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                activeTab === "recipes"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">Recipes</span>
            </button>

            <button
              onClick={() => setActiveTab("blog")}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                activeTab === "blog"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium">Blog</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-4 border-b-2 border-transparent text-gray-600 hover:text-red-600 hover:border-red-300 transition-colors ml-auto"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === "home" && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">Your Smart Fridge</h2>
              <p className="text-gray-600">Click the fridge to view your ingredients</p>
            </div>

            {/* Fridge Container with Subtle Background */}
            <div className="relative">
              {/* Subtle radial gradient background */}
              <div className="absolute inset-0 bg-gradient-radial from-green-50/30 via-transparent to-orange-50/20 rounded-3xl transform scale-110 -z-10"></div>
              <div className="relative bg-gradient-to-br from-white/80 via-gray-50/60 to-white/90 rounded-2xl p-8 shadow-sm border border-gray-100/50">
                <Fridge3D ingredients={ingredients} onIngredientClick={handleIngredientClick} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "recipes" && (
          <section className="grid md:grid-cols-[18rem_1fr] gap-6">
            {/* Sidebar filters */}
            <RecipeFiltersSidebar value={filters} onChange={applyFilters} />

            {/* Results area */}
            <div className="min-h-[60vh]">
              <header className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Recipes</h2>
                <p className="text-gray-600">Filter and scroll to load more.</p>
              </header>

              {err && <p className="text-red-600 mb-3">{err}</p>}

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {recipes.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setOpenId(r.id)}
                    className="text-left border border-gray-200 rounded-xl p-3 bg-white shadow-sm flex gap-3"
                  >
                    <img
                      src={r.image}
                      alt={r.title}
                      className="w-24 h-24 rounded-lg object-cover"
                      loading="lazy"
                    />
                    <div className="flex-1">
                      {/* Clamp title to 2 lines */}
                      <div
                        className="font-semibold"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                        title={r.title}
                      >
                        {r.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {r.readyInMinutes ? `${r.readyInMinutes} min` : ""}
                        {r.readyInMinutes && r.servings ? " • " : ""}
                        {r.servings ? `${r.servings} servings` : ""}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {loading && <p className="text-gray-500 mt-4">Loading…</p>}
              {/* sentinel for infinite scroll */}
              <div ref={sentinelRef} className="h-1" />

              {/* Details modal */}
              {openId && <RecipeModal id={openId} onClose={() => setOpenId(null)} />}
            </div>
          </section>
        )}

        {activeTab === "blog" && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog</h2>
            <p className="text-gray-600">Blog content coming soon...</p>
          </div>
        )}
      </main>

      {/* Side Panel */}
      <SidePanel ingredient={selectedIngredient} isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />

      {/* Photo Upload Button */}
      <PhotoUploadButton onIngredientsUpdate={handleIngredientsUpdate} />
    </div>
  )
}
