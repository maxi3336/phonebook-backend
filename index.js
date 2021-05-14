const express = require("express");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectID;

const app = express();
const jsonParser = express.json();

const PORT = process.env.PORT || 3000;

const mongoClient = new MongoClient(
  "mongodb+srv://max:5552434@phonebook-cluster.rkycm.mongodb.net/phonebook-db?retryWrites=true&w=majority",
  { useUnifiedTopology: true }
);

app.use(cors());

mongoClient.connect(function (err, client) {
  if (err) return console.log(err);

  app.locals.collection = client
    .db("phonebook-db")
    .collection("phonebook-collection");
  app.listen(PORT);
});

app.get("/phonenumbers", jsonParser, (req, res) => {
  const collection = req.app.locals.collection;

  const search = req.query.search;

  console.log(search);

  collection.find({}).toArray(function (err, phonenumbers) {
    let _phonenumbers = null;

    if (search) {
      _phonenumbers = phonenumbers.filter((num) => num.name.includes(search));
    } else _phonenumbers = phonenumbers;

    if (err) return console.log(err);
    res.send(_phonenumbers);
  });
});

app.post("/phonenumbers", jsonParser, function (req, res) {
  if (!req.body) return res.sendStatus(400);

  const name = req.body.name;
  const number = req.body.phonenumber;

  const phone = { name, phonenumber: number };

  const collection = req.app.locals.collection;
  collection.insertOne(phone, function (err, result) {
    if (err) return console.log(err);
    res.send(phone);
  });
});

app.delete("/phonenumbers/:id", function (req, res) {
  const id = new objectId(req.params.id);
  const collection = req.app.locals.collection;
  collection.findOneAndDelete({ _id: id }, function (err, result) {
    if (err) return console.log(err);
    let phonenumber = result.value;
    res.send(phonenumber);
  });
});

app.put("/phonenumbers/:id", jsonParser, (req, res) => {
  const id = new objectId(req.params.id);
  const name = req.body.name;
  const phonenumber = req.body.phonenumber;

  const collection = req.app.locals.collection;

  collection.findOneAndUpdate(
    { _id: id },
    { $set: { name: name, phonenumber: phonenumber } },
    { returnOriginal: false },
    function (err, result) {
      if (err) return console.log(err);
      const phonenumber = result.value;
      res.send(phonenumber);
    }
  );
});
