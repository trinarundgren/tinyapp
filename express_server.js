/* SETUP / FUNCTIONS / VARIABLES */

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');

app.use(cookieSession({ name: 'session', secret: 'UnicornPoop1973' }));

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');

const urlDatabase = {};
const users = {};

// *******************RENDERING ROUTES *********************************

// URL INDEX
app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const userURLS = urlsForUser(user_id, urlDatabase);
  let templateVars = { urls: userURLS, user: users[user_id] };
  res.render("urls_index", templateVars);
});

// CREATE NEW URL - POST - redirect to short url page
app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${shortUrl}`);
});

// Create New URL - validates if user is logged in
app.get('/urls/new', (req, res) => {
  if (req.session.user_id) {
    const templateVars = { user: users[req.session.user_id] };
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

// URL page showing short and long URL
app.get("/urls/:shortURL", (req, res) => {

  const user_id = req.session.user_id;
  const userUrls = urlsForUser(user_id, urlDatabase);
  let templateVars = { urls: userUrls, user: users[user_id], shortURL: req.params.shortURL };
  res.render("urls_show", templateVars);
});

// validates if the url belongs to current user
app.post('/urls/:shortUrl', (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.updatedURL;
  }
  res.redirect(`/urls`);
});

//deletes url from database
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;

  if (req.session.user_id === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
  }
  res.redirect('/urls');
});

// redirect from shortURL to the longURL
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.statusCode = 404;
    res.send('<h2>404 - ERROR - short URL does not exist.</h2>');
  }
});

//LOGIN PAGE
app.get('/login', (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  res.render('urls_login', templateVars);
});

// LOGIN stuff
app.post('/login', (req, res) => {
  const user = getUserByEmail(req.body.email, users);

  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    req.session.user_id = user.userID;
    res.redirect('/urls');
  } else {
    const errorMessage = 'Login credentials not valid. Please make sure you enter the correct username and password.';
    res.status(401).render('urls_login', { user: null, errorMessage });
  }
});

//LOGOUT
app.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.clearCookie('session.sig');
  res.redirect('/login');
});

// registration page
app.get('/register', (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  res.render('urls_registration', templateVars);
});

//REGISTER
// register functionality
app.post('/register', (req, res) => {
  if (req.body.email && req.body.password) {
    if (!getUserByEmail(req.body.email, users)) {
      const userID = generateRandomString();
      users[userID] = {
        userID,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
      };
      req.session.user_id = userID;
      res.redirect('/urls');
    } else {
      const errorMessage = 'Email already in use.';
    res.status(400).render('urls_login', { user: null, errorMessage });
    }
  } else {
    const errorMessage = 'Both email and password fields are required';
    res.status(400).render('urls_login', { user: null, errorMessage });
   
  }
});

// SERVER STUFF
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});