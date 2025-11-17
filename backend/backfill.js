require('dotenv').config();
const axios = require('axios');
const { upsertRecipes } = require('./services/recipes');

const SPOON_KEY = process.env.SPOONACULAR_KEY || process.env.VITE_SPOONACULAR_KEY;
if (!SPOON_KEY) {
  console.error('SPOONACULAR_KEY or VITE_SPOONACULAR_KEY not set in env - backfill cannot run');
  process.exit(1);
}

async function fetchPage(offset = 0, number = 100) {
  const url = 'https://api.spoonacular.com/recipes/complexSearch';
  const params = {
    apiKey: SPOON_KEY,
    number,
    offset,
    addRecipeInformation: true,
    fillIngredients: true,
  };
  const res = await axios.get(url, { params });
  return res.data;
}

async function run() {
  console.log('Starting backfill from Spoonacular...');
  let offset = 0;
  const pageSize = 100;
  let total = Infinity;
  let fetched = 0;
  while (offset < total) {
    console.log(`Fetching offset=${offset}`);
    const data = await fetchPage(offset, pageSize);
    const results = data.results || [];
    if (total === Infinity) total = data.totalResults || results.length;
    if (!results.length) break;
    await upsertRecipes(results);
    fetched += results.length;
    offset += results.length;
    // be nice to the API
    await new Promise((r) => setTimeout(r, 800));
    // simple safety cap - increase to fetch broader dataset for filtering
    if (fetched > 10000) {
      console.log('Reached safety cap of 10000 recipes during backfill');
      break;
    }
  }

  console.log('Backfill complete. Fetched', fetched);
  process.exit(0);
}

run().catch((err) => {
  console.error('Backfill failed', err);
  process.exit(1);
});
