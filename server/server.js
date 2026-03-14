import http from 'node:http';
import crypto from 'node:crypto';
import cors from 'cors';
import express from 'express';
import WebSocket, { WebSocketServer } from 'ws';

const app = express();
app.use(cors()); // безопасность в браузере (проблема несовпадения origin)
app.use(express.json()); // парсинг body на сервере (из строки получаем json)

// -------------------------------
// Проверка подключения к серверу:
// -------------------------------
app.get('/ping-server', (_request, response) => {
  response.status(204).end();
});

// Map-коллекция юзеров, находящихся в онлайн: userId → { 'id': '...', 'name': '...' }
const onlineUsers = new Map();

// кешированный JSON из массива юзеров:
let cachedUsersJSON = JSON.stringify([]);

// функция обновления кеша при изменении количества юзеров в онлайн:
const updateUsersCache = () => {
  cachedUsersJSON = JSON.stringify([...onlineUsers.values()]); // [{ 'id': '', 'name': '' }, ... ]
};

// -------------------------
// Регистрация пользователя:
// -------------------------
app.post('/new-user', (request, response) => {
  if (!request.body || !request.body.name) {
    return response.status(400).json({
      status: 'error',
      message: 'Invalid request',
    });
  }

  const { name } = request.body;

  // проверка имени на уникальность:
  const isNameTaken = [...onlineUsers.values()].some((user) => user.name === name);

  if (isNameTaken) {
    return response.status(409).json({
      status: 'error',
      message: 'This name is already taken!',
    });
  }

  const newUser = {
    id: crypto.randomUUID(),
    name,
  };

  onlineUsers.set(newUser.id, newUser); // добавляем юзера в онлайн коллекцию
  updateUsersCache(); // обновляем список пользователей
  broadcast(cachedUsersJSON); // всем клиентам рассылаем обновлённый список

  return response.json({
    status: 'ok',
    user: newUser,
  });
});

// --------------------
// Настройка WebSocket:
// --------------------
const server = http.createServer(app); // текущий настроенный http-сервер
const wsServer = new WebSocketServer({ server });

// функция рассылки сообщений всем клиентам:
const broadcast = (...args) => {
  wsServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(...args);
    }
  });
};

// подключение нового юзера (событие 'connection'):
wsServer.on('connection', (ws) => {
  ws.send(cachedUsersJSON); // отправляем текущий список юзеров (берём из кэша)

  // событие 'message' - при отправке данных через ws.send():
  ws.on('message', (msg, isBinary) => {
    let data;

    try {
      data = JSON.parse(msg.toString());
    } catch {
      return;
    }

    // -------------------
    // Отправка сообщения:
    // -------------------
    // data = { type: 'send', msg: '...', user: { id: '...', name: '...' }, created: '...' }
    if (data.type === 'send') {
      // привязка ws.user к сессии при первом сообщении:
      if (!ws.user && data.user) {
        const user = onlineUsers.get(data.user.id); // поиск юзера в коллекции onlineUsers
        if (user) {
          ws.user = user; // привязка
        }
      }

      broadcast(msg, { binary: isBinary }); // рассылаем сообщение всем юзерам в онлайн
    }

    // -------------------
    // Выход пользователя:
    // -------------------
    // data = { type: 'exit', user: { id: '...', name: '...' } }
    if (data.type === 'exit') {
      if (ws.user) {
        onlineUsers.delete(ws.user.id);
        ws.user = null;
        updateUsersCache();
        broadcast(cachedUsersJSON);
      }
      return;
    }
  });

  // --------------------
  // Закрытие соединения:
  // --------------------
  ws.on('close', () => {
    if (ws.user && onlineUsers.has(ws.user.id)) {
      onlineUsers.delete(ws.user.id);
      updateUsersCache();
      broadcast(cachedUsersJSON);
    }
  });
});

const port = process.env.PORT || 7070;

const bootstrap = () => {
  try {
    server.listen(port, () => console.log(`Server has been started on http://localhost:${port}`));
  } catch (error) {
    console.error(error);
  }
};

bootstrap();
