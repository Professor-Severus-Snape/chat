import createRequest from './createRequest';

export default class Service {
  // проверка связи с сервером:
  static async pingServer() {
    const options = {
      method: 'GET',
      url: '/ping-server',
    };

    const data = await createRequest(options); // { status: 204, message: 'Server found!' }
    return data;
  }

  // регистрация нового юзера на сервере:
  static async registerUser(name) {
    const options = {
      method: 'POST',
      url: '/new-user',
      body: {
        name,
      },
    };

    const data = await createRequest(options); // {status: 'ok', user: { id: '...', name: '...' } }
    return data;
  }
}
