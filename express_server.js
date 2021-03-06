const { urlsForUser, generateRandomString, addNewUser, findUserByEmail, authenticateUser } = require("./helper");
const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const methodOverride = require('method-override');

app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));


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

//***ALL THE POST****
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const userID = req.session["user_id"];
  const shortURL = generateRandomString();

  urlDatabase[shortURL] = { longURL, userID };

  res.redirect(`/urls/${shortURL}`);
});

//delete post
app.delete("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let userId = req.session.user_id;
  if (urlDatabase[shortURL] === undefined) {
    res.redirect("/login");
  } else if (userId === urlDatabase[shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(400).send("Error : Only users can delete their own URLs");
  }
});

//edit post
app.put("/urls/:shortURL", (req, res) => {

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

  const user = findUserByEmail(email, users);
  if (user === undefined) {
    const userId = addNewUser(email, password, username, users);

    req.session["user_id"] = userId;

    res.redirect("/login");
  } else {
    res.status(400).send("Error : email already exists");
  }
});

//validates the login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = authenticateUser(email, password, users);

  if (userId) {
    req.session["user_id"] = userId;
    res.redirect("/urls");
  } else {
    res.status(401).send("Wrong credentials");
  }
});

//redirect you to login and log you out of the page
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//***ALL THE GET***
//redirect to urls page is the user exist, render the login page
app.get("/", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("login");
  }
});

//log you in the urls page when you have the good credential
app.get("/login", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    res.redirect("/urls");
  } else {
    let templateVars = { user };
    res.render("login", templateVars);
  }
});

//Render register page depending whether user is logged in or not
app.get("/register", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    res.redirect("/urls");
  } else {
    let templateVars = { user };
    res.render("register", templateVars);
  }
});

//Urls page
app.get("/urls", (req, res) => {
  let userId = req.session.user_id;
  let user = users[userId];
  const URLsObject = urlsForUser(userId, urlDatabase);
  let templateVars = {
    urls: URLsObject,
    user,
  };

  res.render("urls_index", templateVars);
});

// URL new page redirect you to login if you are not logged
app.get("/urls/new", (req, res) => {
  let userId = req.session["user_id"];
  let user = users[userId];
  if (user) {
    let templateVars = { user };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }

});

app.get("/urls/:shortURL", (req, res) => {
  let userId = req.session["user_id"];
  let user = users[userId];
  const URLsObject = urlsForUser(user, urlDatabase);
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL] && urlDatabase[shortURL].longURL;
  let templateVars = {
    shortURL: shortURL,
    longURL: longURL,
    urls: URLsObject,
    user,
  };
  if (user === undefined) {
    res.redirect("/login");
    return;
  }
  if (longURL === undefined) {
    res.status(404).render("404_error", templateVars);
    return;
  }
  if (userId !== urlDatabase[shortURL].userID) {
    res.redirect("/urls");
    return;
  }
  res.render("urls_show", templateVars);
});

// redirect you to the longUrl when you click on the short url
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL];
  res.redirect(url.longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

