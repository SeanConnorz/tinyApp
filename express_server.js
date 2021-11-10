const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");

const app = express();
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

function generateRandomString(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  while (result.length <= length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
 return result;
};

emailLookUp = (email) => {
  const key = Object.keys(users);
  for (let item of key) {
    if (users[item].email === email) {
      return true;
    } 
  }
  return false;
}

passwordLookUp = (password) => {
  const key = Object.keys(users);
  for (let item of key) {
    if (users[item].password === password) {
      return true;
    } 
  }
  return false;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  user: {
    id: 'user',
    email: '1234@gmail.com',
    password: '69Hughes'
  }
};

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    users: users[req.cookies["user_id"]]
  };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    users: users[req.cookies["user_id"]]
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    users: users[req.cookies["user_id"]]
  };
  res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  const templateVars = {
    users: users[req.cookies["user_id"]]
  }
  res.render('register', templateVars);
})

app.get('/404', (req, res) => {
  res.render('404');
})

app.get('/login', (req, res) => {
  const templateVars = {
    users: users[req.cookies["user_id"]]
  }
  res.render('login', templateVars);
})

app.post("/urls", (req, res) => {
  shortURL = generateRandomString(6);
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);   
});

app.post(`/urls/:shortURL/delete`, (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
})

app.post('/urls/:shortURL/update', (req, res) => {
  const key = Object.keys(req.body)[0];
  const tempVariable = urlDatabase[key];
  delete urlDatabase[key];
  urlDatabase[req.body[key]] = tempVariable;
  res.redirect('/urls');
})

app.post('/register', (req, res) => {
  let userId = 'user1';
  console.log(users);

  if (emailLookUp(req.body.email)) {
    res.send('error: 404')
  }

  if (!req.body.email || !req.body.password) {
    res.send('error: 404')
  } 
  
  else { 
    users[userId] = {
      id: userId,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie('user_id', userId);
    res.redirect('/urls');
  }
  console.log(users);
})

app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    console.log(email, password);
    let userId = 'user1';

    if (emailLookUp(email)) {
      if (passwordLookUp(password)) {
        res.cookie('user_id', userId);
      } else {
        res.send('error');
      }
    } else {
      res.send('error');
    }
    console.log(users);
    res.redirect('/urls');
})

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  console.log(users);
  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});