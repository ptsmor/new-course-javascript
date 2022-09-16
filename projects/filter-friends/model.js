const VK = require('vk-openapi');

if (!localStorage.getItem('allFriends')) {
  localStorage.setItem(
    'allFriends',
    JSON.stringify({
      simple: {},
      best: {},
    })
  );
}
const allFriends = JSON.parse(localStorage.getItem('allFriends'));

module.exports = {
  login(apiId, permissions) {
    return new Promise(function (resolve, reject) {
      VK.init({
        apiId: apiId,
      });
      VK.Auth.login(function (response) {
        if (response.session) {
          resolve();
        } else {
          reject(new Error('Не удалось авторизоваться'));
        }
      }, permissions);
    });
  },
  callAPI(method, params) {
    params.v = '5.131';

    return new Promise(function (resolve, reject) {
      VK.Api.call(method, params, function (data) {
        if (data.error) {
          reject(data.error);
        } else {
          resolve(data.response);
        }
      });
    });
  },
  getUser(params = {}) {
    return this.callAPI('users.get', params);
  },
  getFriends(params = {}) {
    return this.callAPI('friends.get', params);
  },
  allFriends,
  updateStorage() {
    localStorage.setItem('allFriends', JSON.stringify(this.allFriends));
  },
};
