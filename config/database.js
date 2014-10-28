// config/database.js
module.exports = {

	"url" : "mongodb://admin:2nlFiR8ShD4s@".concat(process.env.OPENSHIFT_MONGODB_DB_HOST||"localhost",":").concat(parseInt(process.env.OPENSHIFT_MONGODB_DB_PORT||27017),"/").concat(process.env.OPENSHIFT_APP_NAME||'meteringpointsmapviewer',"")///meteringpointsmapviewer")//'mongodb://'+process.env.OPENSHIFT_MONGODB_DB_HOST||'localhost'+':'+parseInt(process.env.OPENSHIFT_MONGODB_DB_PORT||27017+'/'+process.env.OPENSHIFT_APP_NAME||'meteringpointsmapviewer' // looks like mongodb://<user>:<pass>@mongo.onmodulus.net:27017/Mikha4ot

};