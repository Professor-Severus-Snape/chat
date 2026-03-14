import './serverError.css';

// <p class="serverError">Ошибка сервера - 520. Попробуйте зайти позже...</p>
export default class ServerError {
  constructor(status) {
    this.element = document.createElement('p');
    this.element.classList.add('serverError');
    this.element.textContent = `Ошибка сервера - ${status}. Попробуйте зайти позже...`;
    document.body.append(this.element);
  }
}
