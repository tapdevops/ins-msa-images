/*
 |--------------------------------------------------------------------------
 | App Setup
 |--------------------------------------------------------------------------
 |
 | Untuk menghandle models, libraries, helper, node modules, dan lain-lain
 |
 */
 	// Libraries
 	const config = require( _directory_base + '/config/config.js' );
 	
 	// Node Modules
	const jwt = require( 'jsonwebtoken' );
	const jwtDecode = require( 'jwt-decode' );
	const nJwt = require( 'njwt' );
	const uuid = require( 'uuid' );

	// Declare Controllers
	const ImageController = require( _directory_base + '/app/controllers/ImageController.js' );

/*
 |--------------------------------------------------------------------------
 | Routing
 |--------------------------------------------------------------------------
 */
	module.exports = ( app ) => {

		/*
		 |--------------------------------------------------------------------------
		 | Image
		 |--------------------------------------------------------------------------
		 */
			app.post( '/sync-mobile/images/', token_verify, ImageController.syncMobile );
			app.get( '/images/:id', token_verify, ImageController.find );
			app.post( '/image/upload-file', token_verify, ImageController.createFile );
	}

/*
 |--------------------------------------------------------------------------
 | Token Verify
 |--------------------------------------------------------------------------
 */
	function token_verify( req, res, next ) {
		const bearerHeader = req.headers['authorization'];
		if ( typeof bearerHeader !== 'undefined' ) {
			const bearer = bearerHeader.split( ' ' );
			const bearer_token = bearer[1];
			req.token = bearer_token;
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
			res.sendStatus( 403 );
		}
	}