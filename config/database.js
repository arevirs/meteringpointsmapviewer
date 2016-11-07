// config/database.js
module.exports = {

//	"url" : "mongodb://admin:2nlFiR8ShD4s@".concat(process.env.OPENSHIFT_MONGODB_DB_HOST||"localhost",":").concat(parseInt(process.env.OPENSHIFT_MONGODB_DB_PORT||27017),"/").concat(process.env.OPENSHIFT_APP_NAME||'meteringpointsmapviewer',"") 
	"url" : "mongodb://".concat(process.env[process.env.DATABASE_SERVICE_NAME.toUpperCase()+'_USER']||"admin",":").concat(process.env[process.env.DATABASE_SERVICE_NAME.toUpperCase()+'_PASSWORD']||"2nlFiR8ShD4s","@").concat(process.env.OPENSHIFT_MONGODB_DB_HOST||process.env[process.env.DATABASE_SERVICE_NAME.toUpperCase()+'_SERVICE_HOST']||"localhost",":").concat(parseInt(process.env.OPENSHIFT_MONGODB_DB_PORT||process.env[process.env.DATABASE_SERVICE_NAME.toUpperCase()+'_SERVICE_PORT']||27017),"/").concat(process.env.OPENSHIFT_APP_NAME||process.env[process.env.DATABASE_SERVICE_NAME.toUpperCase()+'_DATABASE']||'meteringpointsmapviewer',"") 

};