require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { searchCachedRecipes, ensureIndexes, getStats, getNutritionStats, getRecipeById } = require('./services/recipes');

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Simple healthcheck
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Debug endpoint
app.get('/api/recipes/debug', async (req, res) => {
  try {
    const stats = await getStats(1);
    res.json(stats);
  } catch (err) {
    console.error('debug error', err);
    res.status(500).json({ error: 'debug-failed', message: err.message });
  }
});

// Nutrition coverage debug
app.get('/api/recipes/debug/nutrition', async (req, res) => {
  try {
    const stats = await getNutritionStats();
    res.json(stats);
  } catch (err) {
    console.error('debug nutrition error', err);
    res.status(500).json({ error: 'debug-failed', message: err.message });
  }
});

// Search endpoint: accepts filters + fridgeIngredients, offset, limit
app.post('/api/recipes/search', async (req, res) => {
  try {
    const { filters = {}, fridgeIngredients = [], offset = 0, limit = 24 } = req.body;
    console.log('SEARCH /api/recipes/search', { filtersSummary: {
      query: filters.query || null,
      cuisines: filters.cuisines ? filters.cuisines.length : 0,
      diets: filters.diets ? filters.diets.length : 0,
      intolerances: filters.intolerances ? filters.intolerances.length : 0,
      priceBuckets: filters.priceBuckets ? filters.priceBuckets.length : 0
    }, fridgeCount: fridgeIngredients.length, offset, limit });
    const result = await searchCachedRecipes({ filters, fridgeIngredients, offset, limit });
    console.log('SEARCH result', { totalResults: result.totalResults, returned: (result.results || []).length });
    res.json(result);
  } catch (err) {
    console.error('search error', err);
    res.status(500).json({ error: 'search-failed', message: err.message });
  }
});

// Get single recipe by ID
app.get('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await getRecipeById(id);
    if (!recipe) {
      return res.status(404).json({ error: 'not-found', message: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (err) {
    console.error('get recipe error', err);
    res.status(500).json({ error: 'get-failed', message: err.message });
  }
});

async function start() {
  try {
    await ensureIndexes();
    app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
