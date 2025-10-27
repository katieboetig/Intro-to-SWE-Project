const BASE = 'https://api.spoonacular.com';

const withKey = (params = {}) => {
  const url = new URLSearchParams(params);
  url.set('apiKey', import.meta.env.VITE_SPOONACULAR_KEY);
  return url.toString();
};

// Search recipes (title, cuisine, diet, intolerances, etc.)
export async function searchRecipes({
  query = '',
  number = 20,
  cuisine = '',
  diet = '',
  intolerances = '',
  sort = 'popularity'
} = {}) {
  const qs = withKey({
    query,
    number,
    addRecipeInformation: true, // include images, summary, etc.
    fillIngredients: true,
    cuisine,
    diet,
    intolerances,
    sort
  });
  const res = await fetch(`${BASE}/recipes/complexSearch?${qs}`);
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  const data = await res.json();
  return data.results || [];
}

// Get full info for a specific recipe (for the modal)
export async function getRecipeById(id) {
  const qs = withKey({ includeNutrition: false });
  const res = await fetch(`${BASE}/recipes/${id}/information?${qs}`);
  if (!res.ok) throw new Error(`Details failed: ${res.status}`);
  return res.json();
}
