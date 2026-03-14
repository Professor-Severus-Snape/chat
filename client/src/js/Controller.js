import Chat from '../components/chat/Chat';
import Modal from '../components/modal/Modal';
import ServerError from '../components/serverError/ServerError';
import Service from '../libs/Service';
import Spinner from '../components/spinner/Spinner';
import Users from '../components/users/Users';

export default class Controller {
  constructor(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('This is not HTML element!');
    }

    this.container = container;
    this.spinner = new Spinner();
  }

  async init() {
    this.spinner.render(); // ожидание первого ответа от сервера...
    const server = await Service.pingServer(); // ждём ответа от сервера
    this.spinner.removeSpinner(); // убираем спиннер после получения ответа от сервера

    // обработка ошибки подключения к серверу:
    if (server.status === 520) {
      this.serverError = new ServerError(server.status); // отрисовать ошибку сервера
      return;
    }

    this.renderModal();
  }

  renderModal() {
    this.modal = new Modal(); // отрисовка модального окна для запроса никнейма юзера
    this.modal.submitEvent(this.addModalSubmitEvent.bind(this));
  }

  async addModalSubmitEvent(event) {
    event.preventDefault();

    const name = this.modal.getInputValue();

    if (!name) {
      this.modal.showTooltip('Поле не должно быть пустым!'); // показать подсказку на 2 сек
      setTimeout(() => this.modal.hideTooltip(), 1000 * 2); // убрать подсказку
      return;
    }

    const data = await Service.registerUser(name); // попытка регистрации юзера на сервере

    // ---------- ошибка сервера при отправке данных: ----------
    // data: { error: true, status: 520 };
    if (data.error) {
      this.modal.removeForm(); // удалить модалку из DOM
      this.serverError = new ServerError(data.status); // отрисовать ошибку сервера
      return;
    }

    // -------------------- занятый никнейм: -------------------
    // data: { status: "error", message: "This name is already taken!" }
    if (data.status === 'error') {
      this.modal.showTooltip('Это имя уже занято! Выберите другое!'); // показать на 2 сек, что имя занято
      setTimeout(() => this.modal.hideTooltip(), 1000 * 2); // убрать подсказку
      return;
    }

    // ------------------- работа с юзером!!! ------------------
    // data: { status: "ok", user { id: "...", name: "..." } }
    if (data.status === 'ok') {
      this.currentId = data.user.id; // свой id
      this.currentName = data.user.name; // своё имя

      window.addEventListener('beforeunload', this.exit.bind(this)); // перед закрытием страницы...

      this.modal.removeForm(); // удаляем модалку из DOM
      this.renderPage(); // отрисовываем страницу чата
    }
  }

  exit() {
    const msg = {
      type: 'exit',
      user: { id: this.currentId, name: this.currentName },
    };

    this.ws.send(JSON.stringify(msg)); // отправка данных через ws-соединение
  }

  renderPage() {
    this.container.classList.remove('hidden'); // отрисовка контейнера для всего контента
    this.usersContainer = new Users(this.container); // отрисовка контейнера для юзеров
    this.chatContainer = new Chat(this.container); // отрисовка контейнера для сообщений

    this.chatContainer.addSubmitEvent(this.addChatSubmitEvent.bind(this)); // 'submit'

    this.connectToWebSocket(); // подключаем сокеты
  }

  connectToWebSocket() {
    const isDev = window.location.hostname === 'localhost';

    this.ws = isDev
      ? new WebSocket('ws://localhost:7070/ws') // локальный сервер
      : new WebSocket('wss://chat-7uau.onrender.com/ws'); // сервер на render.com

    // событие 'open' - возникает только 1 раз на каждой странице
    // this.ws.addEventListener('open', (event) => {
    //   console.log('ws open', event);
    // });

    // событие 'message' - при входе каждого нового юзера и при ws.send()
    this.ws.addEventListener('message', (event) => {
      // data = [ { id: '...', name: '...' }, ... ] <- массив юзеров, если type !== 'send'
      // data = { type: "send", msg: "...", user: {id: "...", name: "..."}, created: "..." }
      const data = JSON.parse(event.data);

      // отрисовка сообщений у всех юзеров:
      if (data.type === 'send') {
        const name = data.user.id === this.currentId ? 'You' : data.user.name;
        const info = `${name}, ${data.created}`;
        this.chatContainer.addMessage(info, data.msg, name === 'You'); // 'Julia, 20:50 19.09.2024', 'Hello!', true
        this.chatContainer.resetForm(); // очищаем форму
        return;
      }

      // обновление списка юзеров при входе/выходе каждого юзера:
      this.usersContainer.deleteUsers(); // 1. полная очистка списка юзеров

      data.forEach((user) => {
        const name = user.id === this.currentId ? 'You' : user.name;
        this.usersContainer.addUser(name); // 2. добавление заново всех юзеров, которые онлайн
      });
    });

    // this.ws.addEventListener('error', (event) => {
    //   console.error('ws error', event);
    // });

    // this.ws.addEventListener('close', (event) => {
    //   console.warn('ws close', event);
    // });
  }

  addChatSubmitEvent(event) {
    event.preventDefault();

    const message = this.chatContainer.getMessage();

    if (!message) {
      this.chatContainer.resetForm(); // очищаем форму
      return;
    }

    this.sendMsg(message);
  }

  sendMsg(message) {
    const date = new Date(Date.now()).toLocaleString('ru-Ru', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const formattedDate = date.split(', ').reverse().join(' ');

    const msg = {
      type: 'send',
      msg: message,
      user: {
        id: this.currentId,
        name: this.currentName,
      },
      created: formattedDate,
    };

    this.ws.send(JSON.stringify(msg)); // отправка данных через ws-соединение
  }
}
