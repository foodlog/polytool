const mongoose = require('mongoose');

const Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost:27017/local', {
    socketTimeoutMS:0,
    useNewUrlParser: true});

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

const models = {};
models.Users = mongoose.model('user-database', userSchema);
models.Databases = mongoose.model('images-datasets',imagesSchema);

module.exports = models;