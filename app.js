/*
|--------------------------------------------------------------------------
| APP Setup
|--------------------------------------------------------------------------
*/
	// Node Modules
	const bodyParser = require( 'body-parser' );
	const express = require( 'express' );
	const expressUpload = require( 'express-fileupload' );
	const http = require( 'http' );
	const mongoose = require( 'mongoose' );

	// Primary Variable
	const app = express();

	// Config
	const config = {};
		  config.app = require( './config/config.js' );
		  config.database = require( './config/database.js' )[config.app.env];

/*
|--------------------------------------------------------------------------
| Global APP Init
|--------------------------------------------------------------------------
*/
	global._directory_base = __dirname;
	global.__basedir = __dirname;
	global.__rootdir = '';

/*
|--------------------------------------------------------------------------
| APP Init
|--------------------------------------------------------------------------
*/
	// Routing Folder
	app.use( '/files', express.static( 'assets/images' ) );

	// Parse request of content-type - application/x-www-form-urlencoded
	app.use( bodyParser.urlencoded( { extended: false } ) );

	// Parse request of content-type - application/json
	app.use( bodyParser.json() );

	// Add Express Upload to App
	app.use( expressUpload() );

	// Setup Database
	mongoose.Promise = global.Promise;
	mongoose.connect( config.database.url, {
		useNewUrlParser: true,
		ssl: config.database.ssl
	} ).then( () => {
		console.log( 'Successfully connected to the Database' );
	} ).catch( err => {
		console.log( 'Could not connect to the Database. Exiting application.' )
	} );
	
	// Server Running Message
	app.listen( config.app.port, () => {
		console.log( 'Server ' + config.app.name + ' Berjalan di port ' + config.app.port );
	} );

	// Routing
	app.get( '/', ( req, res ) => {
		res.json( { 'message': config.app.name } )
	} );

	require( './routes/route.js' )( app );
	module.exports = app;