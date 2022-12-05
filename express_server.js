///////////////////////////////////////////////////
/* SETUP / FUNCTIONS / VARIABLES */

// app config
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// function

const generateRandomString = () => {
  return Math.random().toString(36).substring(6);
};

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// HELLO WORLD ROUTE
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// RENDERING ROUTES 

// URL NEW
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get('/urls.json', (req, res) => {
  res.send(urlDatabase);
})



// URL SHOW
app.get("/urls/:id", (req, res) => {
  const userID = req.params.id;
  const longURL = urlDatabase[userID]
  const templateVars = { id: userID, longURL };
  res.render("urls_show", templateVars);
});

// URL INDEX
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// URL CRUD
// Create - POST 
app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = req.body.longURL;
  res.redirect(`/urls/${shortUrl}`);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});