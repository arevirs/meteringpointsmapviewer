// config/database.js
module.exports = {

//	"url" : "mongodb://admin:2nlFiR8ShD4s@".concat(process.env.OPENSHIFT_MONGODB_DB_HOST||"localhost",":").concat(parseInt(process.env.OPENSHIFT_MONGODB_DB_PORT||27017),"/").concat(process.env.OPENSHIFT_APP_NAME||'meteringpointsmapviewer',"") 
	"url" : "mongodb://".concat(process.env.MONGODB_USER||"admin",":").concat(process.env.MONGODB_PASSWORD||"2nlFiR8ShD4s","@").concat(process.env.OPENSHIFT_MONGODB_DB_HOST||process.env.MONGDB_SERVICE_HOST||"localhost",":").concat(parseInt(process.env.OPENSHIFT_MONGODB_DB_PORT||process.env.MONGDB_SERVICE_PORT||27017),"/").concat(process.env.OPENSHIFT_APP_NAME||'meteringpointsmapviewer',"") 

};