import { async } from 'regenerator-runtime';
import * as config from './config.js';
import { AJAX } from './helpers.js';

export const state = {
    recipe: {},
    search: {
        query: '',
        results: [],
        resultsPerPage: config.RESULTS_PER_PAGE,
        page: 1,
    },
    bookmarks: [],
}

const createRecipeObejct = function (data) {
    let { recipe } = data.data;
    return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        sourceUrl: recipe.source_url,
        image: recipe.image_url,
        servings: recipe.servings,
        cookingTime: recipe.cooking_time,
        ingredients: recipe.ingredients,
        ...(recipe.key && { key: recipe.key }),
    }
}

export const loadRecipe = async function (id) {
    try {
        const data = await AJAX(`${config.API_URL}/${id}?key=${config.KEY}`);

        state.recipe = createRecipeObejct(data);

        if (state.bookmarks.some(bookmark => bookmark.id === id)) {
            state.recipe.bookmarked = true;
        } else {
            state.recipe.bookmarked = false;
        }

        console.log(state.recipe);
    } catch (err) {
        throw err;
    }
}

export const loadSearchResults = async function (query) {
    try {
        const data = await AJAX(`${config.API_URL}?search=${query}&key=${config.KEY}`);

        state.search.query = query;
        state.search.results = data.data.recipes.map(recipe => {
            return {
                id: recipe.id,
                title: recipe.title,
                publisher: recipe.publisher,
                image: recipe.image_url,
                ...(recipe.key && { key: recipe.key }),
            };
        });
        console.log(data);
    } catch (err) {
        throw err;
    }
}

export const getSearchResultsPage = function (page = state.search.page) {
    state.search.page = page;

    const start = (page - 1) * state.search.resultsPerPage;
    const end = page * state.search.resultsPerPage;

    return state.search.results.slice(start, end);
}

export const updateServings = function (newServings) {
    state.recipe.ingredients.forEach(ingredient => {
        ingredient.quantity = (ingredient.quantity) * newServings / state.recipe.servings;
    });

    state.recipe.servings = newServings;
}

const persistBookmarks = function () {
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
}

export const addBookmark = function (recipe) {
    state.bookmarks.push(recipe);

    if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

    persistBookmarks();
}

export const deleteBookmark = function (id) {
    const index = state.bookmarks.findIndex(el => el.id === id);
    state.bookmarks.splice(index, 1);

    if (id === state.recipe.id) state.recipe.bookmarked = false;

    persistBookmarks();
}

const init = function () {
    const storage = localStorage.getItem('bookmarks');

    if (!storage) return;

    state.bookmarks = JSON.parse(storage);
    console.log(state.bookmarks);
}

init();

const clearBookmarks = function () {
    localStorage.removeItem('bookmarks');
}

export const uploadRecipe = async function (newRecipe) {
    try {
        console.log(Object.entries(newRecipe));
        const ingredients = Object.entries(newRecipe).filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '').map(ingredient => {
            const ingArr = ingredient[1].split(',').map(ing => ing.trim());

            if (ingArr.length !== 3) {
                throw new Error('Invalid ingredient format. Please enter a valid format!!');
            }

            const [quantity, unit, description] = ingArr;
            return { quantity: quantity ? +quantity : null, unit, description };
        });
        console.log(ingredients);

        const recipe = {
            title: newRecipe.title,
            source_url: newRecipe.sourceUrl,
            image_url: newRecipe.image,
            publisher: newRecipe.publisher,
            cooking_time: newRecipe.cookingTime,
            servings: newRecipe.servings,
            ingredients,
        }

        const data = await AJAX(`${config.API_URL}?key=${config.KEY}`, recipe);
        console.log(data);
        state.recipe = createRecipeObejct(data);
        addBookmark(state.recipe);
    } catch (err) {
        throw err;
    }
}