
/* SETUP / FUNCTIONS / VARIABLES */

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
 
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

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
}

// *******************RENDERING ROUTES *********************************

app.get('/urls.json', (req, res) => {
  res.send(urlDatabase);
})

// URL NEW
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']] };
  res.render("urls_new", templateVars);
});

// URL INDEX
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies['user_id']] };
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
  const templateVars = {user_id: req.cookies['user_id']};
  res.render('urls_new', templateVars);
  res.redirect(`/urls/${shortUrl}`);
});

// URL showing short and long URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies['user_id']] };
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

//LOGIN PAGE
app.get('/login', (req, res) => {
  let templateVars = {user: users[req.cookies['user_id']]};
  res.render('urls_login', templateVars)
});

// LOGIN stuff
app.post('/login', (req, res) => {
  const user = findUserWithEmailInDatabase(req.body.email, users);
  if (user) {
    if (req.body.password === user.password) {
      res.cookie('user_id', user.userID);
      res.redirect('/urls');
    } else {
      res.statusCode = 403;
      res.send('<h2>403 FORBIDDEN<br>Incorrect Password</h2>')
    }
  } else {
    res.statusCode = 403;
    res.send('<h2>403 FORBIDDEN<br>Email address not registered</h2>')
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
      const userID = generateRandomString();
      users[userID] = {
        userID,
        email: req.body.email,
        password: req.body.password
      }
      res.cookie('user_id', userID);
      res.redirect('/urls');
    } else {
      res.statusCode = 400;
      res.send('<h2>400 - ERROR <br>Email already in use.</h2>')
    }
  } else {
    res.statusCode = 400;
    res.send('<h2>400 - ERROR <br>Both email and password fields are required.</h2>')
  }
});


// SERVER STUFF
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});