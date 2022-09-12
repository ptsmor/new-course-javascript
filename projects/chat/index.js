import './index.html';
import './css/styles.css';
import messageTemplate from './templates/message.hbs';
import noticeTemplate from './templates/notice.hbs';
import userTemplate from './templates/user.hbs';
import modalTemplate from './templates/modal.hbs';

const socket = new WebSocket('ws://localhost:9090');

const user = {
  id: new Date().getTime(),
};

const pageLogin = document.querySelector('.page-login');
const fieldLogin = document.querySelector('#fieldLogin');
const btnLogin = document.querySelector('#btnLogin');

btnLogin.addEventListener('click', sendLogin);
fieldLogin.addEventListener('change', sendLogin);

const pageChat = document.querySelector('.page-chat');
const fieldMessage = document.querySelector('#fieldMessage');
const btnSend = document.querySelector('#btnSend');
const chatContent = document.querySelector('.chat-content');
const usersList = document.querySelector('.users-list');
const fieldCount = document.querySelector('#usersCount');

socket.addEventListener('message', function (event) {
  const message = JSON.parse(event.data);

  if (message.login) {
    addNotice(`${message.name} вошел в чат`);

    if (message.id === user.id) {
      renderUserList(message.usersList);

      if (message.avatarUrl) {
        user.avatar = message.avatarUrl;
      }
    } else {
      addSingleUser(message.usersList[message.id]);
    }

    fieldCount.textContent = Object.keys(message.usersList).length;
  }

  if (message.logout) {
    removeUser(message.id);
    addNotice(`${message.name} вышел из чата`);
  }

  if (message.message) {
    addMessage(message.message);
  }

  if (message.updateAvatar) {
    updateAvatar(message.avatarUrl, message.id);
  }
});

btnSend.addEventListener('click', sendMessage);
fieldMessage.addEventListener('change', sendMessage);

const btnSettings = document.querySelector('#btnSettings');

btnSettings.addEventListener('click', function () {
  openModal();
});

socket.addEventListener('error', function () {
  alert('Соединение закрыто или не может быть открыто');
});

function sendLogin(e) {
  e.preventDefault();

  const field = fieldLogin.value.trim();

  if (field !== '') {
    pageLogin.classList.add('is-hidden');
    pageChat.classList.remove('is-hidden');

    const data = {
      login: true,
      id: user.id,
      name: field,
    };
    socket.send(JSON.stringify(data));

    user.name = field;

    fieldLogin.value = '';
  } else {
    alert('Введите ник');
  }
}

function addNotice(text) {
  chatContent.insertAdjacentHTML(
    'beforeend',
    noticeTemplate({
      text: text,
    })
  );

  updateScroll();
}

function addMessage(messageObj) {
  chatContent.insertAdjacentHTML(
    'beforeend',
    messageTemplate({
      isMine: isMine(messageObj.id),
      id: messageObj.id,
      name: messageObj.name,
      text: messageObj.text,
      date: messageObj.date,
      avatarUrl: messageObj.avatarUrl,
    })
  );

  updateScroll();
}

function renderUserList(obj) {
  let fragment = '';

  for (const id in obj) {
    fragment += userTemplate({
      id: id,
      name: obj[id].name,
      avatarUrl: obj[id].avatarUrl,
      isMine: isMine(id),
    });
  }

  usersList.innerHTML = fragment;
}

function addSingleUser(obj) {
  usersList.insertAdjacentHTML(
    'beforeend',
    userTemplate({
      id: obj.id,
      name: obj.name,
      avatarUrl: obj.avatarUrl,
      isMine: isMine(obj.id),
    })
  );
}

function removeUser(id) {
  const user = usersList.querySelector(`[data-id="${id}"]`);
  if (user) user.remove();
}

function sendMessage(e) {
  e.preventDefault();

  const data = {
    message: fieldMessage.value,
    date: new Date().toTimeString().slice(0, 5),
  };
  socket.send(JSON.stringify(data));

  fieldMessage.value = '';
}

function updateScroll() {
  chatContent.scrollTop = chatContent.scrollHeight;
}

function updateAvatar(url, id) {
  const avatars = document.querySelectorAll(
    `.message[data-id="${id}"] .avatar, .user[data-id="${id}"] .avatar, .modal__avatar`
  );
  const modalAvatarIcon = document.querySelector('.modal__avatar svg');
  if (modalAvatarIcon) {
    modalAvatarIcon.remove();
  }

  avatars.forEach(function (avatar) {
    avatar.style.backgroundImage = `url(${url})`;
  });
}

function isMine(id) {
  return +id === user.id;
}

function openModal() {
  console.log(user);
  document.body.insertAdjacentHTML(
    'beforeend',
    modalTemplate({
      name: user.name,
      avatarUrl: user.avatar,
    })
  );

  const inputFile = document.querySelector('#inputFile');
  const fileReader = new FileReader();

  inputFile.addEventListener('change', function (e) {
    const file = e.target.files[0];

    console.log(file.type);

    if (file) {
      if (file.size > 500 * 1024) {
        alert('Слишком большой файл. Выберите изображение до 500кб.');
      } else if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
        alert('Можно загрузить только изображение в формате .png и .jpg');
      } else {
        fileReader.readAsDataURL(file);
      }
    }
  });

  fileReader.addEventListener('load', function () {
    const url = fileReader.result;

    const data = {
      updateAvatar: true,
      avatarUrl: url,
    };

    socket.send(JSON.stringify(data));
  });

  const btnClose = document.querySelector('#btnClose');

  btnClose.addEventListener('click', function () {
    document.querySelector('.backgrop').remove();
    document.querySelector('.modal').remove();
  });
}
