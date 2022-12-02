const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// HELPER FUNCTION
const generateRandomString = (len, arr) => {
  let ans = '';
  for (let i = len; i > 0; i--) {
    ans +=
      arr[Math.floor(Math.random(6) * arr.length)];
  }
  return ans;
}
console.log(generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyz'))


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

// URL SHOW
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id]
  const templateVars = { id, longURL };
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
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});