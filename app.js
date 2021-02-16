const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");
const dbConnectionString = "mongodb://localhost/mtech";
const { v4: uuidv4 } = require('uuid');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

mongoose.connect(dbConnectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const udb = mongoose.connection;

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

app.get('/userData', (req, res) => {
  users.find({}, (err, data) => {
    res.render('viewUsers', { users: data})
  })
})

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

app.get(('editUser/:userID', (req, res) => {
  users.findOne({userID: req.params.userID}, (err, data) => {
    res.render('editUser', {user: data})
  })
}))

app.post("/delete/:index", (req, res) => {
  let matchedName = req.body.firstName;
  users.findOneAndDelete({ name: matchedName }, (err, data) => {
    if (err) return console.log(`Oops! ${err}`);
    res.redirect('/userData');
  });
});

app.listen(port, (err) => {
  if (err) console.log(err);
  console.log(`App Server listen on port: ${port}`);
});
