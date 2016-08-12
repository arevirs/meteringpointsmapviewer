#!/bin/env node
//  OpenShift sample Node application
var express = require('express');//web application framework for node.
var fs      = require('fs'); // file I/O module.
var mongodb = require('mongodb');// the officially supported node.js driver for MongoDB.
var path 	= require('path'); // module contains utilities for handling and transforming file paths.
var later   = require('later'); // a library for describing recurring schedules and calculating their future occurrences.
var restler = require('restler'); // an HTTP(S) client library.
global.last_time_refreshed	= new Date();
//var markercluster = require('leaflet.markercluster');
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');

// configuration ===============================================================
console.log(configDB.url);

var generateMongoUrl = function(){
	   // default to a 'localhost' configuration:
	  var connection_string = 'localhost:27017/meteringpointsmapviewer';
	  // if OPENSHIFT env variables are present, use the available connection info:
	  if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
	    connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
	    process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
	    process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
	    process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
	    process.env.OPENSHIFT_APP_NAME;
	  }
	  return connection_string;
	}


mongoose.connect(generateMongoUrl()); // connect to our database

require('./config/passport')(passport); // pass passport for configuration


/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.dbServer = new mongodb.Server(process.env.OPENSHIFT_MONGODB_DB_HOST||'localhost',parseInt(process.env.OPENSHIFT_MONGODB_DB_PORT||27017));
        self.db = new mongodb.Db(process.env.OPENSHIFT_APP_NAME||'meteringpointsmapviewer', self.dbServer, {auto_reconnect: true});
        self.dbUser = process.env.OPENSHIFT_MONGODB_DB_USERNAME||'admin';
        self.dbPass = process.env.OPENSHIFT_MONGODB_DB_PASSWORD||'2nlFiR8ShD4s';

        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP || process.env.OPENSHIFT_INTERNAL_IP || 'localhost'
        self.port      = process.env.OPENSHIFT_NODEJS_PORT ||  process.env.OPENSHIFT_INTERNAL_PORT || process.env.PORT || 8098

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };
        
        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };

        self.routes['/map'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html') );
        };
        
        self.routes['postMeteringPointsArray'] = function(req, res){

            var meteringpoints = JSON.stringify(req.body);
            var JSONmeteringpoints = JSON.parse(meteringpoints);
//            console.log(req.body);
//            console.log("BODY:"+JSON.stringify(req.body));
//            var jsonObject = JSON.parse(req.body);
//            console.log(jsonObject);

//            var JSONArray='[{"NMI":"XXXXXXXXXX-","IP":"10.31.203.166","pos":[153.070142,-27.377148],"interval_seconds":0},{"NMI":"YYYYYYYYYY-","IP":"10.31.203.166","pos":[153.070142,-27.377148],"interval_seconds":0}]'

//            res.statusCode = 200;
//            res.send("OK\n");
            self.db.collection('meteringpoints').remove({}); // delete first and then insert
            self.db.collection('meteringpoints').insert(JSONmeteringpoints,{safe:true, continueOnError:true}, function(err, result){
                ////we should have caught errors here for a real app
            	if (err) {
            		console.log(err);
            		res.status(200).send("Error happened!\n"+err);
            	}//throw err
            	else {
            		res.status(201).send(result.length+" Metering Points Inserted!");
            	};
//            	console.log("this is the result "+result);
                //res.end('success');
            });
          //res.statusCode = 200;
          //res.send("OK\n");
      
        };
        
        self.routes['within'] = function(req, res){
            var lat1 = parseFloat(req.query.lat1);
            var lon1 = parseFloat(req.query.lon1);
            var lat2 = parseFloat(req.query.lat2);
            var lon2 = parseFloat(req.query.lon2);

            self.db.collection('meteringpoints').find({"pos" : { $geoWithin : { $box: [[lon2,lat2], [lon1,lat1]]}}}).toArray(function(err,nmis){
                res.header("Content-Type:","application/json");
                res.end(JSON.stringify(nmis));
            });
        };
        self.routes['findall'] = function(req, res){
            self.db.collection('meteringpoints').find({"pos":{$exists:true}}).toArray(function(err,nmis){
                res.header("Content-Type","application/json");
                res.end(JSON.stringify(nmis));
            });
        };

        self.routes['findNMIsCoordinates'] = function(req, res){
        	var NMIs=(req.query.NMIs == null)?"":req.query.NMIs; // comma delimited list of NMIs -> NMI-1,NMI-2 to get the coordinates
        	var NMIsCriteria=NMIs.split(","); // create an array of NMIs
            self.db.collection('meteringpoints').find({$and:[{"NMI":{$in:NMIsCriteria}},{'pos':{$exists:true,$ne:null}}]},{NMI:1,_id:0,pos:1}).toArray(function(err,nmis){
            	(req.query.callback == null)?res.json(nmis):res.jsonp(nmis); // return jsonp or json depending which one was requested
            });
        } // findNMIsCoordinates

    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        //self.app = express.createServer();
        self.app  = express();
        self.app.use(express.compress());
        //This uses the Connect frameworks body parser to parse the body of the post request
        self.app.configure(function () {

        	// set up our express application
        	self.app.use(morgan('dev')); // log every request to the console
        	self.app.use(cookieParser()); // read cookies (needed for auth)
        	self.app.use(bodyParser.json({limit: '5mb'})); // get information from html forms
        	self.app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));

        	self.app.set('view engine', 'ejs'); // set up ejs for templating

        	// required for passport
        	self.app.use(session({ secret: 'meteringdynamicssecuredsession', cookie: { maxAge: 1800000 } })); // session secret
        	self.app.use(passport.initialize());
        	self.app.use(passport.session()); // persistent login sessions
        	self.app.use(flash()); // use connect-flash for flash messages stored in session
        	
        	
        	  self.app.use(express.bodyParser());
              self.app.use(express.methodOverride());
              self.app.use('/images',express.static(path.join(__dirname, 'public/images')));
              self.app.use('/scripts',express.static(path.join(__dirname, 'public/scripts')));
              self.app.use('/stylesheets',express.static(path.join(__dirname, 'public/stylesheets')));
              self.app.use('/highstock',express.static(path.join(__dirname, 'public/scripts/highstock')));
              self.app.use('/nodemodules',express.static(path.join(__dirname, 'node_modules')));
              self.app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
              
           // routes ======================================================================
              require('./app/routes.js')(self, passport); // load our routes and pass in our app and fully configured passport
              //self.app.get('/ws/meteringpoints/postJSONArray', self.routes['postMeteringPointsArray']);
              
              
        });
        
//        //  Add handlers for the app (from the routes).
//        for (var r in self.routes) {
//            self.app.get(r, self.routes[r]);
//        }
//
//        self.app.get('/ws/meteringpoints/within', self.routes['within']);
//        self.app.get('/ws/meteringpoints/findall', self.routes['findall']);

    };
    
    
    self.initializeSchedule = function() {
    	var sched = later.parse.recur().every(15).minute(),
        t = later.setInterval(function() { refreshInterval(); }, sched);

    	function refreshInterval() {
    		restler.get('https://www.d2i.com.au/nrtim/meterreadings?find=ForAllNmiExtendedGetIntervalStatus',
//    		restler.get('http://localhost:8080/NRTIS/meterreadings?find=ForAllNmiExtendedGetIntervalStatus',
    				{username:'administrator',
    			     password:'Da$h80ard01',
    			     headers: { 'Content-Type': 'application/json', 'Accept':'application/json' }
    			    }).on('complete', function(result, response) {
    					  if (result instanceof Error) {
    						    console.log('Error:', new Date()+result.message);
    						    //this.retry(5000); // try again after 5 sec
    						  } else if (response.statusCode==200){
   					    		console.log(new Date()+response.statusCode);
   					    		result.forEach(function(entry) {
   					    			self.db.collection('meteringpoints').update(
   					    					{'NMI':entry.NMI},
   					    					{$set:{'interval_seconds':entry.interval_seconds,'last_datetime':new Date(entry.last_datetime)}},
   					    					{upsert:true});
//   					    			console.log('Upserted row:'+entry.NMI+':'+entry.interval_seconds+entry.last_datetime);
   					    		});
				    		    console.log(result.length+' rows Upserted!');
				        		// update the interval_seconds again.
				        		self.db.collection('meteringpoints').aggregate([
				        		   // for the rows with interval_seconds > 0 and last_datetime column exists 
				        		   {$match:{$and:[{'interval_seconds':{$gt:0}},{'last_datetime':{$exists:true,$ne:null}}]}},
				        		   // compute the difference in milliseconds between now and last_datetime
				        		   {$project:{'interval_milliseconds':{ $divide:[{$subtract:[new Date(),'$last_datetime']},1]}}}
				        		                                                ], function(err,result){
				        				result.forEach(function(document){
				        					self.db.collection('meteringpoints').update(
				        							{'_id':document._id},
				        							// compute the differemce in seconds between now and last_datetime
				        							{$set:{"interval_seconds":Math.floor(document.interval_milliseconds/1000)}}
				        							);
				        					//console.log('updated row:'+document._id+' '+document.interval_milliseconds);
				        				});
				        				console.log(result.length+' rows Updated!');
				        		});
				        		} else {
    							  console.log('Error:'+new Date()+response.statusCode+result.message);
    						  }
    						});
    	} // refreshInterval
    } //initilizeSchedule

    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
        
        // schedule the task to call a REST web service to get the intervals a NMI has been out.
        self.initializeSchedule();
    };

    // Logic to open a database connection. We are going to call this outside of app so it is available to all our functions inside.

    self.connectDb = function(callback){
      self.db.open(function(err, db){
        if(err){ throw err };
        self.db.authenticate(self.dbUser, self.dbPass, {authdb: "admin"}, function(err, res){
          if(err){ throw err };
          callback();
        });
      });
    };

    
    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
            console.log(configDB.url);
            console.log(generateMongoUrl());
			console.log('IISNode version is ' + process.env.IISNODE_VERSION + ' and Node.js version is ' + process.version);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var app = new SampleApp();
app.initialize();
app.connectDb(app.start);

