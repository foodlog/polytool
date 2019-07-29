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

module.exports.shuffleArray = shuffleArray
module.exports.checkSignIn = checkSignIn