const logger = require("../logger").app;
const loggerSql = require("../logger").sql;
const { Sequelize, DataTypes } = require("sequelize");
const config = require("config").DataBase;

config.options.logging = (msg) => loggerSql.debug(msg);

const sequelize = new Sequelize(
  config.name,
  config.user,
  config.password,
  config.options
);

const User = require("./models/users")(sequelize);
const List = require("./models/lists")(sequelize);
const Word = require("./models/words")(sequelize);

(async () => {
  try {
    await sequelize.authenticate();
    User.Lists = User.hasMany(List, {
      onDelete: "CASCADE",
    });
    List.Word = List.hasMany(Word, {
      onDelete: "CASCADE",
    });
    await User.sync();
    await List.sync();
    await Word.sync();
    await sequelize.sync();
  } catch (err) {
    logger.error(`Облом: ${err}`);
  }
})();
// --------------------------------------------------- User------------------------------------------
module.exports.CreateUser = async (login, password) => {
  try {
    await User.create({ login: login, password: password });
    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
};

module.exports.GetUser = async (login, password) => {
  try {
    let params = {
      login: login,
    };
    if (password) params.password = password;
    const user = await User.findOne({
      attributes: { exclude: ["password"] },
      where: params,
    });
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    logger.error(error);
    return null;
  }
};

module.exports.DeleteUser = async (login) => {
  try {
    await User.destroy({
      where: {
        login: login,
      },
    });
    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
};

module.exports.UpdateUser = async (login, password) => {
  try {
    await User.update({ password: password }, { where: { login: login } });
    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
};

// --------------------------------------------------List--------------------------------------------

module.exports.CreateList = async (listName, userId) => {
  try {
    await User.sync();
    let list = await List.create({
      name: listName,
      UserId: userId,
    });
    return list;
  } catch (error) {
    logger.error(error);
    return false;
  }
};

module.exports.GetLists = async (UserId) => {
  try {
    const list = await List.findAll({
      // attributes: ["id", "name", "UserId"],
      where: {
        UserId: UserId,
      },
    });
    return JSON.parse(JSON.stringify(list));
  } catch (error) {
    logger.error(error);
    return null;
  }
};

module.exports.RenameList = async (id, name) => {
  try {
    const result = await List.update({ name: name }, { where: { id: id } });
    return result > 0;
  } catch (error) {
    logger.error(error);
    return false;
  }
};

module.exports.DeleteList = async (id) => {
  try {
    await List.destroy({ where: { id: id } });
    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
};
module.exports.GetList = async (id) => {
  try {
    const list = await List.findOne({ where: { id } });
    return list;
  } catch (error) {
    logger.error(error);
    return null;
  }
};

// --------------------------------------------Word----------------------------------------

module.exports.GetWords = async (ListId) => {
  try {
    return await Word.findAll({ where: { ListId } });
  } catch (error) {
    logger.error(error);
    return null;
  }
};

module.exports.GetWord = async (id) => {
  try {
    const word = await Word.findOne({ where: { id } });
    return word;
  } catch (error) {
    logger.error(error);
    return null;
  }
};

module.exports.CreateWord = async (word, meaning, studied, ListId) => {
  try {
    await List.sync();
    await Word.create({
      word: word,
      meaning: meaning,
      studied: studied,
      ListId: ListId,
    });
    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
};

module.exports.UpdateWord = async (id, wordParams) => {
  try {
    const updatedCount = await Word.update(wordParams, { where: { id } });
    return updatedCount > 0;
  } catch (error) {
    logger.error(error);
    return false;
  }
};

module.exports.DeleteWord = async (id) => {
  try {
    const result = await Word.destroy({ where: { id: id } });
    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
};
