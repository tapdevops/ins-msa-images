const jwt = require( 'jsonwebtoken' );
const config = require( '../config/config.js' );
const uuid = require( 'uuid' );
const nJwt = require( 'njwt' );
const jwtDecode = require( 'jwt-decode' );

module.exports = ( app ) => {
	// Declare Controllers
	const uploadImage = require( '../app/controllers/uploadImage.js' );

	// ROUTE - IMAGE
	//app.get( '/sync-mobile/images/:start_date/:end_date', token_verify, uploadImage.syncMobile );
	app.post( '/ssync-mobile/images/', token_verify, uploadImage.syncMobile );
	app.get( '/simages/:id', token_verify, uploadImage.find );
	app.post( '/simage/description', token_verify, uploadImage.createDesc );
	app.post( '/simage/upload-file', token_verify, uploadImage.createFile );
	//app.post( '/image/upload-file-base64', token_verify, uploadImage.createFileWithBase64 );
	app.post( '/ismage/upload-file-base64', uploadImage.createFileWithBase64 );
	

	app.get( '/stesting', token_verify, uploadImage.readfile );
	app.get( '/stesting2', uploadImage.readfile2 );
	app.get( '/stesting3', uploadImage.testProtocol );
}

function token_verify( req, res, next ) {
	// Get auth header value
	const bearerHeader = req.headers['authorization'];

	if ( typeof bearerHeader !== 'undefined' ) {
		const bearer = bearerHeader.split( ' ' );
		const bearer_token = bearer[1];

		req.token = bearer_token;
		req.rootpath = __dirname;

		nJwt.verify( bearer_token, config.secret_key, config.token_algorithm, ( err, authData ) => {
			if ( err ) {
				res.send({
					status: false,
					message: "Invalid Token",
					data: []
				} );
			}
			else {
				req.auth = jwtDecode( req.token );
				req.auth.LOCATION_CODE_GROUP = req.auth.LOCATION_CODE.split( ',' );
				req.config = config;
				next();
			}
		} );
		
	}
	else {
		// Forbidden
		res.sendStatus( 403 );
	}
}

function verifyToken( req, res, next ) {
	// Get auth header value
	const bearerHeader = req.headers['authorization'];

	if ( typeof bearerHeader !== 'undefined' ) {
		const bearer = bearerHeader.split( ' ' );
		const bearerToken = bearer[1];

		req.token = bearerToken;
		next();
	}
	else {
		// Forbidden
		res.sendStatus( 403 );
	}
}