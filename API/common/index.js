const db = require("../db/db");

const verify = async (request, response, next) => {
  const { listId, wordId } = request.params;
  const list = await db.GetList(listId);
  if (!list || list.UserId != request.user.id) {
    response.status(406).json({ error: "Requested list is not found" });
    return;
  }
  if (wordId) {
    const word = await db.GetWord(wordId);
    if (!word || word.ListId != list.id) {
      response.status(406).json({ error: "Requested word is not found" });
      return;
    }
  }
  next();
};

module.exports = {
  verify
};