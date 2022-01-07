import * as model from './model.js';
import * as config from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { MODAL_CLOSE_SEC } from './config.js';

// https://forkify-api.herokuapp.com/v2

// if(module.hot) {
//     module.hot.accept();
// }

///////////////////////////////////////

async function controlRecipes() {
    try {
        const id = window.location.hash.slice(1);

        if (id === '') {
            recipeView.renderInitial();
            return;
        }

        recipeView.renderSpinner();

        resultsView.update(model.getSearchResultsPage());
        bookmarksView.update(model.state.bookmarks);
        await model.loadRecipe(id);
        recipeView.render(model.state.recipe);
    } catch (err) {
        recipeView.renderError();
    }
}

async function controlSearchResults() {
    try {

        const query = searchView.getQuery().trim();
        if (!query) return;
        resultsView.renderSpinner();

        await model.loadSearchResults(query);
        console.log(model.state.search.results);
        // resultsView.render(model.state.search.results);
        resultsView.render(model.getSearchResultsPage(1));

        paginationView.render(model.state.search);
    } catch (err) {
        console.log(err);
    }
}

function controlPagination(goToPage) {
    resultsView.render(model.getSearchResultsPage(goToPage));
    paginationView.render(model.state.search);
}

function controlServings(servings) {
    if (servings <= 0) return alert('Servings must be positive.');

    model.updateServings(servings);
    // recipeView.render(model.state.recipe);
    recipeView.update(model.state.recipe);
}

function controlAddBookmark() {
    if (model.state.recipe.bookmarked) model.deleteBookmark(model.state.recipe.id);
    else model.addBookmark(model.state.recipe);

    recipeView.update(model.state.recipe);

    bookmarksView.render(model.state.bookmarks);
}

function controlBookmarks() {
    bookmarksView.render(model.state.bookmarks);
}

async function controlAddRecipe(newRecipe) {
    try {
        addRecipeView.renderSpinner();

        await model.uploadRecipe(newRecipe);
        console.log(model.state.recipe);

        recipeView.render(model.state.recipe);
        addRecipeView.renderMessage();
        bookmarksView.render(model.state.bookmarks);
        window.history.pushState(null, '', `#${model.state.recipe.id}`);

        setTimeout(() => {
            addRecipeView.toggleWindow();
        }, config.MODAL_CLOSE_SEC * 1000);
    } catch (err) {
        addRecipeView.renderError(err);
        console.log(err);
    }
}

function init() {
    recipeView.addHandlerRender(controlRecipes);
    recipeView.addHandlerUpdateServings(controlServings);
    recipeView.addHandlerAddBookmark(controlAddBookmark);
    searchView.addHandlerSearch(controlSearchResults);
    paginationView.addHandlerClick(controlPagination);
    bookmarksView.addHandlerRander(controlBookmarks);
    addRecipeView.addHandlerUpload(controlAddRecipe);
}

init();