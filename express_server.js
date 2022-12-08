/* SETUP / FUNCTIONS / VARIABLES */

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {};
const users = {};

const generateRandomString = () => {
  return Math.random().toString(36).substring(6);
};

const findUserWithEmailInDatabase = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
};

const urlsForUser = (id) => {
  let userUrls = {};

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].user_id === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }

  return userUrls;
};


// *******************RENDERING ROUTES *********************************

// URL INDEX
app.get("/urls", (req, res) => {
  const user_id = req.cookies['user_id'];
  const userURLS = urlsForUser(user_id);
  let templateVars = { urls: userURLS, user: users[user_id] };
  res.render("urls_index", templateVars);
});

// create new url and add to database
app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = {
    longURL: req.body.longURL,
    user_id: req.cookies['user_id']
  };
  res.redirect(`/urls/${shortUrl}`);
});

// Create New URL - validates if user is logged in
app.get('/urls/new', (req, res) => {
  if (req.cookies['user_id']) {
    const templateVars = {user: users[req.cookies['user_id']]};
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login')
  }
});

// URL page showing short and long URL
app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.cookies['user_id'];
  const userUrls = urlsForUser(user_id);
  let templateVars = { urls: userUrls, user: users[user_id], shortURL: req.params.shortURL };
  res.render("urls_show", templateVars);
});

// validates if the url belongs to current user
app.post('/urls/:shortUrl', (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.cookies[user_id] === urlDatabase[shortURL].user_id) {
    urlDatabase[shortURL].longURL = req.body.updatedURL;
  }
  res.redirect(`/urls`);
});

//deletes url from database redirect to index
app.post('/urls/:id/delete', (req, res) => {
  const shortURL = req.params.shortURL;

  if (req.cookies['user_id'] === urlDatabase[shortURL].user_id) {
    delete urlDatabase[shortURL];
  }
  
  res.redirect('/urls');
});

// redirect from shortURL to the longURL
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    res.statusCode = 404;
    res.send('<h2>404 - ERROR - short URL does not exist.</h2>')
  }
});

//LOGIN PAGE
app.get('/login', (req, res) => {
  let templateVars = {user: users[req.cookies['user_id']]};
  res.render('urls_login', templateVars);
});

// LOGIN stuff
app.post('/login', (req, res) => {
  const user = findUserWithEmailInDatabase(req.body.email, users);
  if (user) {
    if (req.body.password === user.password) {
      res.cookie('user_id', user.user_id);
      res.redirect('/urls');
    } else {
      res.statusCode = 403;
      res.send('<h2>403 FORBIDDEN<br>Incorrect Password</h2>');
    }
  } else {
    res.statusCode = 403;
    res.send('<h2>403 FORBIDDEN<br>Email address not registered</h2>');
  }
});

//LOGOUT
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

// registration page
app.get('/register', (req, res) => {
  let templateVars = {user: users[req.cookies['user_id']]};
  res.render('urls_registration', templateVars);
});

//REGISTER
app.post('/register', (req, res) => {
  if (req.body.email && req.body.password) {
    if (!findUserWithEmailInDatabase(req.body.email, users)) {
      const user_id = generateRandomString();
      users[user_id] = {
        user_id,
        email: req.body.email,
        password: req.body.password
      };
      res.cookie('user_id', user_id);
      res.redirect('/urls');
    } else {
      res.statusCode = 400;
      res.send('<h2>400 - ERROR <br>Email already in use.</h2>');
    }
  } else {
    res.statusCode = 400;
    res.send('<h2>400 - ERROR <br>Both email and password fields are required.</h2>');
  }
});

// SERVER STUFF
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});