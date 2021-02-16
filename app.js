const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");
const dbConnectionString = "mongodb://localhost/mtech";
const { v4: uuidv4 } = require("uuid");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

mongoose.connect(dbConnectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const udb = mongoose.connection;
mongoose.set('useFindAndModify', false)

const userSchema = new mongoose.Schema({
  userID: String,
  first_name: String,
  last_name: String,
  email: String,
  age: Number,
});

const users = mongoose.model("users", userSchema);

app.get("/", (req, res) => {
  res.render("index", {});
});

app.get("/userData", (req, res) => {
  users.find({}, (err, data) => {
    res.render("viewUsers", { users: data });
  });
});

app.post("/newUserSubmitted", (req, res) => {
  const newUser = new users();
  newUser.userID = uuidv4();
  newUser.first_name = req.body.firstName;
  newUser.last_name = req.body.lastName;
  newUser.email = req.body.email;
  newUser.age = req.body.age;
  newUser.save((err, data) => {
    if (err) {
      return console.error(err);
    }
  });
  res.redirect("/userData");
});

app.get("/editUser/:userID", (req, res) => {
  users.findOne({ userID: req.params.userID }, (err, data) => {
    res.render("editUser", { user: data });
  });
});

app.post("/userEdited/:userID", (req, res) => {
  let editedUser = req.body.userID;
  users.findOneAndUpdate(
    { usersID: editedUser },
    {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      age: req.body.age,
    },
    (err, data) => {
      if (err) throw err;
      res.redirect("/userData");
    }
  );
});

app.post("/delete/:index", (req, res) => {
  let matchedName = req.body.firstName;
  users.findOneAndDelete({ name: matchedName }, (err, data) => {
    if (err) return console.log(`Oops! ${err}`);
    res.redirect("/userData");
  });
});

app.post('/searchByFirst/', (req, res) => {
  let firstNameSearch = req.body.searchByFirst;
  users.find({}, (err, data) =>{
    if (err) throw err; 
    let filteredUsers = data.filter(users => {
      let searchingByFirst = users.first_name;
      return searchingByFirst === firstNameSearch
    })
    res.render('viewUsers', {users: filteredUsers})
  })
})

app.post('/searchByLast/', (req, res) => {
  let lastNameSearch = req.body.searchByLast;
  users.find({}, (err, data) =>{
    if (err) throw err; 
    let filteredUsers = data.filter(users => {
      let searchingByLast = users.last_name;
      return lastNameSearch === searchingByLast
    })
    res.render('viewUsers', {users: filteredUsers})
  })
})

app.post('/sortAsc', (req, res) => {
  users.find({}).sort('asc')
})

app.listen(port, (err) => {
  if (err) console.log(err);
  console.log(`App Server listen on port: ${port}`);
});
