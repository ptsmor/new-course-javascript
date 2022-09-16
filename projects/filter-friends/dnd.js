const Controller = require('./controller');

module.exports = {
  makeDnD(zones) {
    let currentDrag;

    for (const zone of zones) {
      zone.addEventListener('dragstart', function (e) {
        currentDrag = { from: zone, node: e.target };
        e.dataTransfer.setData('text/html', e.target.dataset.id);
      });

      zone.addEventListener('dragover', function (e) {
        e.preventDefault();
      });

      zone.addEventListener('drop', function (e) {
        if (currentDrag) {
          e.preventDefault();
        }

        if (currentDrag.from !== zone) {
          const id = +currentDrag.node.dataset.id;
          const from = currentDrag.from.dataset.list;
          const to = zone.dataset.list;
          if (e.target.classList.contains('friend')) {
            Controller.replaceFriend(id, from, to, e.target);
          } else {
            Controller.replaceFriend(id, from, to);
          }
        }

        currentDrag = null;
      });
    }
  },
};
