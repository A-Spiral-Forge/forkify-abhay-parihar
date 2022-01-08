import { async } from 'regenerator-runtime';
import * as config from './config.js';
import { AJAX } from './helpers.js';

/**
 * An object to store recipe which will be displayed, bookmarks of user and the list of recipes which user searched for.
 */

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

/**
 * 
 * @param {object} data An object that generated from a promise and contains data for a specific recipe which user wants to display in detailed view.
 * @returns An abject that contains all relevent information about recipe which will be displayed
 */

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

/**
 * This function makes an AJAX call to API for the particular recipe data. 
 * @param {string} id ID of the recipe which is to be displyed in detailed view
 */

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

/**
 * This function makes an AJAX call to API for all recipes that contains given query in their name/title.
 * @param {string} query Search query for which the recipe reults to be displayed
 */

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
    } catch (err) {
        throw err;
    }
}

/**
 * This function is basically helpful in making pagination view in User Interface.
 * @param {number} page The page number which is to be displayed on screen, optional
 * @returns An array for all recipes which will be displyed on screen
 */

export const getSearchResultsPage = function (page = state.search.page) {
    state.search.page = page;

    const start = (page - 1) * state.search.resultsPerPage;
    const end = page * state.search.resultsPerPage;

    return state.search.results.slice(start, end);
}

/**
 * This function basically sontrols the amount of ingredients to be desplayed.
 * @param {number} newServings The number of servings taken from UI
 */

export const updateServings = function (newServings) {
    state.recipe.ingredients.forEach(ingredient => {
        ingredient.quantity = (ingredient.quantity) * newServings / state.recipe.servings;
    });

    state.recipe.servings = newServings;
}

/**
 * Updating bookamrks in local storage to display when page loads
 */

const persistBookmarks = function () {
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
}

/**
 * This function add recipe to bookmarks and call to update the local storage
 * @param {object} recipe Obejct containing recipe details to store in bookmarks array for future access
 */

export const addBookmark = function (recipe) {
    state.bookmarks.push(recipe);

    if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

    persistBookmarks();
}

/**
 * This function searches for the recipe with given ID and delete from the bookmarks and call for update the local storage
 * @param {number} id ID of the recipe to be removed from bookmarks
 */

export const deleteBookmark = function (id) {
    const index = state.bookmarks.findIndex(el => el.id === id);
    state.bookmarks.splice(index, 1);

    if (id === state.recipe.id) state.recipe.bookmarked = false;

    persistBookmarks();
}

/**
 * This function basically access bookamrks from local storage to display in bookamrks bar of the web page
 */

const init = function () {
    const storage = localStorage.getItem('bookmarks');

    if (!storage) return;

    state.bookmarks = JSON.parse(storage);
}

init();

/**
 * This function is for developer use and for developing purpose only.
 */

const clearBookmarks = function () {
    localStorage.removeItem('bookmarks');
}

/**
 * This function make a POST request to API with a developer key. 
 * This function stores the user generated recipe data on API server so it can be accessed by the user when he uses that key.
 * @param {object} newRecipe Object which contains every relevent information about new recipe
 */

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