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
		'callbackURL' 		: 'http://meteringpointsmapviewer-nrtim.rhcloud.com/auth/twitter/callback'
	},

	'googleAuth' : {
		'clientID' 		: '333399999678-p98n3gmmp08f7l920n69445hf3rvcg8v.apps.googleusercontent.com',
		'clientSecret' 	: '8O8SqrE1qboBG44DQPMVz3h4',
		'callbackURL' 	: 'http://meteringpointsmapviewer-nrtim.rhcloud.com/auth/google/callback'
	}

};