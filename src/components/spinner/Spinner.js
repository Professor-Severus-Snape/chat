import './spinner.css';
import spinner from '../../img/spinner.svg';

export default class Spinner {
  constructor() {
    this.element = document.createElement('div');
    this.element.classList.add('spinner');

    const img = document.createElement('img');
    img.classList.add('spinner__img');
    img.src = spinner;
    img.alt = 'preloader';

    const text = document.createElement('p');
    text.classList.add('spinner__text');
    text.textContent = `
      Сервер размещён на бесплатном хостинге и может «засыпать» после 15 минут бездействия.
      
      Запуск обычно занимает 30–60 секунд.

      Пожалуйста, дождитесь загрузки страницы.
    `;

    this.element.append(img, text);
  }

  render() {
    document.body.append(this.element);

    this.textTimer = setTimeout(() => {
      this.element.style.display = 'flex';
    }, 1000);
  }

  removeSpinner() {
    this.element.remove();
  }
}
