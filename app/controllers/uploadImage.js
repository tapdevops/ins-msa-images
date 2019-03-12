/*
 |--------------------------------------------------------------------------
 | App Setup
 |--------------------------------------------------------------------------
 |
 | Untuk menghandle models, libraries, helper, node modules, dan lain-lain
 |
 */
 	// Models
	const imageUploadModel = require( '../models/uploadImage.js' );

	// Node Modules
	const querystring = require( 'querystring' );
	const url = require( 'url' );
	const jwt = require( 'jsonwebtoken' );
	const uuid = require( 'uuid' );
	const nJwt = require( 'njwt' );
	const jwtDecode = require( 'jwt-decode' );
	const Client = require( 'node-rest-client' ).Client; 
	const fs = require( 'file-system' );
	const SSHClient = require( 'scp2' );
	const fServer = require( 'fs' );
	const path = require( 'path' );
	const execSync = require( 'child_process' ).execSync;

	// Libraries
	const config = require( '../../config/config.js' );
	const date = require( '../libraries/date' );

/**
 * syncMobile
 * Untuk 
 * --------------------------------------------------------------------------
 */

	exports.syncMobile = ( req, res ) => {

		if( !req.body.TR_CODE ) {
			return res.send( {
				status: false,
				message: config.error_message.find_404,
				data: {}
			} );
		}

		imageUploadModel.find( { 
			TR_CODE : req.body.TR_CODE,
			DELETE_USER: ""
		} )
		.select( {
			_id: 0,
			IMAGE_CODE: 1,
			IMAGE_NAME: 1,
			IMAGE_PATH: 1,
			IMAGE_PATH_LOCAL: 1,
			TR_CODE: 1,
			STATUS_IMAGE: 1,
			STATUS_SYNC: 1,
			SYNC_TIME: 1,
			INSERT_USER: 1,
			INSERT_TIME: 1,
			UPDATE_USER: 1,
			UPDATE_TIME: 1,
			DELETE_USER: 1,
			DELETE_TIME: 1
		} )
		.limit( 20 )
		.sort( {
			//TR_CODE: -1,
			INSERT_TIME: -1
		} )
		.then( data => {
			if( !data ) {
				return res.send( {
					status: false,
					message: config.error_message.find_404,
					data: {}
				} );
			}

			var results = [];
			if ( config.app_env == 'production' ) {
				var path_global = req.protocol + '://' + req.get( 'host' ) + '/' + config.path_production + '/';
			}
			else {
				var path_global = req.protocol + '://' + req.get( 'host' ) + '/' + config.path_development ;
			}
			data.forEach( function( result ) {
				var type_tr = 'F';
				var path_tr = 'finding';
				if ( result.TR_CODE.substr( 0, 1 ) == 'I' ) {
					type_tr = 'I';
					path_tr = 'inspeksi';
				}
				else if ( result.TR_CODE.substr( 0, 1 ) == 'E' ) {
					type_tr = 'E';
					path_tr = 'ebcc';
				}

				results.push( {
					TR_CODE: result.TR_CODE,
					IMAGE_CODE: result.IMAGE_CODE,
					IMAGE_NAME: result.IMAGE_NAME,
					IMAGE_PATH_LOCAL: result.IMAGE_PATH_LOCAL,
					IMAGE_URL: path_global + '/files/' + result.IMAGE_PATH + '/' + result.IMAGE_NAME,
					STATUS_IMAGE: result.STATUS_IMAGE,
					STATUS_SYNC: result.STATUS_SYNC,
					INSERT_USER: result.INSERT_USER,
					INSERT_TIME: date.convert( String( result.INSERT_TIME ), 'YYYY-MM-DD hh-mm-ss' )
				} );

				console.log(path_global + '/files/' + result.IMAGE_PATH + '/' + result.IMAGE_NAME)
				console.log(path_global + '/files/' + result.IMAGE_PATH + '/')
				console.log(path_global + '/files/')
			} );

			res.send( {
				status: true,
				message: config.error_message.find_200,
				data: results
			} );
		} ).catch( err => {
			res.send( {
				status: false,
				message: config.error_message.find_500,
				data: {}
			} );
		} );
	}

/**
 * find
 * Untuk menyimpan data yang diupload
 * --------------------------------------------------------------------------
 */
	exports.find = ( req, res ) => {

		if( !req.params.id ) {
			return res.send( {
				status: false,
				message: config.error_message.invalid_input + 'TR_CODE.',
				data: {}
			} );
		}

	 	imageUploadModel.find( { 
			TR_CODE : req.params.id,
			DELETE_USER: ""
		} )
		.select({
			_id: 0,
			IMAGE_CODE: 1,
			IMAGE_NAME: 1,
			IMAGE_PATH: 1,
			IMAGE_PATH_LOCAL: 1,
			TR_CODE: 1,
			STATUS_IMAGE: 1,
			STATUS_SYNC: 1,
			SYNC_TIME: 1,
			INSERT_USER: 1,
			INSERT_TIME: 1,
			UPDATE_USER: 1,
			UPDATE_TIME: 1,
			DELETE_USER: 1,
			DELETE_TIME: 1
		})
		.then( data => {
			if( !data ) {
				return res.send( {
					status: false,
					message: config.error_message.find_404,
					data: {}
				} );
			}

			var results = [];
			data.forEach( function( result ) {
				results.push( {
					TR_CODE: result.TR_CODE,
					IMAGE_CODE: result.IMAGE_CODE,
					IMAGE_NAME: result.IMAGE_NAME,
					IMAGE_PATH_LOCAL: result.IMAGE_PATH_LOCAL,
					IMAGE_URL: req.protocol + '://' + req.get( 'host' ) + '/files/' + result.IMAGE_PATH + '/' + result.IMAGE_NAME,
					STATUS_IMAGE: result.STATUS_IMAGE,
					STATUS_SYNC: result.STATUS_SYNC, // Tambahan
					INSERT_USER: result.INSERT_USER,
					INSERT_TIME: date.convert( String( result.INSERT_TIME ), 'YYYY-MM-DD hh:mm:ss' )
				} );
			} );
			res.send( {
				status: true,
				message: config.error_message.find_200,
				data: results
			} );
		} ).catch( err => {
			res.send( {
				status: false,
				message: config.error_message.find_500,
				data: {}
			} );
		} );
	};

/**
 * createFile
 * Untuk menyimpan data yang diupload dengan multipart/form-data
 * --------------------------------------------------------------------------
 */
 	exports.createFile = ( req, res ) => {


		if( !req.files ) {
			return res.send( {
				status: false,
				message: config.error_message.invalid_input + 'REQUEST FILES.',
				data: {}
			} );
		}

		if ( !req.body.TR_CODE  ) {
			return res.send( {
				status: false,
				message: config.error_message.invalid_input + ' TR_CODE.',
				data: {}
			} );
		}

		var auth = req.auth;
		var file = req.files.FILENAME;
		var filename = String( file.name );
		var new_extension = req.files.FILENAME.mimetype.split( "/" )[1];
		var new_filename = req.body.TR_CODE + '_' + req.body.IMAGE_CODE + "." + new_extension;
		var upload_folder = 'images-inspeksi';
		var dir_date = date.convert( req.body.INSERT_TIME, 'YYYYMMDDhhmmss' ).substr( 0, 8 );
		var opt = {
			encoding: 'utf8'
		};

		if ( String( req.body.TR_CODE.substr( 0, 1 ) ) == 'F' ) {
			upload_folder = 'images-finding';
		}
		else if ( String( req.body.TR_CODE.substr( 0, 1 ) ) == 'V' ) {
			upload_folder = 'images-ebcc';
		}

		if ( file.mimetype == 'image/jpeg' || file.mimetype == 'image/jpg' ) {
			console.log( execSync( "mkdir -p /imagesebcc/" + upload_folder + "/" + dir_date + "" ) );
			file.mv( "/imagesebcc/" + dir_date + "/" + new_filename, function( err ) {
				if ( err ) {
					res.json( {
						status: false,
						message: "Error Upload",
						error: err
					} );
				}
				res.json( {
					message: "OK"
				} )
				/*
				else {
					

					

					

					fs.rename( 'assets/temp/' + filename, 'assets/temp/' + new_filename, function(err) {
						if ( err ) {
							res.json( {
								status: false,
								message: "Error Rename",
								data: []
							} );
						}
						// Create folder on AliCloud
						console.log( execSync( "ssh root@149.129.249.86 'mkdir -p /root/mobile-inspection/" + upload_folder + "/" + dir_date + "/'", opt ) );
						// Send to AliCloud
						console.log( execSync( "scp assets/temp/" + new_filename + " root@149.129.249.86:/root/mobile-inspection/" + upload_folder + "/" + dir_date + "/", opt ) );
						// Delete temporary local upload image
						console.log( execSync( "rm assets/temp/" + new_filename ) );

						// Save to DB
						const set = new imageUploadModel( {
							IMAGE_CODE: req.body.IMAGE_CODE,
							TR_CODE: req.body.TR_CODE || "",
							IMAGE_NAME: new_filename,
							IMAGE_PATH: upload_folder + "/" + dir_date + "/",
							IMAGE_PATH_LOCAL: req.body.IMAGE_PATH_LOCAL || "",
							STATUS_IMAGE: req.body.STATUS_IMAGE || "",
							MIME_TYPE: req.files.FILENAME.mimetype,
							STATUS_SYNC: req.body.STATUS_SYNC || "",
							SYNC_TIME: date.convert( req.body.SYNC_TIME, 'YYYYMMDDhhmmss' ),
							INSERT_USER: req.body.INSERT_USER || "",
							INSERT_TIME: date.convert( req.body.INSERT_TIME, 'YYYYMMDDhhmmss' ),
							UPDATE_USER: req.body.INSERT_USER || "",
							UPDATE_TIME: date.convert( req.body.INSERT_TIME, 'YYYYMMDDhhmmss' ),
							DELETE_USER: "",
							DELETE_TIME: 0
						} );

						set.save()
						.then( data => {
							if ( !data ) {
								return res.send( {
									status: false,
									message: config.error_message.create_404,
									data: {}
								} );
							}

							res.send( {
								status: false,
								message: config.error_message.create_200,
								data: {}
							} );
						} ).catch( err => {
							res.send( {
								status: false,
								message: config.error_message.create_500,
								data: {}
							} );
						} );
					});
				}*/
				
			} );
		}
		else {
			res.send( {
				status: false,
				message: config.error_message.upload_406,
				data: {}
			} );
		}

	};

 	exports.createFile2 = ( req, res ) => {

		if( !req.files ) {
			return res.send( {
				status: false,
				message: config.error_message.invalid_input + 'REQUEST FILES.',
				data: {}
			} );
		}

		if ( !req.body.TR_CODE  ) {
			return res.send( {
				status: false,
				message: config.error_message.invalid_input + ' TR_CODE.',
				data: {}
			} );
		}

		var auth = req.auth;
		var file = req.files.FILENAME;
		var filename = String( file.name );

		
		
		/** 
		 * Check MIME Type
		 * Allowed MIME Type : ➤ IMAGE/JPEG
		 * 					   ➤ IMAGE/JPG
		 * ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬●
		 */
		
		if ( file.mimetype == 'image/jpeg' || file.mimetype == 'image/jpg' ) {
			
			var args = {
				headers: { "Content-Type": "application/json", "Authorization": req.headers.authorization }
			};

			var client = new Client();
			
			var new_filename = filename;
			var new_filename_rep = '';
			if ( file.mimetype == 'image/jpeg' ) {
				new_filename_rep = new_filename.replace( '.jpeg', '' );
			}
			else if ( file.mimetype == 'image/jpg' ) {
				new_filename_rep = new_filename.replace( '.jpg', '' );
			}
			
			
			const set = new imageUploadModel( {
				IMAGE_CODE: req.body.IMAGE_CODE,
				TR_CODE: req.body.TR_CODE || "",
				IMAGE_NAME: new_filename_rep,
				IMAGE_PATH: "",
				IMAGE_PATH_LOCAL: req.body.IMAGE_PATH_LOCAL || "",
				STATUS_IMAGE: req.body.STATUS_IMAGE || "",
				MIME_TYPE: "",
				STATUS_SYNC: req.body.STATUS_SYNC || "",
				SYNC_TIME: date.convert( req.body.SYNC_TIME, 'YYYYMMDDhhmmss' ),
				//SYNC_TIME: req.body.SYNC_TIME || 0,
				INSERT_USER: req.body.INSERT_USER || "",
				INSERT_TIME: date.convert( req.body.INSERT_TIME, 'YYYYMMDDhhmmss' ),
				//INSERT_TIME: req.body.INSERT_TIME || 0,
				UPDATE_USER: req.body.INSERT_USER || "",
				UPDATE_TIME: date.convert( req.body.INSERT_TIME, 'YYYYMMDDhhmmss' ),
				//UPDATE_TIME: req.body.INSERT_TIME || 0,
				DELETE_USER: "",
				DELETE_TIME: 0
			} );
				
			set.save()
			.then( data => {
				if ( !data ) {
					return res.send( {
						status: false,
						message: config.error_message.create_404,
						data: {}
					} );
				}
				
				var upload_folder = 'images-inspeksi';

				if ( String( req.body.TR_CODE.substr( 0, 1 ) ) == 'F' ) {
					upload_folder = 'images-finding';
				}
				else if ( String( req.body.TR_CODE.substr( 0, 1 ) ) == 'V' ) {
					upload_folder = 'images-ebcc';
				}
				
				var dir_date = date.convert( req.body.INSERT_TIME, 'YYYYMMDDhhmmss' ).substr( 0, 8 );
				var directory_local = '';
				if ( config.app_env == 'production' ) {
					directory_local = __basedir + '/assets/' + config.path_images.production + '/' + upload_folder + '/' + dir_date;
				}
				else if ( config.app_env == 'development' ) {
					directory_local = __basedir + '/assets/' + config.path_images.development + '/' + upload_folder + '/' + dir_date;
				}
 
				var directory_target_local = directory_local;
				var directory_project = upload_folder + '/' + dir_date;

				fServer.existsSync( directory_local ) || fServer.mkdirSync( directory_local );
				fServer.existsSync( directory_target_local ) || fServer.mkdirSync( directory_target_local );
				
				file.mv( directory_target_local + '/' + filename, function( err ) {
					
					if ( err ) {
						return res.send( {
							status: false,
							message: config.error_message.upload_404,
							data: {}
						} );
					}

					if ( directory_project == '' ) {
						res.json({
							message: "ERROR"
						})
					}
					//console.log(directory_project)

					fs.rename( directory_target_local + '/' + filename, directory_target_local + '/' + new_filename, function(err) {
						if ( err ) console.log( 'ERROR: ' + err );
					});

					console.log( '.-`-.-`-.-`-.-`-.-`-.-`-.-`-.-`-.-`-.' );
					console.log( 'New Filename : ' + new_filename_rep );
					console.log( 'Directory Project : ' + directory_project );
					console.log( '.-`-.-`-.-`-.-`-.-`-.-`-.-`-.-`-.-`-.' );

					imageUploadModel.findOneAndUpdate( { 
						IMAGE_CODE : req.body.IMAGE_CODE,
						IMAGE_NAME : new_filename,
						TR_CODE : req.body.TR_CODE
					}, {
						IMAGE_NAME : new_filename_rep,
						MIME_TYPE: file.mimetype,
						IMAGE_PATH : directory_project.toString(),
						UPDATE_USER: req.body.INSERT_USER || "",
						UPDATE_TIME: date.convert( req.body.SYNC_TIME, 'YYYYMMDDhhmmss' )
					}, { new: true } )
					.then( data => {
						if( !data ) {
							return res.send( {
								status: false,
								message: config.error_message.put_404,
								data: {}
							} );
						}

						res.send( {
							status: true,
							message: config.error_message.put_200,
							data: {}
						} );
						
					}).catch( err => {
						res.send( {
							status: false,
							message: config.error_message.put_500,
							data: {}
						} );
					});

				} );
				
			} ).catch( err => {
				console.log('catch_err');
				res.send( {
					status: false,
					message: config.error_message.create_500,
					data: {}
				} );
			} );
		}
		else {
			res.send( {
				status: false,
				message: config.error_message.upload_406,
				data: {}
			} );
		}

	};

 	