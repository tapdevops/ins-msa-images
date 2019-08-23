/*
|--------------------------------------------------------------------------
| Global APP Init
|--------------------------------------------------------------------------
*/
	global._directory_base = __dirname;
	global.__basedir = __dirname;
	global.__rootdir = '';
	global.config = {};
		  config.app = require( './config/app.js' );
		  config.database = require( './config/database.js' )[config.app.env];
	
/*
|--------------------------------------------------------------------------
| APP Setup
|--------------------------------------------------------------------------
*/
	// Node Modules
	const BodyParser = require( 'body-parser' );
	const Express = require( 'express' );
	const ExpressUpload = require( 'express-fileupload' );
	const Http = require( 'http' );
	const Mongoose = require( 'mongoose' );

	// Primary Variable
	const App = Express();

/*
|--------------------------------------------------------------------------
| APP Init
|--------------------------------------------------------------------------
*/
	// Routing Folder
	App.use( '/files', Express.static( 'assets/images' ) );

	// Parse request of content-type - application/x-www-form-urlencoded
	App.use( BodyParser.urlencoded( { extended: false } ) );

	// Parse request of content-type - application/json
	App.use( BodyParser.json() );

	// Add Express Upload to App
	App.use( ExpressUpload() );
	console.log( config.database.url );
	// Setup Database
	Mongoose.Promise = global.Promise;
	Mongoose.connect( config.database.url, {
		useNewUrlParser: true,
		ssl: config.database.ssl
	} ).then( () => {
		console.log( "DB Status \t: Connected " + " (" + config.app.env + ")" );
	} ).catch( err => {
		console.log( "DB Status \t: Not Connected " + " (" + config.app.env + ")" );
	} );

	// Server Running Message
	App.listen( parseInt( config.app.port[config.app.env] ), () => {
		console.log( "App Name\t: " + config.app.name );
		console.log( "App Port\t: " + config.app.port[config.app.env] );
	} );

	// Routing
	require( './routes/api.js' )( App );
	module.exports = App;