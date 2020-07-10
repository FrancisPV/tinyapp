const bcrypt = require("bcrypt");
const saltRounds = 10;


const urlsForUser = (id, urlDatabase) => {
  const urlObject = {};
  for (const key in urlDatabase) {
    
    if (urlDatabase[key] && urlDatabase[key].userID === id) {
      urlObject[key] = urlDatabase[key];
    }
  }
  return urlObject;
};

//authenticate the user
const authenticateUser = (email, password, users) => {
  const user = findUserByEmail(email, users);

  if (user && bcrypt.compareSync(password, user.password)) {
    return user.id;
  }
};

//generate a random 8 digits string
const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

const addNewUser = (email, password, username, users) => {
  const userId = generateRandomString();
  const user = { id: userId, email, username, password: bcrypt.hashSync(password, saltRounds) };

  users[userId] = user;
  return userId;
};

//find a user by it's email and return this user
const findUserByEmail = (email, users) => {
  for (let userId in users) {  // need to create the user object
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return;
};


module.exports = { urlsForUser, generateRandomString, addNewUser, findUserByEmail, authenticateUser };