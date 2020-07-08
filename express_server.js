const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

// add the new user to our database
const addNewUser = (email, password) => {
  const userId = Math.random().toString(36).substring(2, 8);
  const user = { id: userId, email, password };

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


app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;

  const shortURL = generateRandomString();

  urlDatabase[shortURL] = longURL;

  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const longURL = req.body.longURL;

  const shortURL = req.params.shortURL;

  urlDatabase[shortURL] = longURL;

  res.redirect("/urls");
});

// Catch the submit info of the register form
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (password === '' || email === '') {
    res.status(400).send("Error : The e-mail and password cannot be empty");
  }

  const user = findUserByEmail(email);
  if (user === false) {
    const userId = addNewUser(email, password);

    res.cookie('user_id', userId);
    res.redirect("/login");
  } else {
    res.status(400).send("Error : email already exists");
  }
});


/// not sure what to enter for (user.id)
const authenticateUser = (email, password) => {
  const user = findUserByEmail(email);

  if (user && user.password === password) {
    return user.id;
  }
};


app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = authenticateUser(email, password);

  console.log(users);

  if (userId) {
    res.cookie("user_id", userId);
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
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/urls", (req, res) => {
  let userId = req.cookies.user_id;
  let user = users[userId];
  let templateVars = {
    urls: urlDatabase,
    user,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let userId = req.cookies.user_id;
  let user = users[userId];
  let templateVars = {
    urls: urlDatabase,
    user,
  };

  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let userId = req.cookies.user_id;
  let user = users[userId];
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  let templateVars = {
    shortURL: shortURL,
    longURL: longURL,
    urls: urlDatabase,
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
