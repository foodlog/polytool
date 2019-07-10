var express = require('express');
var router = express.Router();
const database = require('../database');

/* GET home page. */
router.get('/', checkSignIn, function (req, res, next) {
	res.render('index', {
		title: 'Express'
	});
});
router.post('/signupr', function (req, res, next) {
	console.log(req.body);
	var user2 = {
		username: req.body.username,
		email: req.body.email,
		password: req.body.password,
		admin: true,
	}
	database.Users.create(user2)
	res.redirect('/login')
});

function checkSignIn(req, res, next) {
	if (req.session.user) {
		next(); //If session exists, proceed to page
	} else {
		var err = new Error("Not logged in!");
		next(err); //Error, trying to access unauthorized page!
	}
}

router.post('/signup', function (req, res, next) {
	var user2 = {
		email: req.body.code,
		username: req.body.code,
		password: req.body.password,
		admin: false,
	}
	database.Users.create(user2)
	res.redirect('/login')
});
router.get('/signupr', function (req, res, next) {
	res.render('signupr');
});
router.get('/main', function (req, res, next) {
	res.render('mainLoggedIn');
});
router.get('/signup', function (req, res, next) {
	res.render('signup');
});
router.get('/login', function (req, res, next) {
	res.render('login');
});
router.post('/login', async function (req, res, next) {
	var loginUsername = req.body.email
	var loginPassword = req.body.password
	var stuff
	await database.Users.findOne({
		email: loginUsername,
		password: loginPassword
	}, function (err, obj) {
		if (err) {
			console.log(err);
		} else
			console.log("login successfull")
		stuff = obj
	});
  req.session.user = stuff
  console.log(stuff)
  if(stuff.admin == true)
  {
    res.redirect('/main')
  }
  else
	res.redirect('/')
})
router.get('/add-database', function (req, res, next) {
	res.render('addDatabase');
});

router.get('/dataset-list', async function (req, res, next) {
	var stuff
	await database.Databases.find({}, function (err, obj) {
		if (err) {
			console.log(err);
		} else
			console.log("login successfull")
		stuff = obj
	});
	console.log(stuff)
	res.render('DatasetList', {
		Datasets: stuff
	});
});

router.get('/annotator-list', async function (req, res, next) {
	await database.Users.find({
		admin: false
	}, function (err, obj) {
		if (err) {
			console.log(err);
		} else
			console.log("login successfull")
		stuff = obj
	});
	console.log(stuff)
	res.render('annotatorList', {
		annotators: stuff
	});
});

router.post('/add-database', function (req, res, next) {
	let annotations = req.body.possibleAnnotations.replace(/[\r]/g, '').replace(/[\n]/g, ' ').split(" ")
	let dataset = req.body.database.replace(/[\r]/g, '').replace(/[\n]/g, ' ').split(" ")
	var imageDatabase = {
		name: req.body.name,
		date: req.body.date,
		width: req.body.width,
		height: req.body.height,
		depth: req.body.depth,
		annotations: annotations,
		images: dataset,
	}
	console.log(imageDatabase);
	database.Databases.create(imageDatabase);
	res.redirect('dataset-list');
});

module.exports = router;

