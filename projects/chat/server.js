const ws = require('ws');
const wss = new ws.Server({ port: 9090 });

const usersList = {};

const avatarsList = {};

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    const message = JSON.parse(data);

    if (message.login) {
      ws.id = message.id;
      ws.userName = message.name;
      if (avatarsList[message.name]) {
        ws.avatarUrl = avatarsList[message.name];
        message.avatarUrl = ws.avatarUrl;
      }

      usersList[ws.id] = {
        id: ws.id,
        name: ws.userName,
        avatarUrl: ws.avatarUrl,
      };

      message.usersList = usersList;
      sendAll(message);
    }

    if (message.message) {
      sendAll({
        message: {
          id: ws.id,
          name: ws.userName,
          text: message.message,
          date: message.date,
          avatarUrl: ws.avatarUrl,
        },
      });
    }

    if (message.updateAvatar) {
      ws.avatarUrl = message.avatarUrl;
      usersList[ws.id]['avatarUrl'] = message.avatarUrl;
      avatarsList[ws.userName] = ws.avatarUrl;
      sendAll({
        updateAvatar: true,
        avatarUrl: message.avatarUrl,
        id: ws.id,
      });
    }
  });

  ws.on('close', function () {
    delete usersList[ws.id];

    sendAll({
      id: ws.id,
      name: ws.userName,
      logout: true,
    });
  });
});

function sendAll(message) {
  wss.clients.forEach(function (client) {
    if (client.readyState === ws.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}
