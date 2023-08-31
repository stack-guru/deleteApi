var express = require('express')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')
const dotenv = require('dotenv')
const cors = require('cors');
const AWS = require('aws-sdk');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

dotenv.config()

var app = express();
var Collection = require('./models/collection')
var AuctionIndex = require('./models/auctionIndex')
var Metadata = require('./models/metadata');
const idManagement = require('./models/idManagement');

var PORT = process.env.PORT;
var HOST_NAME = process.env.MONGODB_URL;
// var DATABASE_NAME = 'Bidify';

mongoose.connect(HOST_NAME).catch(error => console.error("error", error.message));
app.use(cors({
  origin: '*'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  next();
});

app.get("/", (req, res) => {
  res.status(201).send("Hello World");
})

app.post("/collection/delete", async (req, res) => {
  const deleted = await Collection.deleteOne({ token: req.body.token, network: req.body.network, platform: { '$regex': `^${req.body.platform}$`, $options: 'i' } })
  res.status(201).send(deleted)
})

app.post("/auctionIndex/update", async (req, res) => {
  const network = req.body.network
  const latest = req.body.latest

  const found = await AuctionIndex.findOne({ network })
  if (found) { // update
    const ret = await AuctionIndex.findOneAndUpdate({ network }, { latest })
    console.log('update auction index ', ret)
  } else { // create
    const ret = await AuctionIndex.create({ network, latest })
    console.log('create auction index ', ret)
  }
})

app.post("/metadata/create", async (req, res) => {
  const network = req.body.network
  const platform = req.body.platform
  const image = req.body.image

  const found = await Metadata.findOne({ network, platform })
  if (found) { // update
    const ret = await Metadata.findOneAndUpdate({ network, platform }, { image })
    console.log('update image data ', ret)
  } else {
    const ret = await Metadata.create({ network, platform })
    console.log('create image data '.ret)
  }
})

app.get("/metadata/read", async (req, res) => {
  const network = req.params.network
  const platform = req.params.platform

  const found = await Metadata.findOne({ network, platform })
  res.status(201).send(found)
})

app.get("/id/read", async (req, res) => {
  const network = req.query.network

  const found = await idManagement.findOne({ network })
  console.log('found = ', found)
  res.status(201).send(found)
})

app.post('/id/update', async (req, res) => {
  const network = req.body.network
  let id = req.body.lastId
  console.log('id = ', id)
  let lastId = id + 1
  console.log('lastId = ', lastId)

  const result = await idManagement.findOneAndUpdate({ network }, { lastId })
  res.status(201).send(result)
})


const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: 'eu-west-2'
})


app.post('/uploadFile', async (req, res) => {
  let fullUrl = ""

  console.log('upload file post')
  const image = req.body.image
  console.log('url = ', image)
  const imgRes = await fetch(image)
  const contentType = imgRes.headers.get('Content-Type')
  const blob = await imgRes.buffer();
  const fileName = uuidv4();

  // get file extension
  let fileExt = image.split(".").pop()
  if (!fileExt || fileExt.length > 4) {
    let mimeType = contentType.split(",")[0]
    if (!mimeType) {
      fileExt = ""
    } else {
      if (mimeType) {
        mimeType = mimeType.split(";")[0]
      }
      if (mimeType) {
        fileExt = mimeType.split("/").pop()
      }
    }
  }
  console.log('file extension = ', fileExt)

  if (fileExt) {
    const fullName = fileName + '.' + fileExt
    console.log('full name = ', fullName)

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fullName,
      Body: blob,
    };

    console.log(params)
    // Uploading file to s3
    var upload = s3
      .putObject(params)
      .on("httpUploadProgress", (evt) => {
        const percent = parseInt((evt.loaded * 100) / evt.total)
        console.log('percent = ', percent)
        // setProcessContent(
        //   // "Uploading image to the fleek storage",
        //   "Uploading image to the storage " + percent + "%"
        // );
      })
      .promise();

    await upload.then()
    fullUrl = process.env.AWS_S3_CLOUDFRONT + fullName
  } else {
    fullUrl = image
  }

  console.log('fullUrl = ', fullUrl)
  res.status(201).send(fullUrl)
})

app.listen(PORT, function () {
  console.log('Listening on port ' + PORT);
});
