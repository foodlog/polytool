function shuffleArray(array) {
    return array.slice(0).sort(compareByAnnotations)
}

function compareByAnnotations(a,b)
{
    if ( a.annotations < b.annotations ){
        return -1;
      }
      if ( a.annotations > b.annotations ){
        return 1;
      }
      return 0;
}

function checkSignIn(req, res, next) {
	if (req.session.user) {
		next(); //If session exists, proceed to page
	} else {
		var err = new Error("Not logged in!");
		next(err); //Error, trying to access unauthorized page!
	}
}

function checkSurvey(req,res,next){
	var referrer = req.headers.referer.toString().split('/')
    if (referrer[referrer.length-2] == 'surveyTrial') {
		next(); //If session exists, proceed to page
	} else {
		var err = new Error("Not logged in!");
		next(err); //Error, trying to access unauthorized page!
	}
}

function coordsToInfo(perimeter)
{
	var perimeterArray = [];
	perimeter = perimeter[0]
    for(var i = 0; i < perimeter.length;i++)
    {
        perimeterArray.push(perimeter[i].x)
        perimeterArray.push(perimeter[i].y)
	}
	console.log(perimeter)
    var xPositions = x_positions(perimeterArray)
    var yPositions = y_positions(perimeterArray)
    return [xPositions,yPositions]
}

function x_positions(perimeter) { // Creates an array containing only the X-axis values
    xpo = perimeter.filter(function(value, index, Arr) { // The array containing X-axis
        return index % 2 == 0;
    });

    xpo_max = Math.max(...xpo); // largest value of xpo

    xpo_min = Math.min(...xpo);// smallest value of xpo
    
    return [xpo,xpo_max,xpo_min]
}

function y_positions(perimeter) { // Creates an array containing only the Y-axis values
    ypo = perimeter.filter(function(value, index, Arr) { // The array containing X-axis
        return index % 2 == 1;
    });
    ypo_max = Math.max(...ypo); // largest value of ypo

    ypo_min = Math.min(...ypo); // smallest value of ypo
    return [ypo,ypo_max,ypo_min]
}

module.exports.x_positions = x_positions
module.exports.y_positions = y_positions
module.exports.coordsToInfo = coordsToInfo
module.exports.shuffleArray = shuffleArray
module.exports.checkSignIn = checkSignIn
module.exports.checkSurvey = checkSurvey