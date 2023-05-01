const db = require('../db/db');
const { verify } = require('../common/index');

const addListRoutes = (router) => {
  router.route('/lists')
    .post(async (request, response) => {
      const { name, user } = request.body;
      const result = await db.CreateList(name, request.user.id);
      if (result) {
        response.json({ status: "ok", listId: result.id });
      } else {
        response.status(500).json({ error: "Impossible to create list" });
      }
    })
    .get(async (request, response) => {
      const lists = await db.GetLists(request.user.id);
      if (lists) {
        response.json({ Lists: lists });
      } else {
        response.status(500).json({ error: "Impossible to get list" });
      }
    });

  router.route('/lists/:listId')  
    .put(verify, async (request, response) => {
      const result = await db.RenameList(request.params.listId, request.body.name);
      if (result) {
        response.json({ status: "ok" });
      } else {
        response.status(500).json({ error: "Impossible to rename list" });
      }
    })
    .delete(verify, async (request, response) => {
      const result = await db.DeleteList(request.params.listId);
      if (result) {
        response.json({ status: "ok" });
      } else {
        response.status(500).json({ error: "Impossible to delete list" });
      }
    });
}

module.exports = addListRoutes;