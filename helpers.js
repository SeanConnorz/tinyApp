const bcrypt = require('bcryptjs');

const getUserByEmail = (email, database) => {
  const key = Object.keys(database);
  for (let user_id of key) {
    if (database[user_id].email === email) {
      return user_id;
    }
  }
};

const verifyPassword = (password, database) => {
  const key = Object.keys(database);
  for (let user_id of key) {
    if (bcrypt.compareSync(password, database[user_id].password)) return true;
  }
  return false;
};

const generateRandomString = (length) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  while (result.length <= length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const urlsForUser = (id, database) => {
  const keys = Object.keys(database);
  for (let item of keys) {
    if (id === database[item].userId) {
      return item;
    }
  }
};

module.exports = {
  getUserByEmail,
  verifyPassword,
  generateRandomString,
  urlsForUser
};