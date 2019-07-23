const mongoose = require('mongoose');
const env = require('./config/env');

env.get();
mongodb = {
        uri: 'mongodb://' + process.env.MONGO_DB_HOST + ':' + process.env.MONGO_DB_PORT + '/' + process.env.MONGO_DB_DATABASE + process.env.MONGO_DB_PARAMETERS,
        username: process.env.MONGO_DB_USERNAME,
        password: process.env.MONGO_DB_PASSWORD
    }
mongoose.connect(mongodb.uri, {
      user: mongodb.username,
      pass: mongodb.password,
      socketTimeoutMS:0,
     useNewUrlParser: true
  });
const Schema = mongoose.Schema;
const userSchema = new Schema({
    username: String,
    password: String,
    email: String,
    admin: Boolean,
    annotations:Array,
    created: { type: Date, default: Date.now }
  });

const imagesSchema = new Schema({
    name: String,
    date: Date,
    width: Number,
    height: Number,
    depth: Number,
    annotations: Array,
    images: Array,
    created: { type: Date, default: Date.now }
  });

const coordinatesSchema = new Schema({
    imageUrl: String,
    tags:Array,
    coordinates: Array,
    created: { type: Date, default: Date.now }
  });

const surveySchema = new Schema({
    ownerEmail: String,
    surveyLink: String,
    prolificLink: String,
    amazonLink: String,
    datasetName: String,
    randOrAlpha: String,
    numberOfImages: Number,
    created: { type: Date, default: Date.now }
  });

const models = {};
models.Users = mongoose.model('user-database', userSchema);
models.Databases = mongoose.model('images-datasets',imagesSchema);
models.Surveys = mongoose.model('survey-database',surveySchema);
models.Coords = mongoose.model('coordinates-database',coordinatesSchema);
module.exports = models;