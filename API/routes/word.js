const db = require('../db/db');
const { verify } = require('../common/index');

const addWordRoutes = (router) => {
  router.route('/lists/:listId/words')
    .post(verify, async (request, response) => {
      const { word, meaning, studied } = request.body;
      const result = await db.CreateWord(
        word,
        meaning,
        studied,
        request.params.listId
      );
      if (result) {
        response.json({ status: "ok" });
      } else {
        response.status(500).json({ error: "Impossible to create word" });
      }
    })
    .get(verify, async (request, response) => {
      const words = await db.GetWords(request.params.listId);
      if (words) {
        response.json({ Words: words });
      } else {
        response.status(500).json({ error: "Impossible to get words" });
      }
    });

  router.route('/lists/:listId/words/:wordId')
    .put(verify, async (request, response) => {
        const result = await db.UpdateWord(
          request.params.wordId,
          request.body.wordParams
        );
        if (result) {
          response.json({ status: "ok" });
        } else {
          response.status(500).json({ error: "Impossible to change word" });
        }
      }
    )
    .delete(verify, async (request, response) => {
        const result = await db.DeleteWord(request.params.wordId);
        if (result) {
          response.json({ status: "ok" });
        } else {
          response.status(500).json({ error: "Impossible to delete word" });
        }
      }
    );
} 

module.exports = addWordRoutes;
