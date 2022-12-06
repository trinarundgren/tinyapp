///////////////////////////////////////////////////
/* SETUP / 

FUNCTIONS / VARIABLES */

// app config
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
 
const users = {};

const generateRandomString = () => {
  return Math.random().toString(36).substring(6);
};

// RENDERING ROUTES ////////////////////////////////////////////////////////

app.get('/urls.json', (req, res) => {
  res.send(urlDatabase);
})

// URL NEW
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// URL INDEX
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies['username'] };
  res.render("urls_index", templateVars);
});

// Submitting to shorten URL / and redirects to shortURL
app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = req.body.longURL;
  res.redirect(`/urls/${shortUrl}`);
});

// Create New URL 
app.get('/urls/new', (req, res) => {
  const templateVars = {username: req.cookies['username']};
  res.render('urls_new', templateVars);
});

// URL showing short and long URL
app.get("/urls/:id", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies['username'] };
  res.render("urls_show", templateVars);
});

// update LongURL in database
app.post('/urls/:shortUrl', (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.updatedURL;
  res.redirect(`/urls/${shortURL}`);
});

//delete URL from database and redirect to index
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// redirect from short to long urls
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortUrl];

  if (longURL) {
    res.redirect(urlDatabase[req.params.shortURL]);
  } else {
    res.statusCode = 404;
    res.send('<h2>404 Page Not Found<br>This short URL is not found.</h2>')
  }
});

// LOGIN stuff
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

//LOGOUT
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

//REGISTRATION
app.get('/register', (res, req) => {
  let templateVars = {username: req.cookies['username']};
  res.render('urls_registration', templateVars);
});

//REGISTER
app.post('/register', (req, res) => {
  const userID = generateRandomString();
  users[userID] = {
    userID,
    email: req.body.email,
    password: req.body.password
  }
  res.cookie('user_id', userID);
  res.redirect('/urls');
});

// SERVER STUFF
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});