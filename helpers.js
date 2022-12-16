
const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
};

const generateRandomString = () => {
  return Math.random().toString(36).substring(6);
};

const urlsForUser = (id, urlDatabase) => {
  let userUrls = {};

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }

  return userUrls;
};

module.exports = {
  generateRandomString,
  urlsForUser,
  getUserByEmail
};