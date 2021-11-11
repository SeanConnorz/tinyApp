const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');

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

const emailLookUp = (email) => {
  const key = Object.keys(users);
  for (let user_id of key) {
    if (users[user_id].email === email) {
      return true;
    } 
  }
  return false;
}

const passwordLookUp = (password) => {
  const key = Object.keys(users);
  for (let user_id of key) {
    if (bcrypt.compareSync(password, users[user_id].password)) return true;
  }
  return false;
}

const userRegistered = (req) => {
  if (req.cookies['user_id']) return true;
  else return false;
};

const urlsForUser = (id) => {
  const keys = Object.keys(urlDatabase);
  for (let item of keys) {
    if (id === urlDatabase[item].userId) {
      return item;
    } 
  } 
}

let userNumber = 0;

const urlDatabase = {
  xczxc: {
    longURL: 'http://google.com',
  },
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
    users: users[req.cookies["user_id"]],
    userRegistered: userRegistered(req),
  };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  if (userRegistered(req)) {
    const templateVars = {
      users: users[req.cookies["user_id"]]
    }
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (req.params.shortURL === urlsForUser(req.cookies['user_id'])) {
    const templateVars = { 
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      users: users[req.cookies["user_id"]]
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
  const templateVars = {
    users: users[req.cookies["user_id"]]
  }
  res.render('register', templateVars);
})

app.get('/login', (req, res) => {
  const templateVars = {
    users: users[req.cookies["user_id"]]
  }
  res.render('login', templateVars);
})

app.post("/urls", (req, res) => {
  shortURL = generateRandomString(6);
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userId: req.cookies['user_id']
  }
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);   
});

app.post(`/urls/:shortURL/delete`, (req, res) => {
  if (req.params.shortURL === urlsForUser(req.cookies['user_id'])) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.redirect('/login')
  }
})

app.post('/urls/:shortURL/update', (req, res) => {
  if (userRegistered(req)) {
    const key = Object.keys(req.body)[0];
    const tempVariable = urlDatabase[key];
    delete urlDatabase[key];
    urlDatabase[req.body[key]] = tempVariable;
    res.redirect('/urls');
  } else {
    res.redirect('/login')
  }
})

app.post('/register', (req, res) => {
  userNumber += 1;
  let userId = `user${userNumber}`;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

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
      password: hashedPassword
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