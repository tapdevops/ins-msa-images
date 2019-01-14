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
				/*if ( fs.existsSync( pth ) ) {
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
				}*/

				var type_tr = 'F';
				var path_tr = 'images-finding';
				if ( result.TR_CODE.substr( 0, 1 ) == 'I' ) {
					type_tr = 'I';
					path_tr = 'images-inspeksi';
				}

				results.push( {
					TR_CODE: result.TR_CODE,
					IMAGE_CODE: result.IMAGE_CODE,
					IMAGE_NAME: result.IMAGE_NAME,
					IMAGE_URL: req.protocol + '://' + req.get( 'host' ) + '/files/' + path_tr + '/' + result.TR_CODE + '/' + result.IMAGE_NAME
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
				console.log( result );
				var pth = result.IMAGE_PATH + '/' + result.IMAGE_NAME;
				console.log(pth);
				if ( fServer.existsSync( pth ) ) {
					var bitmap = fServer.readFileSync( pth );
					results.push( {
						IMAGE_CODE: result.IMAGE_CODE,
						IMAGE_NAME: result.IMAGE_NAME,
						IMAGE_SOURCE: 'data:' + result.MIME_TYPE + ';base64,' + new Buffer( bitmap ).toString( 'base64' )
					} );
				}
			} );
			res.send( {
				status: true,
				message: config.error_message.find_200,
				data: results,
				x: data
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
 * Untuk menyimpan data yang diupload
 * --------------------------------------------------------------------------
 */

 	exports.createFile = ( req, res ) => {

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
		var filename = file.name;
		
		/** 
		 * Check MIME Type
		 * Allowed MIME Type : ➤ IMAGE/JPEG
		 * 					   ➤ IMAGE/JPG
		 * ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬●
		 */
		
		if ( file.mimetype == 'image/jpeg' || file.mimetype == 'image/jpg' ) {
			
			var new_filename = req.body.TR_CODE + '_' + filename;
			var new_filename_rep = new_filename.replace( '.jpeg', new_filename.replace( '.jpg', '' ) );

			const set = new imageUploadModel( {
				IMAGE_CODE: req.body.IMAGE_CODE,
				TR_CODE: req.body.TR_CODE || "",
				IMAGE_NAME: new_filename_rep,
				IMAGE_PATH: "",
				STATUS_IMAGE: req.body.STATUS_IMAGE || "",
				MIME_TYPE: "",
				STATUS_SYNC: req.body.STATUS_SYNC || "",
				SYNC_TIME: date.convert( req.body.SYNC_TIME, 'YYYYMMDDhhmmss' ),
				INSERT_USER: req.body.INSERT_USER || "",
				INSERT_TIME: date.convert( req.body.SYNC_TIME, 'YYYYMMDDhhmmss' ),
				UPDATE_USER: req.body.INSERT_USER || "",
				UPDATE_TIME: date.convert( req.body.SYNC_TIME, 'YYYYMMDDhhmmss' ),
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
					upload_folder = 'images_finding';
				}

				var directory_local = __basedir + '/assets/images/' + upload_folder;
				var directory_target_local = directory_local + '/' + req.body.TR_CODE;

				console.log( __basedir );
				console.log( __rootdir );
				console.log( directory_local );
				console.log( directory_target_local );
				console.log( file );

				fServer.existsSync( directory_local ) || fServer.mkdirSync( directory_local );
				fServer.existsSync( directory_target_local ) || fServer.mkdirSync( directory_target_local );
				console.log('A');
				file.mv( directory_target_local + '/' + filename, function( err ) {
					console.log('--A');
					if ( err ) {
						return res.send( {
							status: false,
							message: config.error_message.upload_404,
							data: {}
						} );
					}
					console.log('----A');
					fs.rename( directory_target_local + '/' + filename, directory_target_local + '/' + new_filename, function(err) {
						if ( err ) console.log( 'ERROR: ' + err );
					});

					console.log( new_filename.replace( '.jpg', '' ) );
					console.log( new_filename.replace( '.jpeg', '' ) );
					//http://localhost:3011/finding/F0000005weR
					console.log('------A');

					var args = {
						headers: { "Content-Type": "application/json", "Authorization": req.headers.authorization }
					};

					var dp = [];
					console.log( 'DATA CLIENT --------------------------------------' )
					var client = new Client();
					client.get( 'http://149.129.245.230:3011/finding/F0000005weR', args, function (data, response) {
						// parsed response body as js object
						dp = data;
					});

					console.log( 'DATA PARSE ---------------------------------------' )
					console.log(dp)

					imageUploadModel.findOneAndUpdate( { 
						IMAGE_CODE : req.body.IMAGE_CODE,
						IMAGE_NAME : new_filename,
						TR_CODE : req.body.TR_CODE
					}, {
						MIME_TYPE: file.mimetype,
						IMAGE_PATH : directory_target_local,
						UPDATE_USER: req.body.INSERT_USER || "",
						UPDATE_TIME: date.convert( req.body.SYNC_TIME, 'YYYYMMDDhhmmss' ),
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
	exports.createFile3 = ( req, res ) => {

		if( !req.files ) {
			return res.send( {
				status: false,
				message: config.error_message.invalid_input + 'REQUEST FILES.',
				data: {}
			} );
		}

		var auth = req.auth;
		var file = req.files.filename;
		var filename = file.name;

		/** 
		 * Check MIME Type
		 * Allowed MIME Type : ➤ IMAGE/JPEG
		 * 					   ➤ IMAGE/JPG
		 * ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬●
		 */
		if ( file.mimetype == 'image/jpeg' || file.mimetype == 'image/jpg' ) {
			console.log( 'C' )
			/** 
			 * Check, apakah file ada didalam database.
			 * ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬●
			 */
			imageUploadModel.findOne( { 
				IMAGE_NAME : filename,
				DELETE_USER: ""
			} )
			.then( data => {
				console.log(data);
				if( !data ) {

					return res.send( {
						status: false,
						message: config.error_message.find_404 + 'AW',
						data: {}
					} );
				}

				console.log(data);
				var upload_folder = 'images-inspeksi';
				if ( String( data.TR_CODE.substr( 0, 1 ) ) == 'F' ) {
					console.log( 'E' )
					upload_folder = 'images_finding';
				}

				
				var directory_local = __basedir + '/assets/images/' + upload_folder;
				var directory_target_local = directory_local + '/' + data.TR_CODE;

				console.log( __basedir );
				console.log( __rootdir );
				console.log( directory_local );
				console.log( directory_target_local );
				console.log( file );

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

					imageUploadModel.findOneAndUpdate( { 
						IMAGE_CODE : data.IMAGE_CODE,
						TR_CODE : data.TR_CODE
					}, {
						MIME_TYPE: file.mimetype,
						IMAGE_PATH : directory_target_local,
						UPDATE_USER: auth.USER_AUTH_CODE,
						UPDATE_TIME: date.convert( 'now', 'YYYYMMDDhhmmss' )
					}, { new: true } )
					.then( data => {
						if( !data ) {
							console.log( 'G' )
							return res.send( {
								status: false,
								message: config.error_message.put_404,
								data: {}
							} );
						}

						console.log( 'H' )
						res.send( {
							status: true,
							message: config.error_message.put_200,
							data: {}
						} );
						
					}).catch( err => {
						console.log( 'I' )
						res.send( {
							status: false,
							message: config.error_message.put_500,
							data: {}
						} );
					});

					/** 
					 * Kirim file ke Server Images
					 * ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬●
					 */
					/*
						SSHClient.defaults({
							port: 22,
							host: '149.129.245.230',
							username: 'root',
							password: 'T4pagri123'
						});
						console.log(directory_target_server);
						console.log(directory_target_local + '/' + filename);

						SSHClient.mkdir( directory_target_server, function( err ) {
							if ( err ) {
								return res.send({
									status: false,
									message: "Error! Pembuatan direktori pada Server Images.",
									data: {},
								});
							}

							SSHClient.scp( directory_target_local + '/' + filename, {
								host: '149.129.245.230',
								username: 'root',
								password: 'T4pagri123',
								path: directory_target_server
							}, function( err ) {
								if ( err ) {
									return res.send({
										status: false,
										message: "Error! Pengiriman file gambar ke Server Images",
										data: {},
									});
								}
								res.send( {
									status: true,
									message: config.error_message.upload_200,
									data: {}
								} );
								
							});
						} );
					*/
				} );
			} ).catch( err => {
				console.log( 'J' )
				res.send( {
					status: false,
					message: config.error_message.find_500,
					data: {}
				} );
			} );
		}
		else {
			console.log( 'K' )
			res.send( {
				status: false,
				message: config.error_message.upload_406,
				data: {}
			} );
		}

	};

	exports.createFile2 = ( req, res ) => {

		console.log( 'A' )
		if( !req.files ) {
			return res.send( {
				status: false,
				message: config.error_message.invalid_input + 'REQUEST FILES.',
				data: {}
			} );
		}
		console.log( 'B' )
		var auth = req.auth;
		var file = req.files.filename;
		var filename = file.name;

		/** 
		 * Check MIME Type
		 * Allowed MIME Type : ➤ IMAGE/JPEG
		 * 					   ➤ IMAGE/JPG
		 * ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬●
		 */
		if ( file.mimetype == 'image/jpeg' || file.mimetype == 'image/jpg' ) {
			console.log( 'C' )
			/** 
			 * Check, apakah file ada didalam database.
			 * ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬●
			 */
			imageUploadModel.findOne( { 
				IMAGE_NAME : filename,
				DELETE_USER: ""
			} )
			.then( data => {
				console.log(data);
				if( !data ) {
					console.log( 'D' )
					return res.send( {
						status: false,
						message: config.error_message.find_404 + 'AW',
						data: {}
					} );
				}

				console.log(data);
				var upload_folder = 'images-inspeksi';
				if ( String( data.TR_CODE.substr( 0, 1 ) ) == 'F' ) {
					console.log( 'E' )
					upload_folder = 'images_finding';
				}

				
				var directory_local = __basedir + '/assets/images/' + upload_folder;
				var directory_target_local = directory_local + '/' + data.TR_CODE;

				console.log( __basedir );
				console.log( __rootdir );
				console.log( directory_local );
				console.log( directory_target_local );
				console.log( file );

				fServer.existsSync( directory_local ) || fServer.mkdirSync( directory_local );
				fServer.existsSync( directory_target_local ) || fServer.mkdirSync( directory_target_local );
				
				file.mv( directory_target_local + '/' + filename, function( err ) {
					console.log( 'F' )
					if ( err ) {
						return res.send( {
							status: false,
							message: config.error_message.upload_404,
							data: {}
						} );
					}

					imageUploadModel.findOneAndUpdate( { 
						IMAGE_CODE : data.IMAGE_CODE,
						TR_CODE : data.TR_CODE
					}, {
						MIME_TYPE: file.mimetype,
						UPDATE_USER: auth.USER_AUTH_CODE,
						UPDATE_TIME: date.convert( 'now', 'YYYYMMDDhhmmss' )
					}, { new: true } )
					.then( data => {
						if( !data ) {
							console.log( 'G' )
							return res.send( {
								status: false,
								message: config.error_message.put_404,
								data: {}
							} );
						}

						console.log( 'H' )
						res.send( {
							status: true,
							message: config.error_message.put_200,
							data: {}
						} );
						
					}).catch( err => {
						console.log( 'I' )
						res.send( {
							status: false,
							message: config.error_message.put_500,
							data: {}
						} );
					});

					/** 
					 * Kirim file ke Server Images
					 * ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬●
					 */
					/*
						SSHClient.defaults({
							port: 22,
							host: '149.129.245.230',
							username: 'root',
							password: 'T4pagri123'
						});
						console.log(directory_target_server);
						console.log(directory_target_local + '/' + filename);

						SSHClient.mkdir( directory_target_server, function( err ) {
							if ( err ) {
								return res.send({
									status: false,
									message: "Error! Pembuatan direktori pada Server Images.",
									data: {},
								});
							}

							SSHClient.scp( directory_target_local + '/' + filename, {
								host: '149.129.245.230',
								username: 'root',
								password: 'T4pagri123',
								path: directory_target_server
							}, function( err ) {
								if ( err ) {
									return res.send({
										status: false,
										message: "Error! Pengiriman file gambar ke Server Images",
										data: {},
									});
								}
								res.send( {
									status: true,
									message: config.error_message.upload_200,
									data: {}
								} );
								
							});
						} );
					*/
				} );
			} ).catch( err => {
				console.log( 'J' )
				res.send( {
					status: false,
					message: config.error_message.find_500,
					data: {}
				} );
			} );
		}
		else {
			console.log( 'K' )
			res.send( {
				status: false,
				message: config.error_message.upload_406,
				data: {}
			} );
		}

	};

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