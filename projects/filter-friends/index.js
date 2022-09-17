import './css/styles.css';
import './index.html';
import Model from './model';
import View from './view';
import Controller from './controller';
import Element from './elements';
import DnD from './dnd';

let vkKey = process.env.keyId

Model.login(vkKey, 2)
  .then(function () {
    return Model.getUser({ name_case: 'gen' });
  })
  .then(function (me) {
    Element.header.innerHTML = View.renderTemplate('header', {
      first_name: me[0].first_name,
      last_name: me[0].last_name,
    });

    return Model.getFriends({ fields: 'photo_50' });
  })
  .then(function (friends) {
    const renderFriendsList = {
      simple: '',
      best: '',
    };

    friends.items.forEach(function (friend) {
      const id = friend.id;

      if (isNewFriend(id)) {
        Model.allFriends.simple[id] = friend;
      }

      for (const key in renderFriendsList) {
        const list = Model.allFriends[key];
        if (list[id]) {
          renderFriendsList[key] += View.renderFriend(key, list[id]);
        }
      }
    });

    Model.updateStorage();

    for (const key in renderFriendsList) {
      Element.containers[key].innerHTML = renderFriendsList[key];
    }
  });

document.addEventListener('click', function (e) {
  if (e.target.classList.contains('friend__move')) {
    const to = e.target.dataset.to;
    const from = e.target.closest('[data-list]').dataset.list;
    const elFriend = e.target.closest('.friend');
    const currentId = +elFriend.dataset.id;
    Controller.replaceFriend(currentId, from, to);
  }
});

const zones = [];
for (const key in Element.containers) {
  zones.push(Element.containers[key]);
}
DnD.makeDnD(zones);

Element.searchFields.forEach(function (searchField) {
  const listName = searchField.dataset.search;

  searchField.addEventListener('input', function (e) {
    const searchStr = e.target.value.trim();
    Controller.updateRenderList(listName, searchStr);
  });
});

function isNewFriend(id) {
  let result = true;

  for (const key in Model.allFriends) {
    if (Model.allFriends[key][id]) {
      result = false;
    }
  }

  return result;
}
