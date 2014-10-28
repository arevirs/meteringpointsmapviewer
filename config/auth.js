// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

	'facebookAuth' : {
		'clientID' 		: 'your-secret-clientID-here', // your App ID
		'clientSecret' 	: 'your-client-secret-here', // your App Secret
		'callbackURL' 	: 'http://localhost:8080/auth/facebook/callback'
	},

	'twitterAuth' : {
		'consumerKey' 		: '1xSPvAcNlQNOFct2vLJHfzEqR',
		'consumerSecret' 	: 'HvGBqPzn9b1jyfTmFTx2Lng6Vi1PRIeZvEmRL6tVdTL7PYye3t',
		'callbackURL' 		: 'http://meteringpointsmapviewer-nrtim.com.au/auth/twitter/callback'
	},

	'googleAuth' : {
		'clientID' 		: 'your-secret-clientID-here',
		'clientSecret' 	: 'your-client-secret-here',
		'callbackURL' 	: 'http://localhost:8080/auth/google/callback'
	}

};