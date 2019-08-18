var express = require('express');
var router = express.Router();
var mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const database = require('../database');
const helper = require('../public/javascripts/helper')
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render("home")
});

// Signup as a researcher, TODO: Generate list of codes for the university and check if the code is legit
router.post('/signupr', function(req, res, next) {
    let hash = bcrypt.hash(req.body.password,12,function(err,hash){
        var user2 = {
            username: req.body.username,
            email: req.body.email,
            password: hash,
            admin: true,
        }
        database.Users.create(user2)
        res.redirect('/login')
    })
});
router.get('/signupr', function(req, res, next) {
    res.render('signupr');
});

/*
FOR FUTURE USE ONLY: in case we ever need to create accounts for annotators.
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
router.get('/signup', function (req, res, next) {
	res.render('signup');
});

*/

// Researcher's dashboard
router.get('/main', helper.checkSignIn, function(req, res, next) {
    res.render('main');
});

router.get('/login', function(req, res, next) {
    if(req.session.user != undefined && req.session.user.admin == true)
    {
        res.redirect('/main')
    }
    res.render('login');
});
// 
router.post('/login', async function(req, res, next) {
    var loginUsername = req.body.email
    var loginPassword = req.body.password
    var loggedUser
    await database.Users.findOne({
        email: loginUsername
    }, function(err, obj) {
        if (err) {
            var err = new Error("Database Error!");
            next(err);
        } else {
            if(obj == null)
            {
                res.redirect('/login')
            }
            else{
                loggedUser = obj;
            }

        }
    });
    bcrypt.compare(loginPassword,loggedUser.password,function(err,pass){
        console.log("pass:" + pass, loggedUser)
        if(pass)
        {
            loggedUser = {
                username: loggedUser.username,
                email: loggedUser.email,
                admin: loggedUser.admin
            }
            req.session.user = loggedUser
           if (loggedUser.admin == true) {
              res.redirect('/main')
              } else
        res.redirect('/login')
        }
        else
        res.redirect('/login')
    })
    
})

router.get('/logout', function(req, res, next) {
    req.session.user = null
    res.redirect('/')
})

router.post('/datasetExport/:id', async function(req, res, next) {
    var id = req.params.id
    var imageData = []
    var imageLinks
    await database.Databases.find({
        _id: mongoose.Types.ObjectId(id)
    }, function(err, obj) {
        if (err) {
            var err = new Error("Database Error!");
            next(err);
        } else {
            console.log(obj)
            imageLinks = obj[0].images
        }
    });
    const forLoop = async _ => {
        for (let index = 0; index < imageLinks.length; index++) {
            await database.Coords.find({
                imageUrl: imageLinks[index]
            }, {
                '_id': false
            }, function(err, obj) {
                if (err) {
                    var err = new Error("Database Error!");
                    next(err);
                } else {
                    console.log(obj.length)
                    if (obj.length != 0) {
                        imageData.push(obj[0])
                    }
                }
            });
        }
    }
    console.log(imageData)
    await forLoop();
    res.json(imageData)

})

// check if the user is signed in, if he is render the add database file
router.get('/addDatabase', helper.checkSignIn, function(req, res, next) {
    res.render('addDatabase');
});

// Adds a new dataset to the database
router.post('/addDatabase', function(req, res, next) {
    // annotations and links to images are sent as a string with lines seperating them, 
    // This is to turn that string into seperate arrays of annotations and links to images.
    let annotations = req.body.possibleAnnotations.replace(/[\r]/g, '').replace(/[\n]/g, ' ').split(" ")
    annotations = annotations.filter(function(el) {
        return el != null;
    });
    let dataset = req.body.database.replace(/[\r]/g, '').replace(/[\n]/g, ' ').split(" ")
    dataset = dataset.filter(function(el) {
        return el != null;
	});
	var datasetNumbered = []
	for(var i = 0;i < dataset.length;i++)
	{
		datasetNumbered.push({
			'image':dataset[i],
			'annotations':0
		})
	}
    var imageDatabase = {
        name: req.body.name,
        date: req.body.date,
        width: req.body.width,
        height: req.body.height,
        depth: req.body.depth,
        annotations: annotations,
        images: datasetNumbered,
    }
    database.Databases.create(imageDatabase);
    res.redirect('datasetList');
});

// To add a survey, the researcher needs a list of the current datasets available
// TODO: Check if the datasets need to be only the ones uploaded by this specific researcher
router.get('/addSurvey', helper.checkSignIn, async function(req, res, next) {
    let names = []
    await database.Databases.find({}, function(err, obj) {
        if (err) {
            var err = new Error("Database Error!");
            next(err);
        } else {
            obj.forEach(function(object) {
                names.push(object.name)
            })
        }
    });
    res.render('addSurvey', {
        Names: names
    });
});

// Creates a survey and gives it a random link, the link depends on the first two letters of the dataset's name
// then followed by 7 random characters
router.post('/addSurvey', helper.checkSignIn, async function(req, res, next) {
    let r = Math.random().toString(36).substring(7);
    let trialOrNot = false;
    let numberOfTrials;
    let dataset = req.body.trialImageURLs.replace(/[\r]/g, '').replace(/[\n]/g, ' ').split(" ")
    dataset = dataset.filter(function(el) {
        return el != null;
    });
	let surveyLink = req.body.databaseName.substring(0, 2) + r;
	console.log(req.body)
    if (req.body.trialImages != '') {
        for (var i = 0; i < dataset.length; i++) {
            dataset[i] = {
                imageLink: dataset[i]
            }
        }
        trialOrNot = true;
        numberOfTrials = parseInt(req.body.trialImages, 10)
	}
	else
	{
		numberOfTrials = 0
	}

    var survey = {
        ownerEmail: req.session.user.email,
        surveyLink: surveyLink,
        trialOrNot: trialOrNot,
        numberOfTrials: numberOfTrials,
        trialImages: dataset,
        prolificLink: req.body.Prolific,
        amazonLink: req.body.Amazon,
        datasetName: req.body.databaseName,
        randOrAlpha: req.body.choice.substring(0, 1),
        numberOfImages: req.body.number
    }
    database.Surveys.create(survey)
    if (trialOrNot) {
        res.redirect('/getTrialImages/' + surveyLink);
    } else {
        res.redirect('/surveyCreated/' + surveyLink)
    }
});

router.get('/getTrialImages/:surveyLink', async function(req, res, next) {
    var images;
    await database.Surveys.findOne({
        surveyLink: req.params.surveyLink
    }, function(err, obj) {
        if (err) {
            var err = new Error("Database Error!");
            next(err);
        } else {
            images = obj.trialImages;
        }
    });
    res.render('setTrial', {
        trialImages: images
    });
})

router.post('/trialSubmit/:surveyLink', express.urlencoded({
    extended: true
}), function(req, res, next) {
    var output = []
    database.Surveys.findOne({
        surveyLink: req.params.surveyLink
    }, async function(err, obj) {
        if (err) {
            var err = new Error("Database Error!");
            next(err);
        } else {
            obj.trialImages = req.body;
            for (var i = 0; i < req.body.length; i++) {
                output.push(helper.coordsToInfo(req.body[i].coordinates))
                obj.trialImages[i].maxMins = [output[i][1][1], output[i][0][1], output[i][1][2], output[i][0][2]]
                /*
                obj.trialImages[i].maxY = output[i][1][1]
                obj.trialImages[i].maxX = output[i][0][1]
                obj.trialImages[i].minY = output[i][1][2]
                obj.trialImages[i].minX = output[i][0][2]
                */
            }
            await obj.save();
        }
    })
    res.redirect('/surveyCreated/' + surveyLink)
})

// Shows the researcher a success page with his survey link to share
// TODO: might be a good idea to put social media share buttons here
router.get('/surveyCreated/:surveyLink', function(req, res, next) {
    var surveyLink = req.protocol + '://' + req.get('host') + "/consentForm/" + req.params.surveyLink;
    res.render('surveyCreated', {
        surveyLink: surveyLink
    })
})

// After the user successfully finishes the survey, route him into a success page with a 
// prolific academic and an amazon link, the prolific academic link is given by the platform
// while the amazon link is a random characters added to a base code supplied by the researcher
// TODO: store the amazon codes for cross referencing && Show the user a specific platform based
// on which site routed him to the survey
router.get('/surveyDone/:surveyLink', async function(req, res, next) {
    var prolificLink;
    var amazonLink;
    await database.Surveys.findOne({
        surveyLink: req.params.surveyLink
    }, function(err, obj) {
        if (err) {
            var err = new Error("Database Error!");
            next(err);
        } else {
            prolificLink = obj.prolificLink
            amazonLink = obj.amazonLink
        }
    });
    amazonLink = amazonLink + (Date.now() / 1000).toString().substring(0, 3)
    res.render('surveySuccess', {
        prolificLink: prolificLink,
        amazonLink: amazonLink
    })
})
router.get('/surveyTrial/:surveyUrl', function(req, res, next) {
    res.render('trial.ejs', {
        surveyUrl: req.params.surveyUrl
    })
})

router.get('/consentForm/:surveyLink', function(req, res, next) {
    var surveyLink = req.protocol + '://' + req.get('host') + "/survey/" + req.params.surveyLink;
    res.render('consentform.ejs', {
        surveyLink: surveyLink
    })
})
router.get('/survey/:surveyLink', async function(req, res, next) {
    let outputImages = []
    let surveyObj;
    let output = {}
    await database.Surveys.findOne({
        surveyLink: req.params.surveyLink
    }, function(err, obj) {
        if (err) {
            var err = new Error("Database Error!");
            next(err);
        } else {
            surveyObj = obj;
        }
    });
    // Find the approperiate dataset for the survey, make a (randomized or not) array with the possible annotations
	var sortedImagesArray;
	var datasetUpdated;
	await database.Databases.findOne({
        name: surveyObj.datasetName
    }, async function(err, data) {
        if (err) {
            var err = new Error("Database Error!");
            next(err);
        } else {
            if (surveyObj.randOrAlpha == "R") {
                sortedImagesArray = helper.shuffleArray(data.images)
            }
            let z = 0;
            while (z < surveyObj.numberOfImages && z < sortedImagesArray.length) {
				outputImages.push(sortedImagesArray[z].image)
				var originalIndex = data.images.findIndex(item => item.image === sortedImagesArray[z].image)
				data.images[originalIndex].annotations += 1;
                z = z + 1
            }
            output = {
                images: outputImages,
                datasetName: surveyObj.datasetName,
                surveyLink: req.params.surveyLink,
                possibleAnnotations: data.annotations
            }
            if (data.annotations[0] == "") {
                output.possibleAnnotations = undefined
			}
			datasetUpdated = data
        }
	}); 
	console.log(datasetUpdated)
	await database.Databases.replaceOne({name:surveyObj.datasetName},datasetUpdated)
    var lenz = output.images.length
    var imgs = [];
	var z = 0;
	for(var i = 0; i <output.images.length;i++)
	{
		imgs.push({
			imageUrl:output.images[i]
		})
	}
    for (var i = 0; i < surveyObj.numberOfTrials; i++) {
		imgs.splice(Math.floor(Math.random() * imgs.length),0,surveyObj.trialImages[i])
        
    }
    output.images = imgs;
    res.render('annotatepage.ejs', {
        input: output
    })
})
// for each annotation, if the image is new create an entry for it with tags and coordinates, if it is not then
// add the array of tags and coordinates to the old entry
router.post('/surveySubmit/:surveyUrl', express.urlencoded({
    extended: true
}), async function(req, res, next) {
    req.body.forEach(function(data) {
        var inDB = {
            imageUrl: data.imageUrl,
            tags: [data.tags],
            coordinates: [data.coordinates]
        }
        database.Coords.findOne({
            imageUrl: data.imageUrl
        }, async function(err, obj) {
            if (err) {
                var err = new Error("Database Error!");
                next(err);
            } else {
                if (obj == null) {
                    database.Coords.create(inDB)
                } else {
                    obj.tags.push(data.tags)
                    obj.coordinates.push(data.coordinates)
                    await obj.save();
                }
            }
        })

    })
    res.redirect('/surveyDone/' + req.params.surveyUrl)
})

// get a list of datasets TODO: Figure out if this needs to be researcher specific
router.get('/datasetList', helper.checkSignIn, async function(req, res, next) {
    var datasetList
    await database.Databases.find({}, function(err, obj) {
        if (err) {
            var err = new Error("Database Error!");
            next(err);
        } else
            datasetList = obj
    });
    res.render('datasetList', {
        Datasets: datasetList
    });
});

/* 
FOR FUTURE USE: in case we need to keep track of annotators
router.get('/annotatorList',helper.checkSignIn, async function (req, res, next) {
	var annotatorList
	await database.Users.find({
		admin: false
	}, function (err, obj) {
		if (err) {
				var err = new Error("Database Error!");
		next(err);
		} else
		annotatorList = obj
	});
	res.render('annotatorList', {
		annotators: annotatorList 
	});
});

*/



module.exports = router;