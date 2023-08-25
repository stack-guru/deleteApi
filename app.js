var express = require('express')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')

var app = express();
var Collection = require('./models/collection')

var PORT = 8081;
var HOST_NAME = 'mongodb+srv://bidify:Bidify1!@cluster0.ksdef.mongodb.net/Bidify?retryWrites=true&w=majority';
// var DATABASE_NAME = 'Bidify';

mongoose.connect(HOST_NAME).catch(error => console.error("error", error.message));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  next();
});

app.get("/", (req, res) => {
    res.status(201).send("Hello World");
})

app.delete("/collection", async (req, res) => {
    console.log('delete collection = ', req.body.token, req.body.network, req.body.platform)
    const deleted = await Collection.deleteOne({ token: req.body.token, network: req.body.network, platform: {'$regex': `^${req.body.platform}$`, $options: 'i'}})
    console.log('deleted collection ', deleted)
    res.status(201).send(deleted)
})

app.listen(PORT, function () {
  console.log('Listening on port ' + PORT);
});
