const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const cookieSession = require("cookie-session");


app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

//middleware
/* app.use((req, res, next) => {
  req.currentUser = users[res.session["user_id"]];
  next();
}); */

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "aJ88lW" }
};

const users = {
  "userRandomID": {
    username: "bob",
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    username: "Ginette",
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlsForUser = (id, urlDatabase) => {
  const urlObject = {};
  for (const key in urlDatabase) {
    
    if (urlDatabase[key] && urlDatabase[key].userID === id) {
      urlObject[key] = urlDatabase[key];
    }
  }
  return urlObject;
};
const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};



// add the new user to our database
const addNewUser = (email, password, username) => {
  const userId = Object.keys(users).length + 1;
  /* const userId = Math.random().toString(36).substring(2, 8); */
  const user = { id: userId, email, username, password: bcrypt.hashSync(password, saltRounds) };

  users[userId] = user;
  return userId;
};

// find the user by is e-mail
const findUserByEmail = email => {
  for (let userId in users) {  // need to create the user object
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return false;
};

//***ALL THE POST****
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const userID = req.session["user_id"];
  const shortURL = generateRandomString();

  urlDatabase[shortURL] = {longURL, userID};

  res.redirect(`/urls/${shortURL}`);
});

//delete post
app.post("/urls/:shortURL/delete", (req, res) => {
  let userId = req.session.user_id;
  let user = users[userId];
  if (user) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(400).send("Error : Only users can delete their own URLs");
  }
});

//edit post
app.post("/urls/:shortURL", (req, res) => {

  const longURL = req.body.longURL;

  const shortURL = req.params.shortURL;

  urlDatabase[shortURL]["longURL"] = longURL;
  res.redirect("/urls");
});

// Catch the submit info of the register form
app.post("/register", (req, res) => {
  const { email, password, username } = req.body;
  if (password === '' || email === '') {
    res.status(400).send("Error : The e-mail and password cannot be empty");
  }

  const user = findUserByEmail(email);
  if (user === false) {
    const userId = addNewUser(email, password, username);

    req.session["user_id", userId];

    res.redirect("/login");
  } else {
    res.status(400).send("Error : email already exists");
  }
  console.log(users);
});


//authenticate the user
const authenticateUser = (email, password) => {
  const user = findUserByEmail(email);

  if (user && bcrypt.compareSync(password, user.password)) {
    return user.id;
  }
};


app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = authenticateUser(email, password);


  if (userId) {
    req.session["user_id"] = userId;
    res.redirect("/urls");
  } else {
    res.status(401).send("Wrong credentials");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    res.redirect("/urls");
  } else {
    let templateVars = {user};
    res.render("login", templateVars);
  }
});

//Render register page depending whether user is logged in or not
app.get("/register", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    res.redirect("/urls");
  } else {
    let templateVars = {user};
    res.render("register", templateVars);
  }
});

app.get("/urls", (req, res) => {
  let userId = req.session.user_id;
  let user = users[userId];
  console.log('session', req.session);
  console.log(user);
  const URLsObject = urlsForUser(userId, urlDatabase);
  let templateVars = {
    urls: URLsObject,
    user,
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let userId = req.session["user_id"];
  let user = users[userId];
  if (user) {
    let templateVars = {user};
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
  
});


app.get("/urls/:shortURL", (req, res) => {
  let userId = req.session["user_id"];
  let user = users[userId];
  console.log("user :", user);
  const URLsObject = urlsForUser(user, urlDatabase);
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL] && urlDatabase[shortURL].longURL;
  let templateVars = {
    shortURL: shortURL,
    longURL: longURL,
    urls: URLsObject,
    user,
  };
  if (longURL === undefined) {
    res.status(404).render("404_error");
    return;
  }
  res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

