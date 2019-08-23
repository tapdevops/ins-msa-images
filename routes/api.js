/*
 |--------------------------------------------------------------------------
 | Setup
 |--------------------------------------------------------------------------
 */
	// Node Modules
	const RoutesVersioning = require( 'express-routes-versioning' )();

	// Controllers
	const Controllers = {
		v_1_0: {
			Image: require( _directory_base + '/app/v1.0/Http/Controllers/ImageController.js' ),
		}
	}

	// Middleware
	const Middleware = {
		v_1_0: {
			VerifyToken: require( _directory_base + '/app/v1.0/Http/Middleware/VerifyToken.js' )
		}
	}
	
/*
 |--------------------------------------------------------------------------
 | Routing
 |--------------------------------------------------------------------------
 */
	module.exports = ( app ) => {

		/*
		 |--------------------------------------------------------------------------
		 | Welcome Message
		 |--------------------------------------------------------------------------
		 */
			app.get( '/', ( req, res ) => {
				res.json( { 
					application: {
						name : config.app.name,
						env : config.app.env,
						port : config.app.port[config.app.env]
						
					} 
				} )
			} );

		/*
		 |--------------------------------------------------------------------------
		 | API Versi 1.0
		 |--------------------------------------------------------------------------
		 */
		 	// Upload Image Transaksi
		 	app.post( '/api/v1.0/upload/image/foto-transaksi', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.Image.create_file );
		 	
		 	// Get Foto Profile
			app.get( '/api/v1.0/foto-profile', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.Image.find_one_file_foto_profile );

		 	// Upload Image Foto Profile
		 	app.post( '/api/v1.0/upload/image/foto-profile', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.Image.create_file_foto_profile );

		 	// Sync Mobile Images
			app.post( '/api/v1.0/sync-mobile/images', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.Image.sync_mobile );
			
			// Get Images By TR_CODE
			app.get( '/api/v1.0/images/:id', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.Image.find );
		/*
		 |--------------------------------------------------------------------------
		 | Old API
		 |--------------------------------------------------------------------------
		 */
			app.post( '/sync-mobile/images/', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.Image.sync_mobile );
			app.get( '/images/:id', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.Image.find );
			app.post( '/image/upload-file', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.Image.create_file );

	}