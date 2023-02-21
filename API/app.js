const logger = require("./logger").app;
const db = require("./db/db");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const { dirname } = require("path");
const appDir = dirname(require.main.filename);
const cors = require("cors");
app.use(cors());

const signature = "MySuP3R_z3kr3t";

app.use(express.json());
// ----------------------------------------------------------User-----------------------------------------------------
app.post("/api/users", async (request, response) => {
  const { login, password } = request.body;
  const result = await db.CreateUser(login, password);
  if (result) {
    response.json({ status: "ok" });
  } else {
    response.status(409).json({ error: "Login is occupied" });
  }
});

app.post("/api/auth", async (request, response) => {
  const { login, password } = request.body;
  const user = await db.GetUser(login, password);
  if (user === null) {
    response.status(401).json({ error: "Incorrect login or password" });
    return;
  }
  const token = jwt.sign(user, signature);
  response.json({ token: token });
});

app.put("/api/users", async (request, response) => {
  const { login, password, newPassword } = request.body;
  const user = await db.GetUser(login, password);
  if (user === null) {
    response.status(401).json({ error: "Incorrect login or password" });
    return;
  }
  const result = await db.UpdateUser(login, newPassword);
  if (result) {
    response.json({ status: "ok" });
  } else {
    response.status(500).json({ error: "Impossible to update" });
  }
});

app.delete("/api/users", async (request, response) => {
  const { login, password } = request.body;
  const user = await db.GetUser(login, password);
  if (user === null) {
    response.status(401).json({ error: "Incorrect login or password" });
    return;
  }
  const result = await db.DeleteUser(login, password);
  if (result) {
    response.json({ status: "ok" });
  } else {
    response.status(500).json({ error: "Impossible to delete" });
  }
});

app.use((request, response, next) => {
  if (!request.headers.authorization) {
    response.status(403).json({ error: "not authorized" });
    return;
  }
  try {
    request.user = jwt.verify(request.headers.authorization, signature);
    next();
  } catch (error) {
    logger.debug(error);
    response.status(403).json({ error: "Access denied" });
  }
});
// ------------------------------------------------------------- List----------------------------------------------------

app.post("/api/lists", async (request, response) => {
  const { name } = request.body;
  const result = await db.CreateList(name, request.user.id);
  if (result) {
    response.json({ status: "ok" });
  } else {
    response.status(500).json({ error: "Impossible to create list" });
  }
});

app.get("/api/lists", async (request, response) => {
  const lists = await db.GetLists(request.user.id);
  if (lists) {
    response.json({ Lists: lists });
  } else {
    response.status(500).json({ error: "Impossible to get list" });
  }
});

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

app.put("/api/lists/:listId", verify, async (request, response) => {
  const result = await db.RenameList(request.params.listId, request.body.name);
  if (result) {
    response.json({ status: "ok" });
  } else {
    response.status(500).json({ error: "Impossible to rename list" });
  }
});

app.delete("/api/lists/:listId", verify, async (request, response) => {
  const result = await db.DeleteList(request.params.listId);
  if (result) {
    response.json({ status: "ok" });
  } else {
    response.status(500).json({ error: "Impossible to delete list" });
  }
});
// -----------------------------------------------------------------------words--------------------------------------------------

app.post("/api/lists/:listId/words", verify, async (request, response) => {
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
});

app.get("/api/lists/:listId/words", verify, async (request, response) => {
  const words = await db.GetWords(request.params.listId);
  if (words) {
    response.json({ Words: words });
  } else {
    response.status(500).json({ error: "Impossible to get words" });
  }
});

app.put(
  "/api/lists/:listId/words/:wordId",
  verify,
  async (request, response) => {
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
);

app.delete(
  "/api/lists/:listId/words/:wordId",
  verify,
  async (request, response) => {
    const result = await db.DeleteWord(request.params.wordId);
    if (result) {
      response.json({ status: "ok" });
    } else {
      response.status(500).json({ error: "Impossible to delete word" });
    }
  }
);
//*********************************************************************************** */

app.listen(3000, () => console.log("working..."));
