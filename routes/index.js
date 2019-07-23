var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const database = require('../database');

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render("home.ejs")
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

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

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
router.get('/main', checkSignIn, function (req, res, next) {
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
router.get('/add-database', checkSignIn, function (req, res, next) {
	res.render('addDatabase');
});

router.get('/add-survey', checkSignIn, async function (req, res, next) {
	let names = []
	await database.Databases.find({}, function (err, obj) {
		if (err) {
			console.log(err);
		} else {
		obj.forEach(function(object){
			names.push(object.name)
		})
	}
	});
	res.render('addSurvey', {Names:names});
});

router.post('/add-survey',checkSignIn, async function(req,res,next){
	let r = Math.random().toString(36).substring(7);
	let surveyLink = req.body.databaseName.substring(0,2)+r
	var survey = {
		ownerEmail: req.session.user.email,
		surveyLink: surveyLink,
		prolificLink: req.body.Prolific,
		amazonLink: req.body.Amazon,
		datasetName: req.body.databaseName,
		randOrAlpha: req.body.choice.substring(0,1),
		numberOfImages: req.body.number
	}
	database.Surveys.create(survey)
	res.redirect('/surveysuccess/'+surveyLink)
});

router.get('/surveysuccess/:surveyLink', function(req,res,next){
	var surveyLink = req.protocol + '://' + req.get('host') + "/survey/" +req.params.surveyLink;
	res.render('surveySuccess',{surveyLink:surveyLink})
})


router.get('/surveyDone/:surveyLink', async function(req,res,next){
	var prolificLink;
	var amazonLink;
	await database.Surveys.findOne({surveyLink:req.params.surveyLink}, function (err, obj) {
		if (err) {
			console.log(err);
		} else {
		prolificLink = obj.prolificLink
		amazonLink = obj.amazonLink
		console.log(obj)
	}
	});
	console.log(prolificLink)
	amazonLink = amazonLink + (Date.now()/1000).toString().substring(0,3)
	res.render('done',{prolificLink:prolificLink,amazonLink:amazonLink})
})

router.get('/survey/:surveyLink',async function(req,res,next){
	console.log(req.params.surveyLink)
	let outputImages = []
	let surveyObj;
	let output = {}
	await database.Surveys.findOne({
		surveyLink: req.params.surveyLink
	}, function (err, obj) {
		if (err) {
			console.log(err);
		} else {
			surveyObj = obj;
		}
	});
	await database.Databases.findOne({
		name:surveyObj.datasetName
	}, function(err,data){
		if(err){
			console.log(err)
			return;
		}
		else
		{
			if(surveyObj.randOrAlpha == "R"){
				shuffleArray(data.images)
			}
			let z = 0;
			while(z < surveyObj.numberOfImages && z < data.images.length)
			{
				outputImages.push(data.images[z])
				z = z+1
			}
			console.log(data)
			output = {
				images:outputImages,
				datasetName: surveyObj.datasetName,
				surveyLink: req.params.surveyLink,
				possibleAnnotations: data.annotations
			}
		}
	});
	console.log("After the database request")
	res.render('annotatepage.ejs',{input:output})
})
router.post('/surveySubmit/:surveyUrl', express.urlencoded({ extended: true }), async function(req,res,next){
	req.body.forEach(function(data){
		var inDB = {
			imageUrl: data.imageUrl,
			tags: data.tags,
			coordinates:data.coordinates
		}
		database.Coords.create(inDB);
	})
	res.redirect('/surveyDone/'+req.params.surveyUrl)
})
router.get('/dataset-list',checkSignIn, async function (req, res, next) {
	var stuff
	await database.Databases.find({}, function (err, obj) {
		if (err) {
			console.log(err);
		} else
		stuff = obj
	});
	console.log(stuff)
	res.render('DatasetList', {
		Datasets: stuff
	});
});


router.get('/annotator-list',checkSignIn, async function (req, res, next) {
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
	annotations = annotations.filter(function (el) {
		return el != null;
	});
	let dataset = req.body.database.replace(/[\r]/g, '').replace(/[\n]/g, ' ').split(" ")
	dataset = dataset.filter(function (el) {
		return el != null;
	});
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

