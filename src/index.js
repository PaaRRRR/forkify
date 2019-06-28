import "./main.css";

import Search from './app/models/Search'
import Recipe from './app/models/Recipe'
import List from './app/models/List'
import Likes from './app/models/Likes'

import * as searchView from './app/views/searchView'
import * as recipeView from './app/views/recipeView'
import * as listView from './app/views/listView'
import * as likesView from './app/views/likesView'

import { elements, renderLoader, clearLoader } from './app/views/base'




const state = {
  search: {},
  recipe: {}
};

// Search Control
const controlSearch = async () => {
  const query = searchView.getInput();

  if(query) {

    state.search = new Search(query);

    searchView.clearInput();
    searchView.clearResults();

    renderLoader(elements.searchRes);

    try {
      await state.search.getResults();

      clearLoader();

      searchView.renderResults(state.search.result, state.recipe.id);
    } catch (error) {
      // console.log(error);
      alert('Something wrong with the search...');
      clearLoader();
    }
  }
}

// Input submit Event
elements.searchForm.addEventListener('submit', e => {
  e.preventDefault();
  controlSearch();
  // console.log(state);
});


// Recipe button click Event
elements.searchResPages.addEventListener('click', e => {
  const btn = e.target.closest('.btn-inline');

  if(btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, state.recipe.id, goToPage);
  }
  // console.log(state);
});

// Recipe Control
const controlRecipe = async () => {
  const id = window.location.hash.replace('#', '');

  if(id) {

    state.recipe = new Recipe(id);

    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    if(state.search) {
      searchView.highlightSelected(id);
    }

    try {
      await state.recipe.getRecipe();

      state.recipe.parseIngredients();

      state.recipe.calcTime();
      state.recipe.calcServings();

      clearLoader();
      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
    } catch (error) {
      // console.log(error);
      alert('Error processing recipe!');
    }
  }
}

// Search Recipe button click Event and load Event
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


// List Control
const controlList = () => {
  if(!state.list) {
    state.list = new List();
  }

  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
}

// shopping list button click Event
elements.shopping.addEventListener('click', e => {
  const id = e.target.closest('.shopping__item').dataset.itemid;

  if(e.target.matches('.shopping__delete, .shopping__delete *')) {

    state.list.deleteItem(id);

    listView.deleteItem(id);

  } else if (e.target.matches(".shopping__count-value")) {
    const val = parseFloat(e.target.value, 10);
    state.list.updateCount(id, val);
  }
});

// Like Control
const controlLike = () => {
  if(!state.likes) {
    state.likes = new Likes();
  }

  const currentID = state.recipe.id;

  if(!state.likes.isLiked(currentID)) {
    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );

    likesView.toggleLikeBtn(true);

    likesView.renderLike(newLike);
  } else {
    state.likes.deleteLike(currentID);

    likesView.toggleLikeBtn(false);

    likesView.deleteLike(currentID);
  }
  likesView.toggleLikeMenu(state.likes.getNumLikes());
}

// load Event
window.addEventListener('load', () => {
  state.likes = new Likes();

  state.likes.readStorage();

  likesView.toggleLikeMenu(state.likes.getNumLikes());


  state.likes.likes.forEach(likesView.renderLike);
})

// Recipe click Event total
elements.recipe.addEventListener('click', e => {
  if(e.target.matches('.btn-decrease, .btn-decrease *')) {
    if(state.recipe.servings > 1) {
      state.recipe.updateServings('dec');
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches('.btn-increase, .btn-increase *')) {
    state.recipe.updateServings('inc');
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
    controlList();
  } else if (e.target.matches('.recipe__love, .recipe__love *')) {
    controlLike();
  }
})
