const jwt = require("jsonwebtoken");
const db = require('../db/db');
const { signature } = require("../config/jwt");

const addUserRoutes = (router) => {
  router.route('/users')
    .post(async (request, response) => {
      const { login, password } = request.body;
      const result = await db.CreateUser(login, password);
      if (result) {
        response.json({ status: "ok" });
      } else {
        response.status(409).json({ error: "Login is occupied" });
      }
    })
    .put(async (request, response) => {
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
    })
    .delete(async (request, response) => {
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

    router.route('/auth')
      .post(async (request, response) => {
        const { login, password } = request.body;
        const user = await db.GetUser(login, password);
        if (user === null) {
          response.status(401).json({ error: "Incorrect login or password" });
          return;
        }
        const token = jwt.sign(user, signature);
        response.json({ token: token });
      });    
}

module.exports = addUserRoutes;






