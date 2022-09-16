const Model = require('./model');
const View = require('./view');
const Element = require('./elements');

function isMatching(full, chunk) {
  full = full.toLowerCase();
  chunk = chunk.toLowerCase();
  return full.search(chunk) !== -1;
}

module.exports = {
  replaceFriendData(id, from, to) {
    Model.allFriends[to][id] = Model.allFriends[from][id];
    delete Model.allFriends[from][id];
    Model.updateStorage();
  },

  replaceFriendTemplate(id, from, to, afterElement) {
    const searchStr = Element.appContainer
      .querySelector(`[data-search="${to}"]`)
      .value.trim();
    if (searchStr !== '') {
      this.updateRenderList(to, searchStr);
    } else {
      let targetElement = Element.containers[to];
      let where = 'beforeend';

      if (afterElement) {
        targetElement = afterElement;
        where = 'afterend';
      }
      targetElement.insertAdjacentHTML(
        where,
        View.renderFriend(to, Model.allFriends[to][id])
      );
    }
    Element.containers[from].querySelector(`.friend[data-id="${id}"]`).remove();
  },

  replaceFriend(id, from, to, afterElement) {
    this.replaceFriendData(id, from, to);
    this.replaceFriendTemplate(id, from, to, afterElement);
  },

  updateRenderList(listName, searchStr) {
    let template = '';
    for (const key in Model.allFriends[listName]) {
      const currentFriend = Model.allFriends[listName][key];
      if (
        isMatching(currentFriend.first_name, searchStr) ||
        isMatching(currentFriend.last_name, searchStr)
      ) {
        template += View.renderTemplate(`${listName}Friend`, currentFriend);
      }
    }
    Element.containers[listName].innerHTML = template;
  },
};
