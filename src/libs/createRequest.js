export default async function createRequest(options) {
  const isDev = window.location.hostname === 'localhost';

  const baseUrl = isDev
    ? 'http://localhost:7070' // локальный сервер
    : 'https://ahj-websockets-backend.onrender.com'; // сервер на render.com

  const { method, url, body } = options;

  try {
    const response = await fetch(baseUrl + url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // проверка подключения к серверу:
    if (response.status === 204) {
      return { status: response.status, message: 'Server found!' };
    }

    return await response.json(); // response.status = 200 (ok) || 409 (conflict)
  } catch (err) {
    return { error: true, status: 520 };
  }
}
