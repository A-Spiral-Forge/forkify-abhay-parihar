import { icons } from 'url:../../img/icons.svg';
import View from './view.js';

class AddRecipeView extends View {
    _parentElement = document.querySelector('.upload');
    _message = 'Recipe was uploaded successfully :)';

    _window = document.querySelector('.add-recipe-window');
    _overlay = document.querySelector('.overlay');
    _closeModalBtn = document.querySelector('.btn--close-modal');
    _openModalBtn = document.querySelector('.nav__btn--add-recipe');

    constructor() {
        super();
        this._addHandlerShowWindow();
        this._addHandlerHideWindow();
    }

    toggleWindow() {
        this._window.classList.toggle('hidden');
        this._overlay.classList.toggle('hidden');
    }

    _addHandlerShowWindow() {
        this._openModalBtn.addEventListener('click', this.toggleWindow.bind(this));
    }

    _addHandlerHideWindow() {
        this._overlay.addEventListener('click', this.toggleWindow.bind(this));
        this._closeModalBtn.addEventListener('click', this.toggleWindow.bind(this));
    }

    addHandlerUpload(handler) {
        this._parentElement.addEventListener('submit', e => {
            e.preventDefault();
            const dataArr = [...new FormData(this._parentElement)];
            const data = Object.fromEntries(dataArr);
            handler(data);
        });
    }

    _generateMarkup() {

    }
}

export default new AddRecipeView();