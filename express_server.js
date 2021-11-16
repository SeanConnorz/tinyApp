const express = require("express");
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const { getUserByEmail,
  verifyPassword,
  generateRandomString,
  urlsForUser,
  urlsObjectForUser} = require('./helpers');

const app = express();
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.set("view engine", "ejs");

const urlDatabase = {
  x4d4ff: {
    longURL: 'http://google.com',
  }
};
const users = {};

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  console.log(urlsObjectForUser(req.session.user_id, urlDatabase));
  const templateVars = {
    urls: urlsObjectForUser(req.session.user_id, urlDatabase),
    users: users[req.session.user_id],
    userRegistered: req.session.user_id,
  };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    const templateVars = {
      users: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else if (req.params.shortURL === urlsForUser(req.session.user_id, urlDatabase)) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      users: users[req.session.user_id]
    };
    res.render('urls_show', templateVars);
  } else {
    res.send('Please login to the correct account');
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      users: users[req.session.user_id]
    };
    res.render('register', templateVars);
  }
});

app.get('/login', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      users: users[req.session.user_id]
    };
    res.render('login', templateVars);
  }
});

app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const shortURL = generateRandomString(6);
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userId: req.session.user_id
    };
    res.redirect(`/urls`);
  } else {
    res.send("please login or register");
  }
});

app.post(`/urls/:shortURL/delete`, (req, res) => {
  if (req.params.shortURL === urlsForUser(req.session.user_id, urlDatabase)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else if (req.session.user_id) {
    res.render("Logged in under the wrong account");
  } else {
    res.render("please login or register");
  }
});

app.post('/urls/:id', (req, res) => {
  if (req.session.user_id) {
    const key = Object.keys(req.body)[0];
    const tempVariable = urlDatabase[key];
    delete urlDatabase[key];
    urlDatabase[req.body[key]] = tempVariable;
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

let userNumber = 0;

app.post('/register', (req, res) => {
  userNumber += 1;
  let userId = `user${userNumber}`;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!req.body.email || !req.body.password) {
    res.send('Error: one or more of the fields was left empty');
  } else if (getUserByEmail(req.body.email, users)) {
    res.send('This email already exists');
  } else {
    users[userId] = {
      id: userId,
      email: req.body.email,
      password: hashedPassword
    };
    req.session.user_id = userId;
    res.redirect('/urls');
  }
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (getUserByEmail(email, users)) {
    const userId = getUserByEmail(email, users);
    if (verifyPassword(email, password, users)) {
      req.session.user_id = userId;
    } else {
      res.send('Either the email of password is incorrect');
    }
  } else {
    res.send('Either the email of password is incorrect');
  }
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.clearCookie('session.sig  ');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});