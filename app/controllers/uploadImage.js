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
	const moment_pure = require( 'moment' );
	const moment = require( 'moment-timezone' );
	const fs = require( 'file-system' );
	const SSHClient = require( 'scp2' );
	const fServer = require( 'fs' );
	const path = require( 'path' );

	// Libraries
	const config = require( '../../config/config.js' );
	const date = require( '../libraries/date' );
	
	const dateAndTimes = require( 'date-and-time' );
	const randomTextLib = require( '../libraries/randomText' );

	// Variable
	var localdir = '/Users/mac/Documents/NodeJS/Microservices-TAP-MobileInspection-Dev/SourceImages';

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
		.limit( 20 )
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
				var pth = result.IMAGE_PATH + '/' + result.IMAGE_NAME;
				/*
				if ( fs.existsSync( pth ) ) {
					var bitmap = fServer.readFileSync( pth );

					results.push( {
						TR_CODE: result.TR_CODE,
						IMAGE_CODE: result.IMAGE_CODE,
						IMAGE_NAME: result.IMAGE_NAME,

						IMAGE_SOURCE: 'data:image/jpg;base64,' + new Buffer( bitmap ).toString( 'base64' )
					} );
				}
				else {
					results.push( {
						TR_CODE: result.TR_CODE,
						pth: pth,
						IMAGE_CODE: result.IMAGE_CODE,
						IMAGE_NAME: result.IMAGE_NAME,
					} );
				}
				*/

				var type_tr = 'F';
				var path_tr = 'finding';
				if ( result.TR_CODE.substr( 0, 1 ) == 'I' ) {
					type_tr = 'I';
					path_tr = 'inspeksi';
				}
				
				results.push( {
					TR_CODE: result.TR_CODE,
					IMAGE_CODE: result.IMAGE_CODE,
					IMAGE_NAME: result.IMAGE_NAME,
					IMAGE_PATH_LOCAL: result.IMAGE_PATH_LOCAL,
					IMAGE_URL: req.protocol + '://' + req.get( 'host' ) + '/files/' + result.IMAGE_PATH + '/' + result.IMAGE_NAME,
					STATUS_IMAGE: result.STATUS_IMAGE,
					STATUS_SYNC: result.STATUS_SYNC,
					INSERT_USER: result.INSERT_USER,
					INSERT_TIME: date.convert( String( result.INSERT_TIME ), 'YYYY-MM-DD hh:mm:ss' )
					//INSERT_TIME: result.INSERT_TIME || 0
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

 		console.log( req.header );
 		console.log( req.files );
 		console.log( req.body );

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
				
				var dir_date = date.convert( req.body.INSERT_TIME, 'YYYYMMDDhhmmss' ).substr( 0, 8 );
				console.log( dir_date );
				var directory_local = __basedir + '/assets/images/' + upload_folder + '/' + dir_date;
				console.log(directory_local)
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
						IMAGE_PATH : directory_project,
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

	
/**
 * createFile - Base64
 * Untuk menyimpan data yang diupload dengan BASE64
 * --------------------------------------------------------------------------
 */
 	exports.createFileWithBase64 = ( req, res ) => {
		var base64String = req.body.BASE64;
		var base64Image = base64String.split( ';base64,' ).pop();
		fs.writeFile( 'assets/' + req.body.FILENAME, base64Image, { encoding: 'base64' }, function(err) {
			res.json( {
				status: true,
				message: 'Success! ',
				data: []
			} )
		});
		

 	}
/**
 * createDesc
 * Untuk membuat dan menyimpan data baru
 * --------------------------------------------------------------------------
 */
	exports.createDesc = ( req, res ) => {
		if ( !req.body.TR_CODE  ) {
			return res.send( {
				status: false,
				message: config.error_message.invalid_input + ' TR_CODE.',
				data: {}
			} );
		}

		var auth = req.auth;
		var upload_folder = 'images-inspeksi';

		if ( String( req.body.TR_CODE.substr( 0, 1 ) ) == 'F' ) {
			upload_folder = 'images_finding';
		}

		const set = new imageUploadModel( {
			IMAGE_CODE: req.body.IMAGE_CODE,
			TR_CODE: req.body.TR_CODE || "",
			IMAGE_NAME: req.body.IMAGE_NAME || "",
			IMAGE_PATH: localdir + '/' + upload_folder,
			STATUS_IMAGE: req.body.STATUS_IMAGE || "",
			MIME_TYPE: "",
			STATUS_SYNC: req.body.STATUS_SYNC || "",
			SYNC_TIME: date.convert( req.body.SYNC_TIME, 'YYYYMMDDhhmmss' ),
			INSERT_USER: auth.USER_AUTH_CODE,
			INSERT_TIME: date.convert( 'now', 'YYYYMMDDhhmmss' ),
			UPDATE_USER: auth.USER_AUTH_CODE,
			UPDATE_TIME: date.convert( 'now', 'YYYYMMDDhhmmss' ),
			DELETE_USER: "",
			DELETE_TIME: 0,
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
				status: true,
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
	};







// Testing read base64 file
exports.readfile2 = ( req, res ) => {
		
	SSHClient.defaults({
		port: 22,
		host: '149.129.245.230',
		username: 'root',
		password: 'T4pagri123'
	});

	SSHClient.scp( {
		host: '149.129.245.230',
		username: 'root',
		password: 'T4pagri123',
		path: '/root/images-inspeksi/image.jpg'
	},'./', function( err ) {
		
		if ( err ) {
			return res.send({
				status: false,
				message: "SSH Error",
				data: {},
			});
		}

		//fs.unlink( 'assets/temp-images/' + filename, ( err ) => {
		//	if ( err ) throw err;
		//	console.log( 'assets/temp-images/' + filename );
		//} );

		res.send( {
			status: true,
			message: 'Success',
			data: {}
		} );
		
	});

	//SSHClient.scp( '/root/images-inspeksi/image.jpg', '/Users/mac/Documents/NodeJS/', function( err ) {
	//	console.log(err);
	//	console.log('A');
	//	if ( err ) {
	//		res.send({
	//			status: false,
	//			message: "SSH Error",
	//			data: {},
	//		});
	//	}
	//	res.send( {
	//		status: true,
	//		message: 'Success',
	//		err: err,
	//		data: {}
	//	} );
	//} );
};

// Testing read base64 file
exports.readfile = ( req, res ) => {
		
var appRoot = process.cwd();
	//console.log( __basedir );
	console.log( __basedir );
	console.log(process.cwd())
	//var bitmap = fServer.readFileSync( __basedir + '/assets/temp-images/image.jpg' );
	var bitmap = fServer.readFileSync( '/Users/mac/Documents/NodeJS/Microservices-TAP-MobileInspection-Dev/SourceImages/images-inspeksi/I0000002A0F/diagrum.jpg' );
	console.log( new Buffer( bitmap ).toString('base64')  );
	res.json( {
		message: 'Testing Read File base64 Encode',
		base64_encode: new Buffer( bitmap ).toString('base64')
	} );
};