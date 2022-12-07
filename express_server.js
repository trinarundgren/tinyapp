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
  // res.redirect(`/urls/${shortUrl}`);
});

// URL showing short and long URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies['username'] };
  res.render("urls_show", templateVars);
});

// update LongURL in database
app.post('/urls/:shortUrl', (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.updatedURL;
  res.redirect(`/urls/${shortURL}`);
});

//deletes url from database redirect to index 
app.post('/urls/:id/delete', (req, res) => {
  console.log('checking for this');
  delete urlDatabase[req.params.id];
  console.log(req.params.id)
  res.redirect('/urls');
});

// redirection from short to the long 
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];

  if (longURL) {
    res.redirect(urlDatabase[req.params.shortURL]);
  } else {
    res.statusCode = 404;
    res.send('<h2>404 Not Found<br>This short URL does not exist.</h2>')
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


// SERVER STUFF
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});